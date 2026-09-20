// src/store/gastosStore.js

let listaGastos = [];
const ouvintes = new Set();

export const gastosStore = {
  obterGastos: () => listaGastos,

  adicionarGasto: (novoGasto) => {
    listaGastos = [novoGasto, ...listaGastos];
    ouvintes.forEach((callback) => callback(listaGastos));
  },

  // Nova função para deletar pelo identificador único
  removerGasto: (id) => {
    listaGastos = listaGastos.filter((g) => g.id !== id);
    ouvintes.forEach((callback) => callback(listaGastos));
  },

  inscrever: (callback) => {
    ouvintes.add(callback);
    return () => ouvintes.delete(callback);
  },
};