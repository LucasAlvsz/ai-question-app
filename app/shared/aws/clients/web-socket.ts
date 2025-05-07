import { ApiGatewayManagementApiClient } from "@aws-sdk/client-apigatewaymanagementapi";
import { ENV_VARS } from "@/app-config/envs";

export const webSocketClient = new ApiGatewayManagementApiClient({
  endpoint: ENV_VARS.WEBSOCKET_ENDPOINT,
});
