// Datas são guardadas como texto ISO "AAAA-MM-DD" (data local), que ordena e compara corretamente como string.

const pad = (n) => String(n).padStart(2, '0');

export function paraISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function deISO(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
}

export function hojeISO() {
  return paraISO(new Date());
}

export function ontemISO() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return paraISO(d);
}

export function rotuloData(iso) {
  if (!iso) return '';
  if (iso === hojeISO()) return 'Hoje';
  if (iso === ontemISO()) return 'Ontem';
  return paraBR(iso);
}

export function paraBR(iso) {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

// "21/10/2026" -> "2026-10-21" (ou null se inválida)
export function deBR(texto) {
  const m = String(texto).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const d = Number(m[1]);
  const mo = Number(m[2]);
  const a = Number(m[3]);
  const dt = new Date(a, mo - 1, d);
  if (dt.getFullYear() !== a || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return paraISO(dt);
}

function rotuloCurto(iso) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

function ultimoDiaDoMes(ano, mes) {
  return new Date(ano, mes + 1, 0).getDate();
}

// Início do ciclo no mês dado (mes pode ser -1 ou 12: o Date ajusta o ano). Meses curtos usam o último dia.
function inicioCicloEm(ano, mes, dia) {
  const base = new Date(ano, mes, 1);
  const a = base.getFullYear();
  const m = base.getMonth();
  return new Date(a, m, Math.min(dia, ultimoDiaDoMes(a, m)));
}

// Ciclo mensal (que começa no "dia de virada") que contém a data informada.
export function cicloContendo(iso, diaVirada) {
  const ref = deISO(iso);
  let inicio = inicioCicloEm(ref.getFullYear(), ref.getMonth(), diaVirada);
  if (paraISO(inicio) > iso) {
    inicio = inicioCicloEm(ref.getFullYear(), ref.getMonth() - 1, diaVirada);
  }
  const prox = inicioCicloEm(inicio.getFullYear(), inicio.getMonth() + 1, diaVirada);
  const fim = new Date(prox.getFullYear(), prox.getMonth(), prox.getDate() - 1);
  return { inicio: paraISO(inicio), fim: paraISO(fim) };
}

export function cicloAnterior(ciclo, diaVirada) {
  const d = deISO(ciclo.inicio);
  d.setDate(d.getDate() - 1);
  return cicloContendo(paraISO(d), diaVirada);
}

export function dentroDoCiclo(iso, ciclo) {
  return iso >= ciclo.inicio && iso <= ciclo.fim;
}

export function rotuloCiclo(ciclo) {
  return `${rotuloCurto(ciclo.inicio)} – ${rotuloCurto(ciclo.fim)}`;
}
