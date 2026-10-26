import { CATEGORIAS_ACEITAS } from './validar.js';

const MODELO = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const URL_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const INSTRUCAO = `Você lê fotos de anotações de gastos (cadernos, recibos, listas) escritas em português do Brasil.
Extraia cada gasto como um item com: "descricao" (curta), "valor" (número em reais, ex.: 12.5), "categoria" e "data".
Categorias permitidas: ${CATEGORIAS_ACEITAS.join(', ')}. Use "outros" se não souber.
"data" no formato AAAA-MM-DD, ou null se a anotação não tiver data.
Ignore totais, saldos e textos que não sejam gastos. Se não houver gastos legíveis, devolva {"itens": []}.
Nunca invente valores: só inclua o que estiver escrito na imagem.`;

const ESQUEMA = {
  type: 'OBJECT',
  properties: {
    itens: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          descricao: { type: 'STRING' },
          valor: { type: 'NUMBER' },
          categoria: { type: 'STRING', enum: CATEGORIAS_ACEITAS },
          data: { type: 'STRING', nullable: true },
        },
        required: ['descricao', 'valor', 'categoria'],
      },
    },
  },
  required: ['itens'],
};

export class ErroGemini extends Error {
  constructor(mensagem, status) {
    super(mensagem);
    this.status = status;
  }
}

// Chama a API do Gemini com a imagem e devolve o JSON bruto { itens: [...] }.
export async function lerAnotacao({ imagemBase64, mimeType }, { chave, fetchImpl = fetch, timeoutMs = 25000 } = {}) {
  if (!chave) throw new ErroGemini('Servidor sem chave da API configurada.', 500);

  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), timeoutMs);
  let resposta;
  try {
    resposta = await fetchImpl(`${URL_BASE}/${MODELO}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': chave },
      signal: controle.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: INSTRUCAO },
              { inline_data: { mime_type: mimeType, data: imagemBase64 } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
          responseMimeType: 'application/json',
          responseSchema: ESQUEMA,
        },
      }),
    });
  } catch (e) {
    if (e.name === 'AbortError') throw new ErroGemini('A leitura demorou demais.', 504);
    throw new ErroGemini('Não foi possível falar com a API do Gemini.', 502);
  } finally {
    clearTimeout(timer);
  }

  if (resposta.status === 429) throw new ErroGemini('Limite de leituras da API atingido.', 429);
  if (!resposta.ok) {
    console.error('Gemini respondeu', resposta.status, (await resposta.text()).slice(0, 300));
    throw new ErroGemini('A API do Gemini recusou a leitura.', 502);
  }

  const dados = await resposta.json();
  const texto = dados?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!texto) return { itens: [] };
  try {
    return JSON.parse(texto);
  } catch {
    throw new ErroGemini('Resposta da leitura veio em formato inesperado.', 502);
  }
}
