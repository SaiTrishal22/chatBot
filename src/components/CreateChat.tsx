import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function CreateChat() {
  const [userMessages, setUserMessages] = useState<string[]>([]);
  const [aiMessages, setAiMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // For editing
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [userMessages, aiMessages]);

  async function fetchdata(message: string, editing = false) {
    let messageIndex: number;

    if (editing && editIndex !== null) {
      const updatedUserMessages = [...userMessages];
      updatedUserMessages[editIndex] = message;
      setUserMessages(updatedUserMessages);

      const updatedAiMessages = [...aiMessages];
      updatedAiMessages[editIndex] = "";
      setAiMessages(updatedAiMessages);

      messageIndex = editIndex;
      setEditIndex(null);
      setEditText("");
    } else {
      setUserMessages((prev) => [...prev, message]);
      setAiMessages((prev) => [...prev, ""]);
      messageIndex = aiMessages.length;
    }

    setIsStreaming(true);
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const res = await fetch(
        "https://api-ai-nyayatech.tech-ddc.workers.dev/binded-agent",
        {
          method: "POST",
          signal: controller.signal,
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
            prompt: message,
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
          if (!line.startsWith("data:")) continue;
          const text = line.replace(/^data:\s*/, "");
          if (!text) continue;
          const formatted = text.replace(/\\n/g, "\n");
          if (aiResponse && !aiResponse.endsWith(" ") && !formatted.startsWith("\n")) {
            aiResponse += " ";
          }
          aiResponse += formatted;
          setAiMessages((prev) => {
            const updated = [...prev];
            updated[messageIndex] = aiResponse;
            return updated;
          });
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Error fetching AI response:", err);
      }
    } finally {
      setIsStreaming(false);
      setAbortController(null);
    }
  }

  function handleSend() {
    if (!input.trim() || isStreaming) return;

    if (userMessages.length > 0 && input.trim() === userMessages[userMessages.length - 1]) {
      alert("You already sent this message!");
      return;
    }

    fetchdata(input.trim());
    setInput("");
  }

  function handleUpdate() {
    if (editIndex === null || !editText.trim()) return;

    if (editText.trim() === userMessages[editIndex]) {
      alert("No changes made!");
      return;
    }

    fetchdata(editText.trim(), true);
  }

  function handleStop() {
    if (abortController) {
      abortController.abort();
      setIsStreaming(false);
    }
  }

  function handleFormattingText(message: string) {
    return <div style={{ whiteSpace: "pre-wrap" }}>{message}</div>;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (isStreaming) {
        handleStop();
      } else if (editIndex !== null) {
        handleUpdate();
      } else {
        handleSend();
      }
    }
  }

  function handleEdit(index: number) {
    setEditIndex(index);
    setEditText(userMessages[index]);
  }

  function handleCancelEdit() {
    setEditIndex(null);
    setEditText("");
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b bg-black shadow-sm">
        <p className="font-semibold text-white">Nyaya Tech</p>
        <button className="text-white hover:text-gray-400">✕</button>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <div className="flex items-center justify-center">
          <span className="text-gray-400 text-sm">Today</span>
        </div>

        {userMessages.map((userMsg, index) => (
          <div key={`chat-${index}`} className="space-y-4">
            {/* User message */}
            <div className="flex justify-end items-center gap-2">
              <div
                className={`bg-black text-white rounded-lg px-4 py-2 max-w-xs text-sm shadow ${
                  editIndex === index ? "ring-2 ring-gray-400" : ""
                }`}
              >
                {handleFormattingText(userMsg)}
              </div>

              {index === userMessages.length - 1 && editIndex === null && (
                <button
                  onClick={() => handleEdit(index)}
                  className="text-gray-400 hover:text-black transition"
                  title="Edit"
                >
                  ✎
                </button>
              )}
            </div>

            {/* AI message */}
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white font-bold">
                N
              </div>
              <Card className="bg-gray-50 w-full">
                <CardContent className="p-4 space-y-3">
                  {isStreaming && index === aiMessages.length - 1 && !aiMessages[index] ? (
                    <div className="flex gap-2 items-center">
                      <span className="w-2 h-2 bg-black rounded-full animate-bounce"></span>
                      <span
                        className="w-2 h-2 bg-black rounded-full animate-bounce"
                        style={{ animationDelay: "0.15s" }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-black rounded-full animate-bounce"
                        style={{ animationDelay: "0.3s" }}
                      ></span>
                    </div>
                  ) : (
                    handleFormattingText(aiMessages[index] || "")
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area with Edit/Cancel/Update integrated */}
      <div className="flex items-center gap-2 p-3 border-t bg-white">
        <input
          value={editIndex !== null ? editText : input}
          onChange={(e) =>
            editIndex !== null ? setEditText(e.target.value) : setInput(e.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder={editIndex !== null ? "Edit your message..." : "Type your message..."}
          disabled={isStreaming && !input}
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:bg-gray-100"
        />

        {editIndex !== null && (
          <button
            onClick={handleCancelEdit}
            className="bg-gray-300 text-black rounded-full px-4 py-2 text-sm hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        )}

        <button
          onClick={editIndex !== null ? handleUpdate : isStreaming ? handleStop : handleSend}
          className={`rounded-full px-4 py-2 text-sm ${
            editIndex !== null
              ? "bg-black text-white hover:bg-gray-800 transition"
              : isStreaming
              ? "w-10 h-10 flex items-center justify-center bg-black hover:bg-gray-800 transition"
              : "bg-black text-white hover:bg-gray-800 transition"
          }`}
        >
          {editIndex !== null
            ? "Update"
            : isStreaming
            ? <span className="w-3 h-3 bg-white rounded-sm"></span>
            : "Send"}
        </button>
      </div>
    </div>
  );
}

console.log("hello autoRag");