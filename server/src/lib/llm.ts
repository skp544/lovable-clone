import { OPENAI_MODEL } from "../config/env";
import { getChatModel, hasLlm } from "./model";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

export async function runPlainPrompt(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  if (!hasLlm()) {
    throw new Error("No LLM provider configured: set OPENAI_API_KEY");
  }

  const model = getChatModel(OPENAI_MODEL);
  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ]);

  const { content } = response;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("LLM returned an empty or invalid response.");
  }

  return content.trim();
}
