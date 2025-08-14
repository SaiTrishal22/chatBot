// src/api/chatService.ts
import { API_BASE_URL, API_HEADERS } from "./config";

export async function sendChatMessage(input: string) {
  const res = await fetch(`${API_BASE_URL}/binded-agent`, {
    method: "POST",
    headers: {
      ...API_HEADERS,
      description: null as any,
      enabled: true as any,
      type: "text",
      uuid: "b6cf2b57-69fb-4840-acc5-038c3c34fbb8",
    },
    body: JSON.stringify({
      session_id: "Satya123",
      stage: "ONBD",
      sub_stage: "ONBD#EKYC",
      prompt: input,
    }),
  });

  return res.body; // This is a ReadableStream
}
