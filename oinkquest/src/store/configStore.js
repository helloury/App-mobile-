import { CHAVES, carregarDado, salvarDado } from './storage';

// Config:
//  - salarioCentavos
//  - lancamentosFixos: [{ id, tipo: 'renda' | 'gasto', grupo: 'extra' | 'moradia' | 'contas' | 'streamings', descricao, valorCentavos }]
//  - tetoManualCentavos: null = usar o teto calculado; número = teto definido pelo usuário
//  - diaVirada: dia do mês em que o ciclo reinicia
const PADRAO = {
  onboardingConcluido: false,
  diaVirada: 1,
  salarioCentavos: 0,
  lancamentosFixos: [],
  tetoManualCentavos: null,
};

let config = { ...PADRAO };
const ouvintes = new Set();

function persistir() {
  salvarDado(CHAVES.config, config);
  ouvintes.forEach((fn) => fn());
}

// Valores derivados: nunca são salvos, sempre calculados a partir dos lançamentos.
export function calcularResumo(cfg) {
  const soma = (filtro) =>
    cfg.lancamentosFixos.filter(filtro).reduce((acc, l) => acc + l.valorCentavos, 0);
  const rendasExtras = soma((l) => l.tipo === 'renda');
  const gastosFixos = soma((l) => l.tipo === 'gasto');
  const rendaTotal = cfg.salarioCentavos + rendasExtras;
  const tetoCalculado = Math.max(0, rendaTotal - gastosFixos);
  const manual = cfg.tetoManualCentavos !== null && cfg.tetoManualCentavos !== undefined;
  return {
    rendaTotal,
    gastosFixos,
    moradia: soma((l) => l.grupo === 'moradia'),
    contas: soma((l) => l.grupo === 'contas'),
    streamings: soma((l) => l.grupo === 'streamings'),
    tetoCalculado,
    tetoManual: manual,
    teto: manual ? cfg.tetoManualCentavos : tetoCalculado,
  };
}

export const configStore = {
  async carregar() {
    const salvo = await carregarDado(CHAVES.config, {});
    config = { ...PADRAO, ...salvo };
    ouvintes.forEach((fn) => fn());
  },
  obter() {
    return config;
  },
  inscrever(fn) {
    ouvintes.add(fn);
    return () => ouvintes.delete(fn);
  },
  // CREATE (fim do onboarding)
  concluirOnboarding({ salarioCentavos, lancamentosFixos, diaVirada }) {
    config = {
      ...PADRAO,
      salarioCentavos,
      lancamentosFixos,
      diaVirada,
      onboardingConcluido: true,
    };
    persistir();
  },
  // UPDATE (null volta para o teto calculado automaticamente)
  definirTetoManual(centavos) {
    config = { ...config, tetoManualCentavos: centavos };
    persistir();
  },

  // Backup
  substituir(novo) {
    config = { ...PADRAO, ...novo };
    persistir();
  },
};
