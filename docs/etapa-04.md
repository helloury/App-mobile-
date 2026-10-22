# Etapa 04: Persistência local de dados

## 1. Mecanismo de persistência utilizado

**AsyncStorage** (`@react-native-async-storage/async-storage`), o armazenamento chave-valor assíncrono e persistente do React Native/Expo. Os dados são guardados como texto JSON no próprio aparelho.

O acesso fica concentrado em um único arquivo, `src/store/storage.js`, com as funções `carregarDado`, `salvarDado` e `prepararStorage`. Os demais arquivos nunca chamam o AsyncStorage diretamente.

## 2. Justificativa da escolha

| Critério | Por que o AsyncStorage atende |
|---|---|
| Tecnologia do projeto | É o mecanismo padrão para React Native/Expo e funciona no Expo Go sem configuração nativa |
| Funcionamento offline | Totalmente local, sem servidor nem internet, que é a proposta do app |
| Volume de dados | Poucos registros (gastos, metas, configuração e progresso de missões), muito abaixo do limite do armazenamento |
| Formato dos dados | Objetos e listas pequenos, que se encaixam bem em JSON |
| Simplicidade | API com `getItem`, `setItem` e `multiRemove`, fácil de manter e de explicar |

**Alternativas consideradas**
- **SQLite:** mais poderoso para consultas e relacionamentos, mas exige mais código e configuração. Para este volume de dados, os filtros por ciclo e os totais por categoria são feitos em memória sem prejuízo.
- **SecureStore:** é voltado a segredos pequenos (tokens e senhas) e tem limite de tamanho, então não serve para listas de gastos.

**Limitações assumidas:** o AsyncStorage não criptografa os dados e não tem transações nem consultas. Por isso o app inclui **backup (exportar/restaurar)** e o esquema tem versão (`VERSAO_ESQUEMA`) para migrações futuras.

## 3. Estrutura dos dados armazenados

Os dados ficam em 5 chaves, definidas em `CHAVES` (`src/store/storage.js`). Todo valor em dinheiro é guardado em **centavos** (inteiro).

| Chave | Conteúdo |
|---|---|
| `@oinkquest:versao` | Versão do esquema (número) |
| `@oinkquest:v2:config` | Objeto com a configuração do onboarding |
| `@oinkquest:v2:gastos` | Lista de gastos |
| `@oinkquest:v2:categorias` | Lista de metas (categorias criadas pelo usuário) |
| `@oinkquest:v2:missoes` | Lista do progresso diário das missões |

### Configuração (`config`)
```json
{
  "onboardingConcluido": true,
  "diaVirada": 5,
  "salarioCentavos": 300000,
  "lancamentosFixos": [
    { "id": "lx1a2b", "tipo": "renda", "grupo": "extra", "descricao": "Renda extra #1", "valorCentavos": 50000 },
    { "id": "lx3c4d", "tipo": "gasto", "grupo": "moradia", "descricao": "Aluguel / Moradia", "valorCentavos": 120000 }
  ],
  "tetoManualCentavos": null
}
```
`tetoManualCentavos: null` significa teto automático (renda total − gastos fixos).

### Gasto (`gastos`)
```json
{
  "id": "lx5e6f",
  "titulo": "Almoço",
  "categoriaId": "cat-alimentacao",
  "valorCentavos": 3590,
  "dataGasto": "2026-10-22",
  "criadoEm": 1792665900000
}
```

### Meta (`categorias`)
```json
{ "id": "lx7g8h", "nome": "Notebook", "alvoCentavos": 500000, "arquivada": false }
```
As 4 categorias fixas (Alimentação, Transporte, Lazer, Contas) são constantes no código e não são salvas.

### Progresso de missões (`missoes`)
```json
{ "missaoId": "m1", "data": "2026-10-22" }
```
Só as missões **concluídas** são salvas. O catálogo (título e descrição) fica no código.

### Valores calculados (nunca salvos)
O acumulado de cada meta, o teto calculado, o total gasto no ciclo e a sequência de dias das missões são sempre calculados a partir dos dados acima, o que evita informações duplicadas e desencontradas.

## 4. Operações de persistência implementadas

| Operação | Onde está no código | Como funciona |
|---|---|---|
| **Criar** | `gastosStore.adicionarGasto`, `categoriasStore.adicionarMeta`, `configStore.concluirOnboarding`, `missoesStore.alternar` | Cria o registro em memória e chama `persistir()` |
| **Armazenar** | `salvarDado()` em `storage.js` | Converte para JSON e grava com `AsyncStorage.setItem` |
| **Recuperar** | `carregar()` de cada store, chamado em `src/app/_layout.js` | Ao abrir o app, lê tudo do AsyncStorage antes de mostrar qualquer tela |
| **Atualizar** | `gastosStore.atualizarGasto`, `categoriasStore.atualizarMeta`, `configStore.definirTetoManual`, `missoesStore.alternar` | Altera o registro e grava de novo |
| **Remover** | `gastosStore.removerGasto`, `categoriasStore.arquivarMeta`, `missoesStore.alternar` (desmarcar) | Remove o registro, ou arquiva no caso da meta para preservar o histórico, e grava de novo |
| **Apresentar** | `useStore()` + leitura dos stores nas telas | A tela é redesenhada automaticamente sempre que um dado muda |

Outros pontos:
- `prepararStorage()` confere a versão do esquema ao abrir o app e é o ponto para futuras migrações.
- `backup.js` exporta todos os dados em um único JSON (`exportarBackup`) e restaura com validação (`importarBackup`).

## 5. Telas que utilizam os dados persistidos

| Tela | Arquivo | Dados usados | Operações |
|---|---|---|---|
| Onboarding | `src/app/onboarding.js` | config | Criar |
| Painel | `src/app/(tabs)/index.js` | config, gastos, categorias | Apresentar, atualizar (gasto e teto), remover (gasto), backup |
| Registrar | `src/app/(tabs)/registro.js` | gastos, categorias | Criar gasto |
| Metas | `src/app/(tabs)/metas.js` | categorias, gastos | Criar, apresentar, atualizar, remover (arquivar) |
| Missões | `src/app/(tabs)/missoes.js` | missões | Apresentar, atualizar (marcar/desmarcar) |
| Layout raiz | `src/app/_layout.js` | todos | Recuperar ao abrir o app |

---




