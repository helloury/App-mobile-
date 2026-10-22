// src/store/metasStore.js

let listaMetas = [];
const ouvintes = new Set();

export const metasStore = {
  obterMetas: () => listaMetas,

  adicionarMeta: (novaMeta) => {
    listaMetas = [...listaMetas, novaMeta];
    ouvintes.forEach((callback) => callback(listaMetas));
  },

  inscrever: (callback) => {
    ouvintes.add(callback);
    return () => ouvintes.delete(callback);
  },
};