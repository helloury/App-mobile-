# Etapa 05: Primeira versão funcional com backend

## 1. Arquitetura

```
┌──────────────────────┐   POST /api/ler-anotacao    ┌────────────────────┐   generateContent   ┌─────────────┐
│  App (React Native)  │ ──────── JSON + foto ─────▶ │  Backend (Node.js) │ ───────────────────▶│ Gemini API  │
│  telas, navegação,   │ ◀──── itens (centavos) ──── │  validação, limite │ ◀── JSON estruturado │  (Google)   │
│  AsyncStorage        │                              │  de uso, chave     │                      └─────────────┘
└──────────────────────┘                              └────────────────────┘
```

**Divisão de responsabilidades**

| Camada | Responsabilidade |
|---|---|
| Frontend (app) | Telas e navegação, câmera/galeria, revisão dos itens, regras de negócio do orçamento (ciclo, teto, metas, missões) e **persistência local** (AsyncStorage). Funciona offline. |
| Backend | Guardar a chave da API do Gemini, validar a foto recebida, pedir a leitura ao Gemini, validar/normalizar a resposta e limitar o uso. |
| Gemini API | Reconhecer o texto da foto e devolvê-lo como JSON estruturado. |

A chave da API fica só no backend (arquivo `.env`, fora do Git). Se ela estivesse no app, qualquer pessoa poderia extraí-la do aplicativo instalado.

## 2. Fluxo completo de negócio implementado

**Registrar gastos a partir de uma anotação e acompanhá-los até a exclusão:**
fotografar → ler no backend → conferir/editar → confirmar → ver no Painel → alterar → excluir.

Ele cobre os exemplos do enunciado: *selecionar → preencher → confirmar → visualizar resultado* (leitura e revisão) e *criar → visualizar → alterar → excluir* (gastos no Painel).

### Passo a passo para executar

1. Inicie o backend e o app (seção 7).
2. Na primeira abertura, conclua o **onboarding** (salário, gastos fixos, dia de virada).
3. Abra a aba **Registrar** e toque em **📷 Fotografar Anotação**.
4. Escolha **Tirar foto** (permita a câmera) ou **Galeria**.
5. Aguarde o aviso **“Lendo a anotação...”**.
6. Na tela **“Confira os gastos lidos”**, corrija descrição, valor e categoria de cada item, remova o que estiver errado ou toque em **+ Adicionar linha**.
7. Toque em **Salvar N gastos**. Aparece a confirmação **“Gastos salvos!”**; toque em **Ver no Painel**.
8. No **Painel**, os gastos aparecem na lista do ciclo e o saldo/barra de progresso já refletem o total.
9. **Alterar:** toque em um gasto para editar. **Excluir:** segure o gasto e confirme.
10. Feche e reabra o app: os gastos continuam lá (AsyncStorage).

## 3. Funcionalidades integradas nesta etapa

| Etapa | Funcionalidade | Como entra no fluxo |
|---|---|---|
| 2/3 | Telas, navegação por abas, teclado numérico, categorias, metas, missões | O Registrar mantém o registro manual; a leitura por foto é uma segunda forma de criar gastos. Itens podem ser atribuídos a metas. |
| 4 | Persistência local (AsyncStorage), dinheiro em centavos, ciclo por dia de virada, backup | Os gastos lidos são salvos pelo mesmo `gastosStore`, usando as mesmas regras (centavos, `dataGasto`, ciclo). |
| 5 | **Backend + leitura por foto** | Novo: `backend/`, `services/leituraAnotacao.js`, `components/RevisaoLeitura.js` e o fluxo no `registro.js`. |

O botão de câmera, que era só um protótipo (um alerta), agora executa a leitura de verdade.

## 4. Tratamento de entradas inválidas

**No app**

| Situação | Comportamento |
|---|---|
| Valor zero no registro manual | Aviso “Digite um valor maior que zero.” |
| Permissão da câmera negada | Explica o que fazer e sugere galeria ou digitação manual |
| Foto cancelada ou ilegível | Volta à tela sem alterar nada / aviso “Foto inválida” |
| Foto sem gastos reconhecíveis | “Nada encontrado”, com dica de foto mais nítida |
| Valor vazio, zero ou texto na revisão | Borda vermelha e mensagem “Informe um valor maior que zero.”; o botão de salvar não avança |
| Descrição vazia na revisão | Mensagem “Informe uma descrição.” |
| Data lida da anotação no futuro ou inválida | Usa a data de hoje |

