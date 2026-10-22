import AsyncStorage from '@react-native-async-storage/async-storage';

// Versão do esquema de dados. Ao mudar o formato dos dados, aumente este número
// e trate a migração em prepararStorage().
export const VERSAO_ESQUEMA = 2;

export const CHAVES = {
  versao: '@oinkquest:versao',
  gastos: '@oinkquest:v2:gastos',
  categorias: '@oinkquest:v2:categorias',
  config: '@oinkquest:v2:config',
  missoes: '@oinkquest:v2:missoes',
};

// Chaves do modelo antigo (só existiam em testes de desenvolvimento)
const CHAVES_LEGADO = [
  '@oinkquest:gastos',
  '@oinkquest:metas',
  '@oinkquest:config',
  '@oinkquest:missoes',
];

export async function prepararStorage() {
  try {
    const salva = parseInt((await AsyncStorage.getItem(CHAVES.versao)) || '0', 10);
    if (salva < 2) {
      await AsyncStorage.multiRemove(CHAVES_LEGADO);
    }
    // Futuras migrações entram aqui. Exemplo: if (salva < 3) { ...converter dados... }
    if (salva !== VERSAO_ESQUEMA) {
      await AsyncStorage.setItem(CHAVES.versao, String(VERSAO_ESQUEMA));
    }
  } catch (e) {
    console.warn('Falha ao preparar o armazenamento', e);
  }
}

export async function carregarDado(chave, padrao) {
  try {
    const bruto = await AsyncStorage.getItem(chave);
    return bruto !== null ? JSON.parse(bruto) : padrao;
  } catch (e) {
    console.warn('Falha ao ler', chave, e);
    return padrao;
  }
}

export async function salvarDado(chave, valor) {
  try {
    await AsyncStorage.setItem(chave, JSON.stringify(valor));
  } catch (e) {
    console.warn('Falha ao salvar', chave, e);
  }
}
