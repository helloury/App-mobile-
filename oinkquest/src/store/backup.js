import { gastosStore } from './gastosStore';
import { categoriasStore } from './categoriasStore';
import { configStore } from './configStore';
import { missoesStore } from './missoesStore';
import { VERSAO_ESQUEMA } from './storage';

// Gera um JSON com todos os dados do app (para guardar em outro lugar).
export function exportarBackup() {
  return JSON.stringify(
    {
      app: 'oinkquest',
      versao: VERSAO_ESQUEMA,
      exportadoEm: new Date().toISOString(),
      config: configStore.obter(),
      categorias: categoriasStore.exportar(),
      gastos: gastosStore.obterGastos(),
      missoes: missoesStore.exportar(),
    },
    null,
    2
  );
}

// Valida e restaura um backup. Substitui todos os dados atuais.
export async function importarBackup(texto) {
  let d;
  try {
    d = JSON.parse(texto);
  } catch (e) {
    return { ok: false, erro: 'O texto colado não é um JSON válido.' };
  }

  if (
    !d ||
    d.app !== 'oinkquest' ||
    !d.config ||
    !Array.isArray(d.categorias) ||
    !Array.isArray(d.gastos) ||
    !Array.isArray(d.missoes)
  ) {
    return { ok: false, erro: 'Esse texto não parece um backup do OinkQuest.' };
  }
  if (d.versao > VERSAO_ESQUEMA) {
    return { ok: false, erro: 'Esse backup é de uma versão mais nova do app.' };
  }

  const gastosValidos = d.gastos.every(
    (g) =>
      typeof g.id === 'string' &&
      typeof g.categoriaId === 'string' &&
      Number.isInteger(g.valorCentavos) &&
      typeof g.dataGasto === 'string'
  );
  if (!gastosValidos) {
    return { ok: false, erro: 'Há gastos com formato inválido no backup.' };
  }

  configStore.substituir(d.config);
  categoriasStore.substituir(d.categorias);
  gastosStore.substituir(d.gastos);
  missoesStore.substituir(d.missoes);
  return { ok: true };
}