**No backend** (`backend/lib/validar.js`)

| Situação | Resposta |
|---|---|
| JSON quebrado ou sem foto | `400` com mensagem |
| Tipo diferente de JPEG/PNG/WebP | `400` |
| Base64 inválido | `400` |
| Foto acima do limite (~4,5 MB) | `413` / `400` |
| Mais de 10 leituras por minuto do mesmo IP | `429` |
| Rota inexistente | `404` |

A saída do Gemini também é validada: valores não numéricos, zero ou negativos são descartados, categorias desconhecidas viram “outros”, datas impossíveis (ex.: 31/02) viram `null`, descrições são cortadas em 35 caracteres e no máximo 30 itens são aceitos.

## 5. Mecanismos de feedback

- **Indicador de carregamento** (“Lendo a anotação...”) enquanto o backend responde.
- **Mensagens de erro em português** para cada falha (sem internet, tempo esgotado, limite de uso, servidor).
- **Validação visual** na revisão (borda vermelha + texto do erro).
- **Resumo ao vivo** na revisão: quantidade de gastos e total em reais.
- **Confirmação de sucesso** com atalho para o Painel.
- **Animação do porquinho** (Lottie) mantida ao registrar um gasto manual em uma meta.

## 6. Principais decisões técnicas

| Decisão | Justificativa |
|---|---|
| Backend em **Node.js sem dependências** (`http` e `fetch` nativos) | Mesma linguagem do app (JavaScript), nada para instalar, fácil de explicar e de testar. |
| **Gemini** como serviço de leitura | Possui camada gratuita; entende manuscrito e devolve JSON estruturado via `responseSchema`. Modelo configurável por `GEMINI_MODEL`. |
| Chave só no servidor (`.env`, fora do Git) | Segurança: o app instalado não carrega segredo. |
| **Revisão obrigatória** antes de salvar | OCR de manuscrito erra; o usuário confirma, então o dado salvo é sempre o que ele aprovou. |
| Backend devolve valores em **centavos** | Mantém o padrão numérico do app e evita erro de ponto flutuante. |
| Backend **não guarda dados** | A fonte da verdade continua sendo o AsyncStorage; o app segue offline. A foto não é armazenada pelo servidor. |
| Limite de 10 leituras/min por IP | Protege a cota gratuita do Gemini. |
| Dados e limites validados nos dois lados | O app valida para dar feedback; o servidor valida porque não pode confiar no cliente. |
| `expo-image-picker` | Câmera e galeria com permissões tratadas, funciona no Expo Go. |
| Foto enviada com qualidade 50% em base64 | Reduz tamanho e tempo de envio sem prejudicar a leitura. |

**Limitações assumidas:** o servidor precisa estar acessível na rede do celular (em desenvolvimento, o IP do computador); não há login, então o limite por IP é a única proteção; a foto é enviada ao Google, então o usuário deve evitar fotografar anotações com dados pessoais sensíveis, pois na camada gratuita o Google pode usar o conteúdo para melhorar seus produtos.

## 7. Instruções para execução e teste

Está no README.md

### Testes automatizados do backend
```bash
cd oinkquest/backend
npm test
```
São 8 testes (sem usar internet nem a chave real; o Gemini é simulado): conversão para centavos, descarte de dados inválidos, validação da requisição, rota de saúde, resposta de sucesso, erros `400`, `429`/`502` e `404`.

### Roteiro de teste manual

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Fotografar uma anotação legível com 2 ou 3 gastos | Lista na tela de conferência |
| 2 | Alterar um valor e remover um item | Total no rodapé atualiza |
| 3 | Apagar o valor de um item e tocar em Salvar | Borda vermelha e mensagem; nada é salvo |
| 4 | Corrigir e salvar | Confirmação “Gastos salvos!” e Painel com os gastos |
| 5 | Tocar em um gasto, alterar e salvar | Valor atualizado no Painel |
| 6 | Segurar um gasto e confirmar a exclusão | Gasto some e o saldo se recalcula |
| 7 | Fechar e reabrir o app | Dados continuam |
| 8 | Desligar o backend e tentar ler uma foto | Mensagem de falta de conexão; registro manual segue funcionando |
| 9 | Negar a permissão da câmera | Mensagem explicando e alternativas |
| 10 | Fotografar algo sem gastos (ex.: uma parede) | “Nada encontrado” |

