# Documentação de Desenvolvimento — Etapa 02: Interface e Componentização
**Aplicação:** Oinkquest  
**Plataforma / Framework:** React Native com Expo (Expo Router)  
**Ambiente Alvo:** Android Mobile  

---

## 1. Identificação das Telas Implementadas

Nesta etapa, foram implementadas as 4 telas navegáveis por meio do menu de abas inferior (*Bottom Tabs*), estruturadas no diretório `src/app/(tabs)/`:

1. **Painel Principal (`src/app/(tabs)/index.js`):** Atua como a tela inicial (*Dashboard*), apresentando o resumo do orçamento do mês, cartões horizontais de consumo por categorias com barras de preenchimento visual e a listagem de histórico das transações recentes.
2. **Registro Rápido (`src/app/(tabs)/registro.js`):** Focada na inserção ágil de despesas com "fricção zero". Contém visor de valor, seletor de categorias em formato de pílulas (*chips*), botão de atalho visual para leitura via câmera (OCR) e um teclado numérico customizado integrado à tela.
3. **Gestão de Metas (`src/app/(tabs)/metas.js`):** Exibe os objetivos de economia e amortização de dívidas (cofres de metas), detalhando o progresso proporcional de cada item com barras de carregamento e percentuais.
4. **Mural de Missões (`src/app/(tabs)/missoes.js`):** Interface voltada ao engajamento e disciplina financeira, com cartões de desafios diários (ex.: "Dia Sem Delivery") e botões interativos de alternância de conclusão (*checkbox*).

---

## 2. Descrição dos Principais Componentes Utilizados

A interface foi estruturada utilizando componentes primitivos do núcleo do React Native:

* **`View`:** Contêiner base para agrupamento, alinhamento estrutural e caixas de layout (*Flexbox*).
* **`Text`:** Responsável por toda a tipografia, valores monetários, rótulos e títulos hierárquicos.
* **`TouchableOpacity`:** Utilizado em todos os elementos clicáveis (teclas do teclado, atalhos de categoria, botão de OCR e caixas de verificação de missões), fornecendo feedback de opacidade imediato ao toque do usuário.
* **`ScrollView`:** Envolve o conteúdo rolável das telas de Dashboard, Metas e Missões, assegurando fluidez e prevenindo cortes de elementos.
* **`Tabs` e `Tabs.Screen` (`expo-router`):** Gerenciam o roteamento por abas inferiores nativas e a persistência do estado de navegação entre as telas.

---

## 3. Identificação dos Componentes Reutilizáveis

Para a padronização das telas e facilidade de manutenção futura, foram isolados os seguintes padrões de componentes:

* **Barra de Progresso Visual:** Estrutura composta por contêiner de fundo neutro e barra preenchida proporcionalmente (`width: ${percentual}%`), reaproveitada tanto nas categorias do Dashboard quanto nos cofres da tela de Metas.
* **Seletor em Pílulas (*Pills / Chips*):** Conjunto de botões de categoria que alternam estilo ativo/inativo dinamicamente (`botaoCategoria` vs. `botaoCategoriaAtivo`), padronizado para telas de seleção rápida.
* **Botão de Confirmação e Check:** Componente circular com ícone de marcação (`✓`) reaproveitável em listas de tarefas, missões e formulários.
* **Teclado Numérico Embutido:** Grid modular de 12 teclas (1 a 9, C, 0, OK) parametrizável para qualquer fluxo de entrada monetária sem dependência do teclado do sistema operacional.

---

## 4. Descrição dos Elementos de Entrada de Dados

Seguindo o princípio de "fricção zero" para agilizar o lançamento financeiro com uma única mão, os seguintes elementos foram integrados:

* **Visor Numérico Dinâmico com Teclado Embutido:** Na tela de Registro (`registro.js`), a digitação dispensa o teclado virtual do Android. O usuário utiliza um teclado próprio embutido na tela que manipula diretamente o estado (`valor`), com tecla de limpeza (`C`) e confirmação (`OK`).
* **Seletor Rápido de Categorias:** Botões de um toque que alteram o estado da categoria ativa sem necessidade de abrir caixas de diálogo suspensas (*Pickers* ou *Dropdowns*).
* **Atalho de Entrada por Imagem (Câmera / OCR):** Botão posicionado estrategicamente na tela de registro para acionamento do fluxo de captura de recibos ou post-its físicos via inteligência artificial.
* **Checkboxes Interativos:** Na tela de Missões, botões de toque que alternam o estado booleano de conclusão de cada tarefa diária com alteração visual de cor e texto tachado.

---

## 5. Estratégias para Adaptação de Layout (Responsividade)

Para garantir que a interface funcione uniformemente em múltiplos tamanhos de smartphones Android, foram adotadas as seguintes abordagens:

1. **Proteção contra Cortes com `useSafeAreaInsets`:** O hook de `react-native-safe-area-context` foi integrado no topo de cada tela (`paddingTop: insets.top`) e na base do layout de abas (`height: 68 + bottomInset`), evitando colisões com a câmera frontal (*notch*), barra de status e barra de gestos do Android.
2. **Dimensionamento Fluido com *Flexbox*:** Utilização estrita de contêineres elásticos (`flex: 1`), larguras percentuais e alinhamentos por distribuição (`justifyContent: 'space-between'`, `gap`), eliminando alturas e larguras fixas em pixels que quebrariam em resoluções menores.
3. **Contêineres com `ScrollView`:** Telas com listas verticais ou feeds são envolvidas por `ScrollView` com `contentContainerStyle` responsivo, garantindo rolagem natural em telas de proporções menores (ex.: 5.5 polegadas) ou sob configurações de fonte ampliada pelo sistema.

---

## 6. Instruções para Execução da Aplicação

### Pré-requisitos
* **Node.js** instalado no ambiente.
* Dispositivo físico Android com o aplicativo **Expo Go** instalado (via Google Play Store) ou emulador Android configurado via Android Studio.
* Smartphone e computador conectados na mesma rede Wi-Fi.

### Passo a Passo de Instalação e Execução
1. Acesse o diretório do projeto no terminal:
```
   cd oinkquest
```

2. instale as dependencia necessarias:
```
npm install
```

3. Inicie o servidor expo:
```
npx expo start
```

## 7. Principais Decisões de Interface Tomadas Nesta Etapa

* **Adoção do Padrão Expo Router:** Centralização das rotas e do menu de navegação dentro de src/app/(tabs)/, eliminando arquivos de configuração de rota legados e simplificando a alternância entre abas.

* **Teclado Numérico Próprio vs. Teclado Nativo:** Optou-se por desenhar um teclado numérico diretamente na tela de Registro. Isso evita o deslocamento brusco da tela causado pela abertura do teclado do sistema e permite lançamentos com menos toques.

* **Aplicação da Paleta Cherry Blossom / Fintech Clean:** Uso padronizado de fundo limpo (Branco Porcelana / #FAFAFA), com destaques e botões de ação principal em tonalidade cerejeira vibrante (#E83E8C) e indicadores positivos em verde suave (#20C997).

* **Estilos Locais na Prototipagem:** Manutenção dos objetos StyleSheet.create no final dos próprios arquivos das telas nesta fase, facilitando iterações rápidas antes da etapa de animações finais.