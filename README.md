# 🐷 OinkQuest

Aplicativo mobile de finanças pessoais, feito para ser **simples de usar e funcionar sem internet**. O usuário define sua renda e seus gastos fixos, recebe um teto mensal livre, registra os gastos do dia a dia, cria metas de economia e cumpre missões diárias, acompanhadas por um mascote porquinho animado.

## Tecnologias

| Tecnologia | Uso |
|---|---|
| React Native + Expo (JavaScript) | Base do aplicativo |
| Expo Router | Navegação entre telas (pilha + abas) |
| AsyncStorage (`@react-native-async-storage/async-storage`) | **Persistência local dos dados** |
| Lottie (`lottie-react-native`) | Animação do porquinho ao registrar gasto em uma meta |
| expo-image-picker | Câmera e galeria para fotografar anotações |
| Node.js (`backend/`, sem dependências) | Backend que recebe a foto e a envia ao Gemini |
| Google Gemini API | Leitura (OCR) das anotações de gastos |
| react-native-safe-area-context | Áreas seguras de tela |

## Funcionalidades implementadas até agora

### Onboarding (primeira abertura)
- Cadastro do salário e de rendas extras fixas.
- Cadastro de gastos fixos: moradia, contas básicas e assinaturas.
- Cálculo automático do **teto mensal livre** (renda total − gastos fixos).
- Escolha do **dia de virada do mês** (1 a 31), que define o ciclo de gastos.
- Aparece só na primeira vez (dá para pular deixando em branco e configurar depois). Depois o app abre direto no Painel.

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
- **Leitura de anotação por foto :** fotografe (ou escolha da galeria) uma anotação de gastos; o backend lê com o Gemini, você confere e corrige os itens e só então eles são salvos.

### Metas
- Criação de cofres com nome e valor alvo.
- Progresso calculado automaticamente a partir dos gastos da meta.
- **Toque para editar, segure para excluir**. A exclusão preserva o histórico dos gastos.

### Missões
- Missões diárias com marcação de concluída.
- O progresso é guardado por dia, e o app mostra a **sequência de dias seguidos** com todas as missões concluídas.

## Estrutura do projeto

```
src/
├── app/
│   ├── _layout.js            # carrega os dados salvos ao abrir o app
│   ├── onboarding.js         # configuração inicial
│   ├── configurar.js         # editar configuração (aberta pelo Painel)
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
├── services/
│   └── leituraAnotacao.js    # chamada ao backend (timeout, erros em português)
├── components/
│   ├── FormConfiguracao.js   # formulário usado no onboarding e na edição
│   └── RevisaoLeitura.js     # tela de conferência dos itens lidos
├── config/
│   └── api.js                # endereço do backend
└── utils/
    ├── dinheiro.js           # centavos <-> "R$ 12,50"
    ├── datas.js              # datas e cálculo do ciclo
    └── id.js                 # geração de identificadores

backend/                       # (fica ao lado de src/, dentro de oinkquest/)
├── server.js                 # servidor HTTP: /saude e /api/ler-anotacao
├── lib/
│   ├── gemini.js             # chamada à API do Gemini
│   └── validar.js            # validação da entrada e normalização da saída
├── test/backend.test.js      # testes automatizados (node --test)
└── .env.example              # modelo de configuração (a chave real fica em .env)
```

## Como executar

**1. Backend** (precisa do Node 20.6+ e de uma chave gratuita do Gemini em https://aistudio.google.com/apikey):

```bash
cd oinkquest/backend
cp .env.example .env        # edite o .env e cole a GEMINI_API_KEY
npm start                   # sobe em http://localhost:3000
```

**2. App:**

```bash
cd oinkquest
npm install
npx expo install @react-native-async-storage/async-storage expo-image-picker
cp .env.example .env        # ajuste EXPO_PUBLIC_API_URL para o IP do seu computador
npx expo start
```

Celular e computador precisam estar na mesma rede Wi-Fi. Para testar o backend sozinho: `cd oinkquest/backend && npm test`.

## Autora

Hillary Gramacho: Ciência da Computação, PUC Goiás.