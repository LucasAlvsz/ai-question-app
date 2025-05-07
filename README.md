# AI Question App

Aplicação **Fullstack Serverless** que permite usuários enviarem perguntas e receberem respostas de uma IA, de forma assíncrona. Utiliza uma arquitetura desacoplada baseada em **AWS Lambda**, **DynamoDB** e **SNS**, promovendo escalabilidade, manutenção simples e performance.

## ![demonstração](/readme-utils/chat.gif)

---

## 🧠 Funcionalidades

- Interface simples para **envio de perguntas**
- Armazenamento das perguntas e respostas em **DynamoDB**
- Processamento da pergunta via **modelo de IA** (HuggingFace, OpenAI, etc.)
- **Notificação de resposta** com web socket

---

## 📡 API REST – Endpoints

A aplicação expõe um endpoint HTTP via **API Gateway**, configurado explicitamente (sem proxy) para lidar com as perguntas enviadas pelo usuário.

### ▶️ `POST /questions`

Envia uma nova pergunta para ser processada.

#### 🔸 **Request body**

```json
{
  "question": {
    "content": "Qual a capital da França?",
    "userId": "5f69efc4-cc52-4f8e-a4a1-7589f4910a0f"
  },
  "provider": "HUGGINGFACE"
}
```

> 🔄 O campo `provider` é opcional — por padrão, usa `HUGGINGFACE`.

---

### 🛑 Erros comuns

- `400 Bad Request`: corpo inválido ou campos obrigatórios ausentes
- `500 Internal Server Error`: erro inesperado ao salvar no banco ou publicar no SNS

---

## 🔌 API WebSocket – Conexão em Tempo Real

A aplicação utiliza **API Gateway WebSocket** para enviar respostas de IA em tempo real aos usuários conectados.

A Lambda `notify-user` é responsável por lidar com todas as rotas do WebSocket, incluindo conexões, desconexões, subscrições e o envio de mensagens quando uma resposta estiver disponível.

---

### 📡 Rotas WebSocket

| Rota          | Tipo   | Descrição                                        |
| ------------- | ------ | ------------------------------------------------ |
| `$connect`    | System | Executada quando o cliente estabelece a conexão. |
| `$disconnect` | System | Executada quando o cliente encerra a conexão.    |
| `subscribe`   | Custom | Associa o `userId` ao `connectionId` no banco.   |
| `$default`    | System | Rota fallback para mensagens sem rota definida.  |

---

### 🔄 Subscrição (`subscribe`)

O client deve enviar uma mensagem com seu `userId` logo após se conectar, por exemplo:

```json
{
  "action": "subscribe",
  "userId": "5f69efc4-cc52-4f8e-a4a1-7589f4910a0f"
}
```

Isso permite mapear o `connectionId` ao `userId` no DynamoDB, possibilitando a entrega de respostas posteriormente.

---

### 📤 Notificação via SNS

Quando a IA responde uma pergunta, a Lambda `answer-processor` publica um evento no **tópico SNS de perguntas respondidas**.
A Lambda `notify-user` consome esse evento e envia a resposta via WebSocket usando a `connectionId` armazenada no momento da subscrição.

## 🧱 Arquitetura

## ![arquitetura](/readme-utils/arquitetura.png)

## 📁 Estrutura de Pastas

A arquitetura de pastas do projeto segue os princípios de **Clean Architecture**, com separação clara de responsabilidades, visando **escalabilidade**, **testabilidade** e **baixa acoplamento** entre os componentes.

### 📁 `app/`

Contém toda a lógica de negócio da aplicação.

- **`entities/`**
  Define os _modelos de domínio_ (ex: `Question`) com suas regras e invariantes.

- **`events/`**
  Contém os modelos e mapeamentos de eventos utilizados entre Lambdas (ex: mensagens SNS).

