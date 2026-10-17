import { ChatOpenAI } from "@langchain/openai";
import { OPENAI_API_KEY, OPENAI_REASONING_EFFORT } from "../config/env";

const REASONING_MODEL_MARKERS = ["o1", "o2", "o3", "o4", "gpt-5", "gpt-6"];

export function isOpenAiReasoningModel(model: string): boolean {
  return REASONING_MODEL_MARKERS.some((marker) => model.includes(marker));
}

export function openaiChatModel(model: string, reasoning: boolean) {
  if (reasoning && isOpenAiReasoningModel(model)) {
    return new ChatOpenAI({
      model,
      apiKey: OPENAI_API_KEY,
      reasoning: { effort: OPENAI_REASONING_EFFORT },
    });
  }

  return new ChatOpenAI({ model, apiKey: OPENAI_API_KEY });
}

export function getChatModel(model: string, reasoning = false) {
  if (OPENAI_API_KEY) {
    return openaiChatModel(model, reasoning);
  }

  throw new Error("No chat model provider configured: set OPENAI_API_KEY");
}
