import dotenv from "dotenv";
import path from "node:path";
import { buildStoryMessages, normalizeStoryPayload } from "./storyPrompt.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const STEPFUN_URL = "https://api.stepfun.com/v1/chat/completions";

export async function generateStory(input) {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("Missing API_KEY");
  }

  const response = await fetch(STEPFUN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "step-3.7-flash",
      messages: buildStoryMessages(input),
      temperature: 0.8,
      response_format: { type: "json_object" }
    })
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
}
