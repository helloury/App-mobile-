# Etapa 06: Integração com serviço externo

## 1. Serviço externo utilizado

| Item | Descrição |
|---|---|
| Serviço | **Google Gemini API** (modelo configurável; padrão `gemini-3.5-flash-lite`) |
| Finalidade | Reconhecer o texto de uma foto de anotação de gastos (OCR) e devolvê-lo como JSON estruturado |
| Como o app acessa | De forma indireta: o app chama o backend próprio do OinkQuest, e o backend chama o Gemini |
| Por que passa pelo backend | A chave da API fica só no servidor. Se estivesse no app, qualquer pessoa poderia extraí-la do aplicativo instalado |
| Autenticação | Chave de API (`GEMINI_API_KEY`), enviada pelo backend no cabeçalho `x-goog-api-key` |

Resumo da arquitetura:

```
App (React Native)  ──HTTP──▶  Backend OinkQuest (Node.js)  ──HTTPS──▶  Gemini API (Google)
 telas e AsyncStorage          validação, limite de uso, chave           leitura da imagem
```

O restante do app (gastos, metas, missões, painel) continua funcionando **offline**. Apenas a leitura de anotações por foto usa a rede.

## 2. Endereços (base URL)

| Serviço | Base URL | Como é definida |
|---|---|---|
| Backend OinkQuest | `http://<IP-DO-COMPUTADOR>:3000` (desenvolvimento) | Variável `EXPO_PUBLIC_API_URL` no `.env` do app |
| Gemini API | `https://generativelanguage.googleapis.com/v1beta/models/<modelo>:generateContent` | Fixa no código do backend. O modelo vem de `GEMINI_MODEL` |

No celular, `localhost` não funciona. É preciso usar o IP do computador que roda o backend, na mesma rede Wi-Fi.

## 3. Endpoints e métodos HTTP

### 3.1 Backend OinkQuest (usado pelo app)

| Método | Endpoint | Operação | Usado pelo app? |
|---|---|---|---|
| `POST` | `/api/ler-anotacao` | **Envio de dados:** envia a foto e recebe os gastos lidos | Sim |
| `GET` | `/saude` | **Consulta:** informa se o servidor está no ar | Não. Serve para testar o servidor manualmente |

Qualquer outra rota responde `404`.

### 3.2 Gemini API (usado pelo backend)

| Método | Endpoint | Operação |
|---|---|---|
| `POST` | `/v1beta/models/<modelo>:generateContent` | Envia a imagem e as instruções, e recebe o texto extraído em JSON |

## 4. Estrutura dos dados

### 4.1 App → Backend: `POST /api/ler-anotacao`

Cabeçalho: `Content-Type: application/json`

```json
{
  "imagemBase64": "/9j/4AAQSkZJRgABAQ...",
  "mimeType": "image/jpeg"
}
```

| Campo | Tipo | Regra |
|---|---|---|
| `imagemBase64` | texto | Obrigatório. Imagem em Base64 puro (sem o prefixo `data:`). Máximo de 6 MB de texto (cerca de 4,5 MB de imagem) |
| `mimeType` | texto | Obrigatório. Um entre `image/jpeg`, `image/png` e `image/webp` |

### 4.2 Backend → App: resposta de sucesso (`200`)

```json
{
  "itens": [
    {
      "descricao": "Almoço",
      "valorCentavos": 3590,
      "categoria": "alimentacao",
      "dataGasto": "2026-10-20"
    },
    {
      "descricao": "Ônibus",
      "valorCentavos": 450,
      "categoria": "transporte",
      "dataGasto": null
    }
  ]
}
```

| Campo | Tipo | Observação |
|---|---|---|
| `descricao` | texto | Até 35 caracteres |
| `valorCentavos` | inteiro | Valor em **centavos** (R$ 35,90 vira `3590`), o mesmo padrão do app |
| `categoria` | texto | `alimentacao`, `transporte`, `lazer`, `contas` ou `outros` |
| `dataGasto` | texto ou `null` | Formato `AAAA-MM-DD`. `null` quando a anotação não tem data |

Quando a foto não contém gastos legíveis, a resposta é `{ "itens": [] }`.

### 4.3 Backend → App: resposta de erro

```json
{ "erro": "Formato de imagem não aceito. Use JPEG, PNG ou WebP." }
```

### 4.4 Backend → Gemini (resumo da requisição)

Cabeçalhos: `Content-Type: application/json` e `x-goog-api-key: <chave>` (a chave nunca aparece no código nem no Git).

```json
{
  "contents": [{ "parts": [
    { "text": "<instruções para extrair os gastos>" },
    { "inline_data": { "mime_type": "image/jpeg", "data": "<imagem em Base64>" } }
  ]}],
  "generationConfig": {
    "temperature": 0,
    "responseMimeType": "application/json",
    "responseSchema": { "...": "lista de itens com descricao, valor, categoria e data" }
  }
}
```

A resposta do Gemini traz, em `candidates[0].content.parts[0].text`, um texto JSON com `itens[]`, onde `valor` está em reais (por exemplo, `35.9`).

### 4.5 Tratamento dos dados recebidos

