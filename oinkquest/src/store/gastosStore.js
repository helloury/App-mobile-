import { CHAVES, carregarDado, salvarDado } from './storage';

// Gasto: { id, titulo, categoriaId, valorCentavos, dataGasto: "AAAA-MM-DD", criadoEm: timestamp }
//  - dataGasto: quando o gasto aconteceu (editável)
//  - criadoEm: quando foi registrado no app (automático, auditoria)
let gastos = [];
const ouvintes = new Set();

function persistir() {
  salvarDado(CHAVES.gastos, gastos);
  ouvintes.forEach((fn) => fn());
}

export function somar(lista) {
  return lista.reduce((acc, g) => acc + g.valorCentavos, 0);
}

export const gastosStore = {
  async carregar() {
    gastos = await carregarDado(CHAVES.gastos, []);
    ouvintes.forEach((fn) => fn());
  },
  obterGastos() {
    return gastos;
  },
  inscrever(fn) {
    ouvintes.add(fn);
    return () => ouvintes.delete(fn);
  },
  // CREATE
  adicionarGasto(gasto) {
    gastos = [{ criadoEm: Date.now(), ...gasto }, ...gastos];
    persistir();
  },
  // UPDATE
  atualizarGasto(id, mudancas) {
    gastos = gastos.map((g) => (g.id === id ? { ...g, ...mudancas } : g));
    persistir();
  },
  // DELETE
  removerGasto(id) {
    gastos = gastos.filter((g) => g.id !== id);
    persistir();
  },

  // Backup
  substituir(lista) {
    gastos = lista;
    persistir();
  },
};
