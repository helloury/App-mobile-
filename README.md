# 🐷 OinkQuest

Aplicativo mobile de finanças pessoais, feito para ser **simples de usar e funcionar sem internet**. O usuário define sua renda e seus gastos fixos, recebe um teto mensal livre, registra os gastos do dia a dia, cria metas de economia e cumpre missões diárias, acompanhadas por um mascote porquinho animado.

## Tecnologias

| Tecnologia | Uso |
|---|---|
| React Native + Expo (JavaScript) | Base do aplicativo |
| Expo Router | Navegação entre telas (pilha + abas) |
| AsyncStorage (`@react-native-async-storage/async-storage`) | **Persistência local dos dados** |
| Lottie (`lottie-react-native`) | Animação do porquinho ao registrar gasto em uma meta |
| react-native-safe-area-context | Áreas seguras de tela |

## Funcionalidades implementadas até agora

### Onboarding (primeira abertura)
- Cadastro do salário e de rendas extras fixas.
- Cadastro de gastos fixos: moradia, contas básicas e assinaturas.
- Cálculo automático do **teto mensal livre** (renda total − gastos fixos).
- Escolha do **dia de virada do mês** (1 a 31), que define o ciclo de gastos.
- Aparece só na primeira vez. Depois o app abre direto no Painel.

### Painel
- Dinheiro disponível, teto mensal e barra de progresso com cores (verde, amarelo, vermelho).
- Considera apenas os gastos do **ciclo atual**.
- Resumo do ciclo: salário, moradia, contas e assinaturas.
- Total gasto por categoria, com filtro por toque.
- Lista de registros do ciclo: **toque para editar, segure para excluir**.
- Teto editável, com opção de voltar ao teto automático.
- Análise comparando os 3 últimos ciclos com o teto.
- Backup dos dados: exportar e restaurar.

### Registrar
- Teclado numérico próprio, descrição opcional e escolha de categoria.
- Data do gasto: Hoje ou Ontem.
- As metas criadas aparecem como categorias.
- Ao registrar um gasto em uma meta, toca a animação do porquinho (Lottie).
- Botão de leitura por câmera (OCR) ainda é apenas um protótipo.

### Metas
- Criação de cofres com nome e valor alvo.
- Progresso calculado automaticamente a partir dos gastos da meta.
- **Toque para editar, segure para excluir**. A exclusão preserva o histórico dos gastos.

### Missões
- Missões diárias com marcação de concluída.
- O progresso é guardado por dia, e o app mostra a **sequência de dias seguidos** com todas as missões concluídas.

## Persistência local de dados (Etapa 4)

Todos os dados são salvos no aparelho com **AsyncStorage** e permanecem disponíveis depois de fechar e reabrir o app. As operações de criar, armazenar, recuperar, atualizar, remover e apresentar dados estão implementadas nas quatro áreas do app (configuração, gastos, metas e missões).

Detalhes completos (justificativa, estrutura dos dados, operações, telas e como testar) em **[docs/etapa-04.md](docs/etapa-04.md)**.

### Decisões de modelagem
- **Dinheiro em centavos** (inteiros), sem erros de ponto flutuante.
- Categorias e metas com `id`, então renomear uma meta não quebra o histórico.
- Valores derivados (acumulado da meta, teto calculado, sequência de missões) **nunca são salvos**, sempre calculados.
- `dataGasto` (quando aconteceu) separada de `criadoEm` (quando foi registrado).
- Versão do esquema de dados (`VERSAO_ESQUEMA`), preparada para futuras migrações.

## Estrutura do projeto

```
src/
├── app/
│   ├── _layout.js            # carrega os dados salvos ao abrir o app
│   ├── onboarding.js         # configuração inicial
│   └── (tabs)/
│       ├── _layout.js        # abas
│       ├── index.js          # Painel
│       ├── registro.js       # Registrar gasto
│       ├── metas.js          # Metas
│       └── missoes.js        # Missões
├── store/
│   ├── storage.js            # camada única de leitura/escrita (AsyncStorage)
│   ├── configStore.js        # renda, gastos fixos, teto, dia de virada
│   ├── gastosStore.js        # gastos
│   ├── categoriasStore.js    # categorias fixas + metas
│   ├── missoesStore.js       # progresso das missões
│   ├── backup.js             # exportar/restaurar
│   └── useStore.js           # hook que atualiza a tela quando os dados mudam
└── utils/
    ├── dinheiro.js           # centavos <-> "R$ 12,50"
    ├── datas.js              # datas e cálculo do ciclo
    └── id.js                 # geração de identificadores
```

## Como executar

```bash
npm install
npx expo install @react-native-async-storage/async-storage
npx expo start
```

## Autora

Hillary Gramacho: Ciência da Computação, PUC Goiás.