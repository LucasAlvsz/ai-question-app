export const APIGW_RESOURCES = {
  REST_API: {
    id: "AiQuestionProcessorApi",
  },
  WEBSOCKET_API: {
    id: "AiQuestionProcessorWebSocketApi",
    connectRouteOptions: {
      integration: {
        id: "ConnectIntegration",
      },
    },
    disconnectRouteOptions: {
      integration: {
        id: "DisconnectIntegration",
      },
    },
    defaultRouteOptions: {
      integration: {
        id: "DefaultIntegration",
      },
    },

    SUBSCRIBE_ROUTES: {
      SUBSCRIBE: {
        id: "subscribe",
        integration: {
          id: "SubscribeIntegration",
        },
      },
    },
    STAGE: {
      id: "AiQuestionProcessorWebSocketStage",
      name: process.env.STAGE ?? "dev",
      autoDeploy: true,
    },
  },
} as const;
