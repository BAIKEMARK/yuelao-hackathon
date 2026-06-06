import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertStoryFitsResult, buildStoryMessages, normalizeStoryPayload } from "./storyPrompt.js";

const libDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(libDir, "..");
const workspaceRoot = path.resolve(appRoot, "..");

dotenv.config({ path: path.join(workspaceRoot, ".env") });
dotenv.config({ path: path.join(appRoot, ".env") });

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
          temperature: attempt === 0 ? 0.8 : 0.5
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const error = new Error(`StepFun request failed: ${response.status}`);
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (typeof content !== "string") {
        throw new Error("StepFun response missing message content");
      }

      return assertStoryFitsResult(normalizeStoryPayload(content));
    } catch (error) {
      if (error?.status === 401 || error?.status === 403) {
        throw error;
      }
      lastError = error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if (isInvalidStoryError(lastError)) {
    return createFallbackStory(input);
  }

  throw lastError || new Error("StepFun generation failed");
}

export function createFallbackStory({ cue, target, hitCount, tieBreak, noHit }) {
  const meetingNote = noHit
    ? "姻缘簿今日偷了个懒，替他们补上一页误签。"
    : `姻缘簿记下 ${hitCount} 次擦肩，${tieBreak ? "最后一笔还带着命运临门改判的意思。" : "每一笔都像偶然，又不像全然偶然。"}`;

  return {
    title: `${cue.name}与${target.name}的误签小报`,
    relationshipTag: noHit ? "礼貌错过" : tieBreak ? "误会拉扯" : "意外知己",
    story: `${meetingNote}${cue.name}先把这段缘分看成簿吏写错，${target.name}却认真收下那页红笺。一个把话说得清醒，一个把心意做得直接，短短一面未必定成佳偶，却足够让月老在旁边多盖一枚小印。`,
    yuelaoComment: "红绳可以晚点系，记录不能少写。"
  };
}

function isInvalidStoryError(error) {
  const message = error?.message || "";
  return (
    message.includes("not valid JSON") ||
    message.includes("missing") ||
    message.includes("physical marble terms")
  );
}
