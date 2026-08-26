#### 1 - Nome da aplicação: 
OinKquest

#### 2 - Problema que pretende resolver: 
A falta de engajamento a longo prazo na gestão financeira e a facilidade de registrar gastos manualmente em aplicativos complexos.

#### 3 - Público-alvo:
Pessoas que buscam uma organização financeira prática e diária, e que não se adaptaram às planilhas tradicionais ou apps engessados.

#### 4 - Objetivo principal:
Transformar o cuidado com o dinheiro em um hábito diário usando "fricção zero" no registro e gamificação focada em utilidade.

#### 5 - Principais funcionalidades:
Registro de despesas super rápido em "dois cliques", leitura semi-automática de notificações bancárias, captura opcional de anotações físicas via câmera (OCR), e sistema de progressão de perfil com missões financeiras.

#### 6 - Pelo menos 4 telas previstas:
1. Dashboard Principal: Indicadores de orçamento, perfil do usuário e feed narrativo.
2. Registro de Lançamentos: Teclado ágil, botão de câmera e microanimações.
3. Gestão de Metas: Acompanhamento de dívidas (passivos) e cofres de economia.
4. Missões: Tarefas práticas diárias e painel de conquistas/configurações.

#### 7 - Fluxo básico de navegação:
O usuário abre o aplicativo no Dashboard. A partir dele, um atalho rápido aciona a tela de Registro de Lançamentos em sobreposição. O menu inferior (Tabs) permite navegar de forma fluida para as telas de Gestão de Metas e Missões.

#### 8 - Tecnologia Mobile: 
React Native utilizando o framework Expo, com foco inicial em lançamento para Android.

#### 9 - Backend:
 Não haverá um backend.

#### 10 - Armazenamento de dados:
Banco de dados local, salvando as informações diretamente no celular do usuário.

#### 11 - APIs externas:
Sim. O projeto usará uma API de OCR para a leitura de textos pela câmera.

#### 12 - Estrutura de Diretórios
```text
oinkquest/
├── assets/                 
├── src/                    
│   ├── components/         
│   ├── screens/            
│   ├── navigation/         
│   ├── services/           
│   ├── utils/              
│   └── theme/              
├── App.js                  
├── app.json                
├── package.json