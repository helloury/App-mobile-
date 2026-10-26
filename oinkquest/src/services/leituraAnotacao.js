import { API_URL, TEMPO_LIMITE_MS } from '../config/api';

// Categoria que o backend devolve -> id de categoria do app
const CATEGORIA_POR_NOME = {
  alimentacao: 'cat-alimentacao',
  transporte: 'cat-transporte',
  lazer: 'cat-lazer',
  contas: 'cat-contas',
};

// Erro com mensagem pronta para mostrar ao usuário
export class ErroLeitura extends Error {}

// Envia a foto ao backend e devolve a lista de itens detectados:
// [{ descricao, valorCentavos, categoriaId, dataGasto|null }]
export async function lerAnotacao({ base64, mimeType }) {
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);

  let resposta;
  try {
    resposta = await fetch(`${API_URL}/api/ler-anotacao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imagemBase64: base64, mimeType }),
      signal: controle.signal,
    });
  } catch (e) {
    if (e.name === 'AbortError') {
      throw new ErroLeitura('A leitura demorou demais. Tente de novo ou digite o valor.');
    }
    throw new ErroLeitura(
      'Sem conexão com o servidor. O app continua funcionando offline: digite o valor manualmente.'
    );
  } finally {
    clearTimeout(timer);
  }

  let dados = null;
  try {
    dados = await resposta.json();
  } catch {
    /* corpo vazio ou inválido: tratado abaixo */
  }

  if (!resposta.ok) {
    if (resposta.status === 429) {
      throw new ErroLeitura('Muitas leituras seguidas. Espere um pouco ou digite o valor.');
    }
    throw new ErroLeitura(dados?.erro || 'O servidor não conseguiu ler a foto. Tente de novo.');
  }

  const itens = Array.isArray(dados?.itens) ? dados.itens : [];
  return itens.map((it) => ({
    descricao: it.descricao,
    valorCentavos: it.valorCentavos,
    categoriaId: CATEGORIA_POR_NOME[it.categoria] || 'cat-alimentacao',
    dataGasto: it.dataGasto || null,
  }));
}