- **`lambdas/`**
  Contém a implementação das funções Lambda divididas por contexto.

  - `question-handler/`: recebe perguntas e publica no SNS.
  - `answer-processor/`: processa perguntas pendentes e responde via API de IA.
  - `notify-user/`: envia a resposta ao usuário via WebSocket.

- **`modules/`**
  Agrupa funcionalidades que encapsulam lógica por contexto de domínio (ex: `question`, `answer`) — opcionalmente usado para organizar em domínios mais coesos.

- **`repositories/`**
  Abstrações e implementações para acesso a dados (ex: `DynamoDB`), promovendo separação entre infraestrutura e regra de negócio.

- **`services/`**
  Responsável por encapsular integrações com sistemas externos e internos, promovendo isolamento da lógica de negócio.

- **`use-cases/`**
  Camada que implementa os casos de uso da aplicação — define o comportamento da regra de negócio em resposta a uma intenção específica (ex: “registrar pergunta”, “processar resposta da IA”, “notificar usuário”).

- **`shared/`**
  Código utilitário e reutilizável em diferentes partes da aplicação (ex: helpers genéricos, config).

- **`validations/`**
  Validadores e schemas para entrada e saída de dados (ex: zod, Joi), garantindo consistência.

- **`tests/`**
  Testes unitários da camada de aplicação, organizados por contexto.

---

### 📁 `infra/`

Contém a infraestrutura como código (IaC), utilizando CDK.

- **`bin/`**
  Arquivo de entrada principal do CDK (`deploy.ts`), que instancia as stacks.

- **`constants/`**
  Variáveis globais usadas na infraestrutura (ex: nomes de tabelas, tópicos SNS, etc).

- **`helpers/`**
  Funções auxiliares para reutilizar lógica de provisionamento.

- **`stacks/`**
  Define as stacks da AWS (ex: API Gateway, Lambdas, DynamoDB, SNS), separadas por responsabilidade.

- **`tests/`**
  Testes de infraestrutura, como snapshots ou testes de integração com a AWS.

---

Essa organização de projeto foi pensada para maximizar a escalabilidade, legibilidade e manutenibilidade do código ao longo do tempo. Ao separar responsabilidades em camadas claras — como use-cases, services, repositories, favorecemos a adesão aos princípios de Clean Code, como Single Responsibility, Separation of Concerns e Dependency Inversion.

Cada Lambda é tratada como uma orquestradora leve que aciona casos de uso bem definidos, promovendo a reutilização da lógica de negócio entre diferentes contextos. Isso também permite testar funcionalidades de forma isolada e eficiente, sem depender de infraestrutura real durante o desenvolvimento.

Além disso, manter a infraestrutura desacoplada da aplicação, com provisionamento declarativo, facilita o versionamento, o reuso de recursos e a automação via CI/CD. Essa estrutura promove baixa fricção evolutiva, ou seja, mudanças em uma parte do sistema tendem a ter impacto mínimo nas demais, acelerando a evolução e garantindo segurança nas entregas.

---

## 📈 Propostas de Melhorias para Escalabilidade

Conforme a aplicação cresce e o volume de perguntas aumenta, é importante garantir que o sistema seja resiliente, desacoplado e escalável. Abaixo estão algumas melhorias propostas com foco em escalabilidade:

---

### 📨 1. Adicionar uma fila SQS entre o `question-handler` e o `answer-processor`

**Problema atual:**
Atualmente, a comunicação entre Lambdas é feita via **SNS**, que é orientado a _push_ e invoca imediatamente os consumidores. Isso pode causar:

- Concorrência desnecessária (várias instâncias processando ao mesmo tempo).
- Falta de controle de retry granular.
- Dificuldade em lidar com picos de tráfego.

**Solução:**
Adicionar uma **fila SQS (Amazon Simple Queue Service)** entre o tópico SNS de perguntas pendentes e a `answer-processor`.

**Novo fluxo:**

```text
question-handler → SNS "perguntas-pendentes" → SQS → answer-processor (Lambda)
```

**Vantagens:**

