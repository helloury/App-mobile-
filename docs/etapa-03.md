# Documentação de Desenvolvimento — Etapa 03: Navegação, Telas e Experiência do Usuário (UX)

## 1. Descrição da Estrutura de Navegação Implementada

A navegação do projeto adota a arquitetura baseada no sistema de arquivos (*file-based routing*) provida nativamente pelo **Expo Router**. Essa abordagem elimina declaradores manuais como `<NavigationContainer>` e centraliza a árvore de rotas diretamente no diretório `src/app/`:

* **Layout Raiz (`src/app/_layout.js`):** Gerencia a pilha global de navegação (`Stack`) sem cabeçalhos nativos (`headerShown: false`). Declara as rotas de nível raiz `onboarding` e `(tabs)`, estabelecendo a rota inicial limpa para carregar os fluxos na ordem correta.
* **Roteamento de Abas (`src/app/(tabs)/_layout.js`):** Gerencia o agrupamento de rotas em abas inferiores (`Tabs`), mantendo as 4 interfaces principais instanciadas na memória em segundo plano para alternância instantânea.
* **Transição entre Fluxos e Passagem de Parâmetros:** A transição do onboarding inicial para o ambiente consolidado é feita via `router.replace({ pathname: '/', params: { ... } })`. Isso transfere os dados configurados (salário, moradia, contas, assinaturas, teto calculado e dia do ciclo) para a rota raiz das abas (`/`) e substitui o histórico de navegação, impedindo que o botão físico de voltar do Android retorne para a tela de boas-vindas.
* **Comunicação Reativa em Memória (`src/store/gastosStore.js`):** Como os dados ainda não utilizam banco de dados persistente, a comunicação entre a tela de Registro e o Dashboard ocorre via padrão Observer com métodos reativos (`adicionarGasto`, `removerGasto`, `obterGastos` e `inscrever`), sincronizando adições e exclusões em tempo real entre abas distintas.

---

## 2. Identificação das Telas e Respectivos Mecanismos de Acesso

O ecossistema do aplicativo é composto por 5 interfaces navegáveis:

| Identificação da Tela | Caminho do Arquivo | Mecanismo de Acesso / Rota | Descrição Funcional |
| :--- | :--- | :--- | :--- |
| **Configuração Inicial (Onboarding)** | `src/app/onboarding.js` | Rota direta da pilha raiz (`/onboarding`) | Formulário rolável em 4 passos com entrada de salário e rendas extras dinâmicas, despesas fixas pré-categorizadas, barra visual de teto automático travada contra edição e seletor numérico horizontal (1 a 31) para a virada do ciclo mensal. |
| **Painel Principal (Dashboard)** | `src/app/(tabs)/index.js` | Aba 1 do menu inferior (`/`) | Recebe os parâmetros do onboarding (ou fallback `'0'`), exibe o cartão unificado de saldo disponível vs. teto com barra dinâmica, resumo das categorias em tempo real, botão de análise histórica, estado de teto zerado com modal de ajuste e lista reativa de despesas recentes. |
| **Registro Rápido** | `src/app/(tabs)/registro.js` | Aba 2 do menu inferior (`/registro`) | Ponto de ação rápida com visor monetário, campo para descrição opcional do lançamento, pílulas de categorias, atalho de câmera (OCR) e teclado numérico customizado embutido na tela que despacha lançamentos manuais para a store global. |
| **Gestão de Metas** | `src/app/(tabs)/metas.js` | Aba 3 do menu inferior (`/metas`) | Visualização dos cofres de metas com barras de preenchimento percentual em verde suave e botão flutuante de ação rápida (FAB com `+`) posicionado no canto inferior direito para abertura de modal de inserção. |
| **Mural de Missões** | `src/app/(tabs)/missoes.js` | Aba 4 do menu inferior (`/missoes`) | Painel de desafios diários de economia e disciplina financeira, provido de botões circulares de alternância com efeito tachado e mudança de cor ao marcar tarefas concluídas. |

---

## 3. Descrição dos Menus, Abas e Outros Mecanismos de Navegação Utilizados

