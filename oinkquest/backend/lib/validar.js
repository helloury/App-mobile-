// Validação e normalização usadas pelo servidor (sem dependências externas).

export const CATEGORIAS_ACEITAS = ['alimentacao', 'transporte', 'lazer', 'contas', 'outros'];
export const TIPOS_IMAGEM = ['image/jpeg', 'image/png', 'image/webp'];
export const LIMITE_BASE64 = 6 * 1024 * 1024; // ~4,5 MB de imagem

// Valida o corpo da requisição. Retorna { ok: true, imagemBase64, mimeType } ou { ok: false, erro }.
export function validarRequisicao(corpo) {
  if (!corpo || typeof corpo !== 'object') return { ok: false, erro: 'Corpo da requisição inválido.' };
  const { imagemBase64, mimeType } = corpo;
  if (typeof imagemBase64 !== 'string' || imagemBase64.length === 0) {
    return { ok: false, erro: 'Envie a foto no campo "imagemBase64".' };
  }
  if (imagemBase64.length > LIMITE_BASE64) {
    return { ok: false, erro: 'A foto é muito grande. Tente uma imagem menor.' };
  }
  if (!/^[A-Za-z0-9+/=\s]+$/.test(imagemBase64)) {
    return { ok: false, erro: 'A imagem não está em base64 válido.' };
  }
  if (!TIPOS_IMAGEM.includes(mimeType)) {
    return { ok: false, erro: 'Formato de imagem não aceito. Use JPEG, PNG ou WebP.' };
  }
  return { ok: true, imagemBase64: imagemBase64.replace(/\s/g, ''), mimeType };
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

function dataValida(texto) {
  if (typeof texto !== 'string' || !ISO.test(texto)) return null;
  const [a, m, d] = texto.split('-').map(Number);
  const dt = new Date(a, m - 1, d);
  if (dt.getFullYear() !== a || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return texto;
}

// Converte a resposta do modelo em itens seguros. Descarta o que não for aproveitável.
// Valor sai em CENTAVOS (inteiro), no mesmo padrão do app.
export function normalizarItens(bruto) {
  const lista = Array.isArray(bruto?.itens) ? bruto.itens : [];
  const itens = [];
  for (const it of lista.slice(0, 30)) {
    const valor = typeof it?.valor === 'number' ? it.valor : Number(String(it?.valor ?? '').replace(',', '.'));
    if (!Number.isFinite(valor) || valor <= 0 || valor > 1_000_000) continue;
    const descricao = String(it?.descricao ?? '').trim().slice(0, 35) || 'Item da anotação';
    const categoria = CATEGORIAS_ACEITAS.includes(it?.categoria) ? it.categoria : 'outros';
    itens.push({
      descricao,
      valorCentavos: Math.round(valor * 100),
      categoria,
      dataGasto: dataValida(it?.data),
    });
  }
  return itens;
}
