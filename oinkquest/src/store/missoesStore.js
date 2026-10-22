import { CHAVES, carregarDado, salvarDado } from './storage';
import { hojeISO, paraISO } from '../utils/datas';

// Catálogo: define O QUE são as missões (fica no código).
export const CATALOGO = [
  { id: 'm1', titulo: 'Dia Sem Delivery', desc: 'Faça refeições em casa hoje.' },
  { id: 'm2', titulo: 'Registrar Todas as Compras', desc: 'Anote cada saída do dia no app.' },
  { id: 'm3', titulo: 'Revisar Assinaturas', desc: 'Verifique se há gastos automáticos esquecidos.' },
];

// Progresso: define O QUE O USUÁRIO FEZ e quando. Só guarda missões concluídas: { missaoId, data }.
// O histórico fica salvo, então dá para calcular sequência de dias.
let progresso = [];
const ouvintes = new Set();

function persistir() {
  salvarDado(CHAVES.missoes, progresso);
  ouvintes.forEach((fn) => fn());
}

function diaCompleto(iso) {
  return CATALOGO.every((m) => progresso.some((p) => p.missaoId === m.id && p.data === iso));
}

export const missoesStore = {
  async carregar() {
    progresso = await carregarDado(CHAVES.missoes, []);
    ouvintes.forEach((fn) => fn());
  },
  inscrever(fn) {
    ouvintes.add(fn);
    return () => ouvintes.delete(fn);
  },
  obterMissoesHoje() {
    const hoje = hojeISO();
    return CATALOGO.map((m) => ({
      ...m,
      concluida: progresso.some((p) => p.missaoId === m.id && p.data === hoje),
    }));
  },
  // Dias seguidos com todas as missões concluídas (hoje só conta se já estiver completo)
  obterSequencia() {
    const d = new Date();
    if (!diaCompleto(paraISO(d))) d.setDate(d.getDate() - 1);
    let n = 0;
    while (diaCompleto(paraISO(d))) {
      n += 1;
      d.setDate(d.getDate() - 1);
    }
    return n;
  },
  // UPDATE (marca/desmarca a missão de hoje)
  alternar(missaoId) {
    const hoje = hojeISO();
    const jaFeita = progresso.some((p) => p.missaoId === missaoId && p.data === hoje);
    progresso = jaFeita
      ? progresso.filter((p) => !(p.missaoId === missaoId && p.data === hoje))
      : [...progresso, { missaoId, data: hoje }];
    persistir();
  },

  // Backup
  exportar() {
    return progresso;
  },
  substituir(lista) {
    progresso = lista;
    persistir();
  },
};