* **Menu Inferior de Abas (*Bottom Tabs Navigation*):**  
  Implementado via `expo-router` no arquivo `src/app/(tabs)/_layout.js`. Posicionado na base da tela com altura padronizada de 60px e espaçamento dinâmico para não conflitar com barras de navegação do Android. Apresenta rótulos legíveis e ícones temáticos:
  * Painel (`📊`)
  * Registrar (`➕`)
  * Metas (`🎯`)
  * Missões (`⚔️`)
* **Roteamento por Parâmetros de Navegação (*Search Params*):**  
  Utilização do hook `useLocalSearchParams()` no Dashboard para capturar a carga útil enviada pelo Onboarding, assegurando que o painel seja inicializado com os valores definidos pelo usuário sem depender de chamadas assíncronas a disco nesta fase.
* **Botão de Ação Flutuante (*Floating Action Button - FAB*):**  
  Posicionado com coordenadas absolutas no canto inferior direito da tela de Metas (`position: 'absolute'`, `bottom: 24`, `right: 20`), garantindo sobreposição constante sobre a lista rolável para acesso imediato ao formulário de criação de metas.
* **Camadas Modais Sobrepostas (*Modals*):**  
  * **Modal de Criação de Metas (`metas.js`):** Formulário sobreposto transparente (`fade`) para capturar título e alvo financeiro.
  * **Modal de Ajuste de Teto (`index.js`):** Janela suspensa acessível pelo atalho de lápis (`✏️`) no cartão de saldo ou pelo botão de teto zerado, permitindo atualizar o valor do teto mensal diretamente no Dashboard com foco automático no teclado.
* **Diálogos de Ação Nativa (`Alert.alert`):**  
  Utilizados tanto no acionamento do atalho de câmera OCR quanto no fluxo de exclusão de transações via confirmação destrutiva (`style: 'destructive'`).

---

## 4. Descrição dos Mecanismos de Feedback Visual Implementados

* **Cartão Unificado com Barra Dinâmica Invertida:**  
  No Dashboard, a barra de progresso opera de forma invertida para refletir disponibilidade de caixa: inicia cheia (100%) quando o teto está intocado e esvazia progressivamente à medida que gastos manuais são inseridos. A cor da barra adapta-se dinamicamente ao nível de segurança financeira:
  * Verde Suave (`#20C997`): Mais de 40% do orçamento disponível.
  * Amarelo Atenção (`#FFC107`): Entre 15% e 40% restante.
  * Vermelho Alerta (`#DC3545`): Menos de 15% de saldo livre.
  * Cinza Neutro (`#CED4DA`): Estado zerado (`limiteMensal === 0`).
* **Tratamento de Estado Vazio (*Zero-State*):**  
  Quando o teto não é preenchido no onboarding, o Dashboard renderiza um botão em destaque Rosa Cerejeira (`+ Definir Teto do Mês`) no lugar do botão de análise histórica. Da mesma forma, a lista de lançamentos exibe um bloco com mensagem instrutiva quando não há gastos cadastrados.
* **Filtro Interativo de Categorias com Destaque Cromático:**  
  Tocar em um dos cartões de categorias no Dashboard altera seu fundo para `#E83E8C` com texto branco, exibe o rótulo `Filtrado ✓` e restringe a lista inferior de lançamentos apenas aos itens pertencentes àquela categoria, exibindo o botão "Ver Todos" no cabeçalho.
* **Exclusão de Gastos por Toque Longo (*Long Press Feedback*):**  
  Lançamentos na lista de atividades recentes respondem ao toque prolongado (`delayLongPress={350}`), disparando um diálogo nativo com o nome e o valor da despesa antes de removê-la da memória e recalcular o saldo.
* **Checkboxes com Mudança Cromática e Texto Tachado:**  
  No Mural de Missões, o botão circular altera-se para `#20C997` com ícone `✓`, esmaece a opacidade do cartão (`0.7`) e aplica `textDecorationLine: 'line-through'` ao título da tarefa.
* **Seletor Horizontal de Ciclo (Carrossel 1 a 31):**  
  No Onboarding, os botões numéricos horizontais alternam de fundo neutro para Rosa Cerejeira preenchido (`#E83E8C`) ao toque, atualizando o texto de resumo do ciclo em tempo real.