- ✅ **Buffer natural:** absorve picos de requisições sem sobrecarregar a Lambda.
- ✅ **Controle de concorrência:** ajustável via `batchSize` e `reservedConcurrency`.
- ✅ **Retry automático e DLQ nativa:** falhas não são perdidas.
- ✅ **Escalabilidade elástica:** desacopla completamente o produtor do consumidor.

---

### 📦 2. Adotar processamento assíncrono em lotes (batch)

A `answer-processor` pode ser adaptada para processar múltiplas mensagens do SQS de uma vez (`batchSize`), reduzindo cold starts e custo por requisição.

---

### 🔍 3. Investir em observabilidade

Melhorar a visibilidade do sistema para facilitar a detecção de gargalos, falhas e comportamento anormal:

- 📊 **Métricas personalizadas** por etapa do fluxo (ex: tempo de resposta da IA, número de mensagens em fila).
- 🪵 **Logs estruturados** com correlação entre perguntas e respostas.
- 🧩 **Rastreamento distribuído** para identificar latência em cada componente (ex: Lambda, DynamoDB, API externa).
- ⏱️ **Alertas proativos** com base em erros, tempo de resposta e backlog de fila.

> Essas práticas ajudam a antecipar problemas em produção e escalar apenas o que precisa ser escalado.

---

### ⚙️ 4. Automatizar o fluxo com pipelines CI/CD

Para garantir consistência, velocidade e segurança nas entregas:

- ✅ **Pipeline de build/test/deploy automatizado** para aplicações e infraestrutura.
- ✅ **Execução de testes unitários e de integração** antes do deploy.
- ✅ **Validação de infraestrutura como código** (ex: `cdk synth`, `cdk diff`) para evitar mudanças não rastreadas.
- ✅ **Deploy seguro em múltiplos ambientes** (ex: `dev`, `staging`, `prod`) com aprovação manual ou automática.

> Isso reduz erros humanos e torna o ciclo de desenvolvimento mais previsível e auditável.

---

## 🧪 Testes

- Testes unitários com foco nas funções principais

### ▶️ Como executar os testes

1. Acesse o diretório raiz do projeto.
2. Instale as dependências (caso ainda não tenha feito):

```bash
npm install
```

3. Execute os testes com:

```bash
npm run test
```

---

## 🚀 Como executar

### ✅ Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) configurado (`aws configure`)
- [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html) instalado globalmente

---

### ⚙️ Configuração de parâmetros (SSM Secrets)

Antes do deploy, é necessário configurar os parâmetros secretos utilizados pela aplicação no **AWS Systems Manager (SSM)**.

Você pode criar os parâmetros manualmente via CLI ou Console. Também é possível utilizar os valores padrões. O único `obrigatório` é:

```bash
aws ssm put-parameter \
  --name "/ai-question-app/HUGGINGFACE_API_KEY" \
  --value "<sua_chave_aqui>" \
  --type "SecureString"
```

---

### 🚀 Deploy com CDK

```bash
npm install
cdk deploy
```

---

### 💻 Frontend (Next.js)

Após o `cdk deploy`, o frontend precisa ser configurado com as URLs da API REST e do WebSocket. Essas variáveis são necessárias no arquivo `.env` dentro da pasta `client`.

#### 📄 `.env` necessário (exemplo com valores provisionados no output do deploy):

```env
NEXT_PUBLIC_REST_API_URL=https://8m8fhy9lai.execute-api.us-east-1.amazonaws.com/dev/questions
NEXT_PUBLIC_WEB_SOCKET_URL=wss://aa017gq2u5.execute-api.us-east-1.amazonaws.com/dev/
```

> após o deploy, esses valores são exibidos no output do CDK. Você também pode utilizar os endpoints já existentes se preferir.

#### ▶️ Rodando o frontend localmente

```bash
cd client
npm install
npm run dev
```

A aplicação estará disponível em: [http://localhost:3000](http://localhost:3000)

> A interface permite enviar perguntas e aguardar as respostas em tempo real via WebSocket.

---
