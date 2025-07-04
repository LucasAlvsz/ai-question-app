export const ENV_VARS = {
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
  HUGGINGFACE_API_URL:
    process.env.HUGGINGFACE_API_URL ||
    "https://router.huggingface.co/novita/v3/openai/chat/completions",
  HUGGINGFACE_MODEL: process.env.HUGGINGFACE_MODEL || "deepseek/deepseek-v3-0324",
  HUGGINGFACE_API_ROLE: process.env.HUGGINGFACE_API_ROLE || "user",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_API_URL: process.env.OPENAI_API_URL,
  WEBSOCKET_ENDPOINT: process.env.WEBSOCKET_ENDPOINT,
} as const;