---

## 5. Descrição das Principais Decisões de UX Adotadas

* **Onboarding Funcional em Página Única:**  
  Substituiu-se o formato de carrossel por um fluxo vertical contínuo e rolável com 4 blocos objetivos (Perfil/Rendas extras, Fixos, Teto e Ciclo), reduzindo cliques repetitivos e permitindo que o usuário visualize a interdependência dos cálculos em uma única rolagem.
* **Teto Inicial Não-Editável no Primeiro Acesso:**  
  No Onboarding, o teto mensal livre é rigorosamente calculado como $(\text{Renda Total} - \text{Custos Fixos})$ e renderizado em um visor estático não editável[cite: 1]. Essa restrição previne erros de digitação e incoerências matemáticas antes de o usuário conhecer o funcionamento do painel[cite: 1].
* **Flexibilidade Posterior no Dashboard:**  
  Embora o teto seja travado no primeiro cadastro, o Dashboard oferece total autonomia por meio do ícone de edição (`✏️`), permitindo reajustes de teto a qualquer momento via modal rápido.
* **Fricção Zero com Descrição Opcional:**  
  Na tela de Registro, o campo de texto para descrição é opcional e focado em brevidade (`maxLength={35}`). Caso o usuário deixe em branco e apenas digite o valor e a categoria no teclado numérico embutido, o aplicativo atribui automaticamente o título padrão (ex.: `Gasto em Alimentação`), permitindo lançamentos em menos de 3 segundos.
* **Eliminação Total de Dados Mockados:**  
  O Dashboard e as categorias foram desacoplados de arrays estáticos fictícios, iniciando com valores reais zerados e calculando somas e históricos exclusivamente a partir de ações manuais do usuário.
* **Identidade Visual Consistente (*Cherry Blossom*):**  
  Uso sistemático do fundo Branco Porcelana (`#FAFAFA`), destaques de ação em Rosa Cerejeira (`#E83E8C`), confirmações e saldos positivos em Verde Suave (`#20C997`) e avisos negativos em Vermelho Carmesim (`#DC3545`).

---

## 6. Descrição das Medidas de Acessibilidade Implementadas

* **Áreas de Toque Padronizadas (*Touch Targets*):**  
  Teclas numéricas embutidas (`48px` a `50px` de altura), botões de seleção de dia (`40x44px`), botão flutuante FAB (`58x58px`) e cartões de categorias mantêm dimensões amplas para facilitar a digitação tátil com uma única mão.
* **Proteção Ativa contra Entalhes com `useSafeAreaInsets`:**  
  Todas as 5 interfaces utilizam recuos dinâmicos (`paddingTop: insets.top` e `paddingBottom: insets.bottom`) fornecidos pela biblioteca `react-native-safe-area-context`, eliminando sobreposições com a barra de status, entalhes de câmera (*notch*) ou barras de gestos do Android.
* **Hierarquia Tipográfica de Alto Contraste:**  
  Textos principais utilizam tons escuros de alto contraste (`#212529` e `#343A40`) sobre o fundo claro (`#FAFAFA` e `#FFFFFF`), garantindo legibilidade sob iluminação solar diret. Informações auxiliares e metadados utilizam cinzas balanceados (`#6C757D` e `#ADB5BD`).
* **Tratamento de Transbordamento e Fontes Ampliadas:**  
  Contêineres de listagem adotam `ScrollView` com `showsVerticalScrollIndicator={false}`, enquanto títulos de transações utilizam a propriedade `numberOfLines={1}` com contêiner flexível, impedindo que textos longos quebrem a estrutura visual dos cartões.

---

## 7. Instruções para Execução e Teste da Navegação

### Pré-requisitos
* Node.js (versão 18 LTS ou superior) instalado no computador.
* Smartphone Android físico com o aplicativo **Expo Go** instalado (ou emulador Android configurado).
* Computador e celular conectados na mesma rede local (Wi-Fi).

### Passo a Passo de Execução
1. Acesse o diretório do projeto no terminal:
   ```bash
   cd oinkquest
   ''' 