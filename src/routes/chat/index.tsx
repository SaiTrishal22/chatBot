// src/routes/chat/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import ChatComponent from "@/components/ChatComponent";

export const Route = createFileRoute("/chat/")({
  component: ChatComponent,
});
