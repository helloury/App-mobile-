// Todo valor em dinheiro é guardado em CENTAVOS (número inteiro) para evitar erros de ponto flutuante.
// Só na tela o valor vira "R$ 12,50".

// Aceita "12,50", "12.50", "1.500,00" ou "1500". Retorna centavos inteiros (nunca negativo).
export function paraCentavos(texto) {
  if (texto === null || texto === undefined) return 0;
  let s = String(texto).trim().replace(/\s/g, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const m = s.match(/^(\d*)(?:\.(\d*))?$/);
  if (!m || (!m[1] && !m[2])) return 0;
  const reais = parseInt(m[1] || '0', 10);
  const centavos = parseInt(((m[2] || '') + '00').slice(0, 2), 10);
  return reais * 100 + centavos;
}

// 1250 -> "R$ 12,50"
export function formatar(centavos) {
  const valor = Math.round(Number(centavos) || 0);
  const negativo = valor < 0;
  const abs = Math.abs(valor);
  const reais = String(Math.floor(abs / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const cents = String(abs % 100).padStart(2, '0');
  return `${negativo ? '-' : ''}R$ ${reais},${cents}`;
}

// 1250 -> "12,50" (para preencher campos de edição)
export function paraTexto(centavos) {
  const abs = Math.abs(Math.round(Number(centavos) || 0));
  return `${Math.floor(abs / 100)},${String(abs % 100).padStart(2, '0')}`;
}
