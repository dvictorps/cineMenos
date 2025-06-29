"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  User,
  Bot,
  Loader2,
  MessageCircle,
  X,
  Minimize2,
  Film,
  Clock,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

const QUICK_QUESTIONS = [
  {
    icon: Film,
    text: "Que filmes estão em cartaz?",
    emoji: "🎬",
  },
  {
    icon: Clock,
    text: "Horários das sessões de hoje",
    emoji: "⏰",
  },
  {
    icon: Info,
    text: "Sinopse do filme Avatar",
    emoji: "📖",
  },
];

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: `welcome-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "assistant",
      content:
        "🎬 Olá! Sou o assistente do **CineMenos**!\n\nPowered by **Groq AI** - super rápido e inteligente! 🚀\n\nPosso ajudar com informações sobre filmes, horários de sessões, sinopses e muito mais. O que você gostaria de saber?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const addMessage = (message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage.id;
  };

  const simulateTyping = async (content: string, messageId: string) => {
    setIsTyping(true);

    const typingDelay = Math.min(content.length * 15, 1000);
    await new Promise((resolve) => setTimeout(resolve, typingDelay));

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, content, isTyping: false } : msg
      )
    );
    setIsTyping(false);
  };

  const handleSubmit = async (messageText?: string) => {
    const messageToSend = messageText || input.trim();
    if (!messageToSend || isLoading) return;

    addMessage({
      type: "user",
      content: messageToSend,
    });

    if (!messageText) {
      setInput("");
    }

    setIsLoading(true);

    const assistantMessageId = addMessage({
      type: "assistant",
      content: "Processando...",
      isTyping: true,
    });

    try {
      const response = await fetch("/api/ai-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageToSend }),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        await simulateTyping(data.response, assistantMessageId);
      } else {
        await simulateTyping(
          data.response || "Desculpe, não consegui processar sua solicitação.",
          assistantMessageId
        );
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      await simulateTyping(
        "Desculpe, ocorreu um erro. Tente novamente em alguns momentos.",
        assistantMessageId
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = (message: Message) => {
    const isUser = message.type === "user";

    return (
      <div
        key={message.id}
        className={cn(
          "flex gap-2 mb-4 max-w-[85%]",
          isUser ? "ml-auto flex-row-reverse" : "mr-auto"
        )}
      >
        <div
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs",
            isUser
              ? "bg-blue-600 text-white"
              : "bg-gradient-to-br from-green-600 to-blue-600 text-white"
          )}
        >
          {isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
        </div>

        <div
          className={cn(
            "rounded-lg px-3 py-2 text-sm shadow-sm",
            isUser
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-900 border border-gray-200"
          )}
        >
          {message.isTyping ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-xs">Processando com Groq AI...</span>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">
              {message.content.split("\n").map((line, index) => {
                if (line.startsWith("**") && line.endsWith("**")) {
                  return (
                    <div key={index} className="font-bold mb-1">
                      {line.slice(2, -2)}
                    </div>
                  );
                }
                if (line.startsWith("- ")) {
                  return (
                    <div key={index} className="ml-2 mb-1">
                      • {line.slice(2)}
                    </div>
                  );
                }
                return line ? (
                  <div key={index} className="mb-1">
                    {line}
                  </div>
                ) : (
                  <div key={index} className="mb-1"></div>
                );
              })}
            </div>
          )}
          <div
            className={cn(
              "text-xs mt-1 opacity-70",
              isUser ? "text-blue-100" : "text-gray-500"
            )}
          >
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      </div>
    );
  };

  // Botão flutuante
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>

        {/* Tooltip */}
        <div className="absolute bottom-16 right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
          🚀 Pergunte sobre filmes - Powered by Groq AI
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card
        className={cn(
          "w-80 shadow-2xl border-2 transition-all duration-300",
          isMinimized ? "h-14" : "h-96"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="h-3 w-3" />
            </div>
            <div>
              <p className="text-sm font-medium">CineMenos AI</p>
              <p className="text-xs opacity-80">
                {isTyping ? "Processando..." : "Powered by Groq 🚀"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 w-8 h-8 p-0"
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 w-8 h-8 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <ScrollArea className="h-64 p-3 bg-gray-50">
              <div>
                {messages.map(renderMessage)}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Questions (only show with welcome message) */}
            {messages.length === 1 && (
              <div className="p-3 bg-white border-t">
                <div className="space-y-1">
                  {QUICK_QUESTIONS.map((question, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSubmit(question.text)}
                      disabled={isLoading}
                      className="w-full justify-start h-auto p-2 text-left hover:bg-gray-100 text-xs text-gray-800 hover:text-gray-900 border border-gray-200 hover:border-gray-300"
                    >
                      <span className="mr-2">{question.emoji}</span>
                      <span className="text-gray-800 font-medium">
                        {question.text}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 bg-white border-t rounded-b-lg">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua pergunta..."
                  disabled={isLoading}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={() => handleSubmit()}
                  disabled={isLoading || !input.trim()}
                  size="sm"
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
