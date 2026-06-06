import dotenv from "dotenv";
import path from "node:path";
import { buildStoryMessages, normalizeStoryPayload } from "./storyPrompt.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const STEPFUN_URL = "https://api.stepfun.com/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 12_000;

export async function generateStory(input) {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("Missing API_KEY");
  }

  let lastError;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(STEPFUN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "step-3.7-flash",
          messages: buildStoryMessages(input),
          temperature: attempt === 0 ? 0.8 : 0.5,
          response_format: { type: "json_object" }
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`StepFun request failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (typeof content !== "string") {
        throw new Error("StepFun response missing message content");
      }

      return normalizeStoryPayload(content);
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError || new Error("StepFun generation failed");
}
