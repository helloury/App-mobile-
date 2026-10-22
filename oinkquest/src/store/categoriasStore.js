import { CHAVES, carregarDado, salvarDado } from './storage';
import { gerarId } from '../utils/id';

// Categorias fixas (constantes, não são salvas)
const BASE = [
  { id: 'cat-alimentacao', nome: 'Alimentação', tipo: 'base' },
  { id: 'cat-transporte', nome: 'Transporte', tipo: 'base' },
  { id: 'cat-lazer', nome: 'Lazer', tipo: 'base' },
  { id: 'cat-contas', nome: 'Contas', tipo: 'base' },
];

// Metas são categorias com um valor alvo. Salvas: { id, nome, alvoCentavos, arquivada }
// "arquivada" = meta excluída: some das telas, mas os gastos antigos mantêm o nome no histórico.
let metas = [];
const ouvintes = new Set();

function persistir() {
  salvarDado(CHAVES.categorias, metas);
  ouvintes.forEach((fn) => fn());
}

const normalizar = (t) =>
  String(t).trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export const categoriasStore = {
  async carregar() {
    metas = await carregarDado(CHAVES.categorias, []);
    ouvintes.forEach((fn) => fn());
  },
  inscrever(fn) {
    ouvintes.add(fn);
    return () => ouvintes.delete(fn);
  },

  // Categorias selecionáveis: fixas + metas ativas
  obterCategorias() {
    return [...BASE, ...metas.filter((m) => !m.arquivada).map((m) => ({ ...m, tipo: 'meta' }))];
  },
  obterMetas() {
    return metas.filter((m) => !m.arquivada);
  },
  obterPorId(id) {
    return BASE.find((c) => c.id === id) || metas.find((m) => m.id === id) || null;
  },
  nomeDe(id) {
    const c = this.obterPorId(id);
    return c ? c.nome : 'Sem categoria';
  },
  ehMeta(id) {
    return metas.some((m) => m.id === id && !m.arquivada);
  },

  // CREATE (retorna false se já existe categoria com o mesmo nome)
  adicionarMeta(nome, alvoCentavos) {
    if (this.obterCategorias().some((c) => normalizar(c.nome) === normalizar(nome))) return false;
    metas = [...metas, { id: gerarId(), nome: nome.trim(), alvoCentavos, arquivada: false }];
    persistir();
    return true;
  },
  // UPDATE (os gastos apontam para o id, então renomear não quebra o histórico)
  atualizarMeta(id, mudancas) {
    if (mudancas.nome) {
      const repetido = this.obterCategorias().some(
        (c) => c.id !== id && normalizar(c.nome) === normalizar(mudancas.nome)
      );
      if (repetido) return false;
    }
    metas = metas.map((m) =>
      m.id === id ? { ...m, ...mudancas, nome: (mudancas.nome ?? m.nome).trim() } : m
    );
    persistir();
    return true;
  },
  // DELETE lógico
  arquivarMeta(id) {
    metas = metas.map((m) => (m.id === id ? { ...m, arquivada: true } : m));
    persistir();
  },

  // Backup
  exportar() {
    return metas;
  },
  substituir(lista) {
    metas = lista;
    persistir();
  },
};
