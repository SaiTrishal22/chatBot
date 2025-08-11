import React, { useState, useRef, useEffect } from "react";

export default function ChatComponent() {
  const [userMessages, setUserMessages] = useState<string[]>([]);
  const [aiMessages, setAiMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [userMessages, aiMessages]);

  async function fetchdata(input: string) {
    setUserMessages((prev) => [...prev, input]);

    let messageIndex: number;
    setAiMessages((prev) => {
      const updated = [...prev, ""];
      messageIndex = updated.length - 1;
      return updated;
    });

    const res = await fetch(
      "https://api-ai-nyayatech.tech-ddc.workers.dev/binded-agent",
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsImlhdCI6MTc1NDY0MDMzNywiZXhwIjoxNzU3MjMyMzM3fQ.ZrqbiNdTHjAtIRF2jf-aBZXBucs7SuLcIJFGH25iyQs",
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
      }
    );

    const reader = res.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    let aiResponse = "";

    while (true) {
      const { value, done } = await reader!.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (let line of lines) {
        line = line.trim();
        if (line.startsWith("data:")) {
          const text = line.replace(/^data:\s*/, "");
          aiResponse += text + " ";

          setAiMessages((prev) => {
            const updated = [...prev];
            updated[messageIndex] = aiResponse.trim();
            return updated;
          });
        }
      }
    }
  }

  function handleSend() {
    if (input.trim()) {
      fetchdata(input.trim());
      setInput("");
    }
  }

  return (
    <> 
      <div>
        {userMessages.map((msg, index) => (
          <div key={`msg-${index}`} style={{ marginBottom: "15px" }}>
            <div className="div-user-msg">
              {msg}
            </div>
            <div>
              
              {aiMessages[index] || "..."}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSend}>
          Send
        </button>
      </div>
  </>  
  );
}
