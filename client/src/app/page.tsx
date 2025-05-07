"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "@/app/page.module.css";
import { useRouter } from "next/navigation";

interface IncomingMessage {
  question: {
    content: string;
    answer?: string;
  };
}

interface Message {
  type: "user" | "bot";
  content: string;
}

function useWebSocket(userId: string, onAnswer: (answer: string) => void) {
  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WEB_SOCKET_URL!);

    ws.onopen = () => {
      console.log("✅ WebSocket conectado");
      ws.send(JSON.stringify({ action: "subscribe", userId }));
    };

    ws.onmessage = (event) => {
      const data: IncomingMessage = JSON.parse(event.data);
      console.log("📩 Mensagem recebida:", data);
      if (data.question?.answer) {
        onAnswer(data.question.answer);
      }
    };

    ws.onclose = () => console.log("🔌 WebSocket desconectado");
    ws.onerror = (err) => console.error("❌ Erro WebSocket", err);

    return () => ws.close();
  }, [userId, onAnswer]);
}

export default function Home() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      router.push("/login");
    } else {
      setUserId(storedUserId);
      setIsMounted(true);
    }
  }, [router]);

  const handleAnswer = useCallback((answer: string) => {
    setMessages((prev) => [...prev, { type: "bot", content: answer }]);
    setIsLoading(false);
  }, []);

  useWebSocket(userId || "", handleAnswer);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSend = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setQuestion("");
    if (!question.trim()) return;

    setMessages((prev) => [...prev, { type: "user", content: question }]);

    try {
      await fetch(process.env.NEXT_PUBLIC_REST_API_URL || "", {
        method: "POST",
        body: JSON.stringify({
          question: {
            content: question,
            userId,
          },
        }),
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Erro ao enviar a pergunta:", error);
    }
  };

  if (!isMounted) return null;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Chat com a IA</h1>
      <div className={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.message} ${msg.type === "user" ? styles.user : styles.bot}`}
          >
            {msg.content}
          </div>
        ))}
      </div>
      <div className={styles.inputArea}>
        <input
          className={styles.input}
          disabled={isLoading}
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Digite sua pergunta..."
        />
        <button className={styles.button} onClick={handleSend} disabled={isLoading}>
          Enviar
        </button>
      </div>
    </div>
  );
}