| Etapa | Regra |
|---|---|
| Backend | Descarta itens com valor não numérico, zero, negativo ou acima de R$ 1.000.000 |
| Backend | Categoria desconhecida vira `outros`. Data impossível (como 31/02) vira `null`. No máximo 30 itens |
| App | A categoria vira o `id` de categoria do app (por exemplo, `alimentacao` vira `cat-alimentacao`). `outros` vira Alimentação, e o usuário pode trocar na conferência |
| App | O usuário confere e edita cada item **antes** de salvar. Data no futuro ou ausente vira a data de hoje |

## 5. Fluxo de comunicação

1. O usuário abre **Registrar** e toca em **📷 Fotografar Anotação**.
2. O app pede a foto (câmera ou galeria) com `expo-image-picker`, com qualidade de 50% e em Base64.
3. O app mostra o estado de **carregamento** e envia `POST /api/ler-anotacao` ao backend, com limite de 30 segundos.
4. O backend valida o pedido (JSON, tamanho, Base64, tipo da imagem) e confere o limite de 10 leituras por minuto por IP.
5. O backend envia a imagem ao Gemini (limite de 25 segundos) e recebe o JSON com os itens.
6. O backend valida e normaliza os itens e responde ao app.
7. O app mapeia as categorias e abre a tela **"Confira os gastos lidos"**.
8. O usuário corrige, remove ou adiciona itens e confirma. Só então os gastos são gravados no AsyncStorage e aparecem no Painel.

```
Usuário      App                    Backend                 Gemini
   │ foto ───▶ │                        │                       │
   │           │── POST /api/ler-... ──▶│                       │
   │ (carrega) │                        │── POST :generate... ─▶│
   │           │                        │◀──── JSON (itens) ────│
   │           │◀──── 200 {itens} ──────│                       │
   │◀ conferir │                        │                       │
   │ confirma ▶│ grava no AsyncStorage  │                       │
```

## 6. Tratamento dos estados

| Estado | Quando ocorre | O que o usuário vê | Onde está no código |
|---|---|---|---|
| **Carregamento** | Do envio da foto até a resposta | Janela escura com indicador e o texto "Lendo a anotação..." | `registro.js` (variável `lendo`) |
| **Sucesso** | O backend devolve 1 ou mais itens | Abre a tela "Confira os gastos lidos". Depois de salvar, aparece "Gastos salvos! 🐷" com o botão "Ver no Painel" | `registro.js`, `RevisaoLeitura.js` |
| **Erro** | Falha de rede, tempo esgotado, limite de uso, erro do servidor ou do Gemini | Alerta "Não foi possível ler" com a mensagem em português da tabela abaixo. O registro manual continua disponível | `leituraAnotacao.js`, `registro.js` |
| **Ausência de dados** | O backend responde `itens: []` | Alerta "Nada encontrado", com a dica de usar uma foto mais nítida, com boa luz, ou digitar o valor | `registro.js` |

### Mensagens de erro e suas causas

| Causa | Código | Mensagem mostrada |
|---|---|---|
| Sem internet ou servidor desligado | (sem resposta) | "Sem conexão com o servidor. O app continua funcionando offline: digite o valor manualmente." |
| App esperou mais de 30 s | (tempo esgotado) | "A leitura demorou demais. Tente de novo ou digite o valor." |
| Mais de 10 leituras por minuto, ou limite gratuito do Gemini | `429` | "Muitas leituras seguidas. Espere um pouco ou digite o valor." |
| JSON quebrado, foto ausente, Base64 inválido ou tipo não aceito | `400` | Mensagem enviada pelo backend |
| Foto grande demais | `413` | "A foto é muito grande." |
| Falha ou recusa do Gemini | `502` | "A API do Gemini recusou a leitura." |
| Gemini demorou mais de 25 s | `504` | "A leitura demorou demais." |
| Servidor sem chave configurada ou erro interno | `500` | Mensagem enviada pelo backend |
| Permissão da câmera negada | (local) | Alerta explicando como permitir, com as alternativas galeria e digitação |
| Foto cancelada | (local) | Nada acontece, e o usuário volta à tela |

## 7. Segurança e privacidade

- A chave do Gemini existe **apenas** no `.env` do backend, que está no `.gitignore` e nunca vai para o repositório.
- O backend **não guarda** fotos nem gastos. Os dados do usuário ficam só no aparelho (AsyncStorage).
- Há limite de 10 leituras por minuto por IP e de 6 MB por requisição, para proteger a cota gratuita.
- Na camada gratuita, o Google pode usar o conteúdo enviado para melhorar seus produtos. Por isso, evite fotografar anotações com dados pessoais sensíveis.

## 8. Configuração do serviço

Nenhuma credencial é colocada no código ou neste documento. Cada pessoa usa a própria chave.

### Backend (`oinkquest/backend/.env`)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `GEMINI_API_KEY` | Sim | Chave gratuita gerada em https://aistudio.google.com/apikey |
| `GEMINI_MODEL` | Não | Modelo do Gemini. Padrão: `gemini-3.5-flash-lite` |
| `PORT` | Não | Porta do servidor. Padrão: `3000` |

### App (`oinkquest/.env`, criado a partir de `.env.example`)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Sim | Endereço do backend, por exemplo `http://192.168.0.15:3000` (IP do computador na rede Wi-Fi) |

Para descobrir o IP no Windows, rode `ipconfig` e use o "Endereço IPv4" do adaptador Wi-Fi. Os adaptadores de VirtualBox, VMware e WSL não servem.

