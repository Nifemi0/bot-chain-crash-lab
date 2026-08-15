import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const EXPECTED_BASE_URL = "https://api.deepseek.com";
const EXPECTED_MODEL = "deepseek-v4-flash";

export function getInvestigationModel() {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  const baseURL = process.env.DEEPSEEK_BASE_URL?.trim();
  const modelId = process.env.DEEPSEEK_MODEL?.trim();

  if (!apiKey) throw new Error("DeepSeek API key is not configured.");
  if (baseURL !== EXPECTED_BASE_URL) throw new Error("DeepSeek base URL is not configured correctly.");
  if (modelId !== EXPECTED_MODEL) throw new Error("DeepSeek model must be deepseek-v4-flash.");

  const deepSeek = createOpenAICompatible({
    name: "deepseek",
    apiKey,
    baseURL,
    supportsStructuredOutputs: true,
  });

  return { model: deepSeek.chatModel(modelId), modelId };
}
