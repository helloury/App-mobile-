// Backend do OinkQuest: recebe a foto de uma anotação, lê com o Gemini e devolve os gastos.
// Sem dependências externas: usa apenas o Node 18+ (http e fetch nativos).
import http from 'node:http';
import { validarRequisicao, normalizarItens, LIMITE_BASE64 } from './lib/validar.js';
import { lerAnotacao, ErroGemini } from './lib/gemini.js';

const JANELA_MS = 60_000;
const MAX_POR_JANELA = 10;

export function criarServidor({ chave = process.env.GEMINI_API_KEY, fetchImpl = fetch } = {}) {
  const acessos = new Map(); // ip -> [timestamps]

  function limitado(ip) {
    const agora = Date.now();
    const recentes = (acessos.get(ip) || []).filter((t) => agora - t < JANELA_MS);
    recentes.push(agora);
    acessos.set(ip, recentes);
    return recentes.length > MAX_POR_JANELA;
  }

  function responder(res, status, objeto) {
    const texto = JSON.stringify(objeto);
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(texto);
  }

  function lerCorpo(req) {
    return new Promise((resolve, reject) => {
      let total = 0;
      const partes = [];
      req.on('data', (p) => {
        total += p.length;
        if (total > LIMITE_BASE64 + 1024) {
          reject(Object.assign(new Error('grande'), { status: 413 }));
          req.destroy();
          return;
        }
        partes.push(p);
      });
      req.on('end', () => resolve(Buffer.concat(partes).toString('utf8')));
      req.on('error', reject);
    });
  }

  return http.createServer(async (req, res) => {
    try {
      if (req.method === 'GET' && req.url === '/saude') {
        return responder(res, 200, { ok: true, servico: 'oinkquest-backend' });
      }

      if (req.method === 'POST' && req.url === '/api/ler-anotacao') {
        if (limitado(req.socket.remoteAddress)) {
          return responder(res, 429, { erro: 'Muitas leituras seguidas. Espere um minuto.' });
        }

        let corpo;
        try {
          corpo = JSON.parse(await lerCorpo(req));
        } catch (e) {
          if (e.status === 413) return responder(res, 413, { erro: 'A foto é muito grande.' });
          return responder(res, 400, { erro: 'JSON inválido.' });
        }

        const valido = validarRequisicao(corpo);
        if (!valido.ok) return responder(res, 400, { erro: valido.erro });

        const bruto = await lerAnotacao(valido, { chave, fetchImpl });
        return responder(res, 200, { itens: normalizarItens(bruto) });
      }

      responder(res, 404, { erro: 'Rota não encontrada.' });
    } catch (e) {
      if (e instanceof ErroGemini) return responder(res, e.status, { erro: e.message });
      console.error(e);
      responder(res, 500, { erro: 'Erro interno do servidor.' });
    }
  });
}

// Só sobe o servidor quando o arquivo é executado direto (não nos testes).
if (process.argv[1]?.endsWith('server.js')) {
  if (!process.env.GEMINI_API_KEY) {
    console.error('Defina GEMINI_API_KEY antes de iniciar (veja backend/.env.example).');
    process.exit(1);
  }
  const porta = Number(process.env.PORT) || 3000;
  criarServidor().listen(porta, '0.0.0.0', () => console.log(`Backend no ar na porta ${porta}`));
}
