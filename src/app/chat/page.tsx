"use client";
import { useState, useEffect, useRef } from "react";
import { Bot, User, ArrowRight, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [activeDocument, setActiveDocument] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]); 
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationId
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();
      setIsLoading(false);

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const fullText = data.answer;
      let currentIndex = 0;
      const interval = setInterval(() => {
        currentIndex++;
        const nextText = fullText.substring(0, currentIndex);

        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (lastIndex >= 0 && newMessages[lastIndex].role === "assistant") {
            newMessages[lastIndex] = { ...newMessages[lastIndex], content: nextText };
          }
          return newMessages;
        });

        if (currentIndex >= fullText.length) {
          clearInterval(interval);
        }
      }, 15);

      if (data.conversationId) setConversationId(data.conversationId);
    } catch (err) {
      setIsLoading(false);
      setMessages((prev) => [...prev, { role: "assistant", content: "Error: Could not generate answer. Make sure you uploaded a document." }]);
    }
  };

  // Welcome screen
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center w-full overflow-y-auto">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto px-4">
          <div className="p-4 bg-[#2a2a2a] rounded-3xl mb-6 inline-block shadow-[0_0_20px_rgba(255,59,48,0.2)]">
            <Bot className="w-16 h-16 text-[#ff3b30]" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#e5e5e5] sm:text-6xl mb-4">
            Vectored <span className="text-[#ff3b30]">Ground</span>
          </h1>
          <p className="text-lg text-[#8a8a8a] mb-10">
            Your personal grounded AI assistant. Upload documents, index them into 
            a vector database, and have a conversation rooted purely in your data.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <div className="px-6 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-[#8a8a8a] text-sm">
              Upload a PDF or TXT
            </div>
            <div className="px-6 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-[#8a8a8a] text-sm">
              Ask questions about your document
            </div>
            <div className="px-6 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-[#8a8a8a] text-sm">
              Get grounded answers
            </div>
          </div>
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="fixed bottom-6 left-0 right-0 px-4 z-50">
          <div className="max-w-3xl mx-auto flex gap-2 p-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full shadow-lg focus-within:ring-2 ring-[#ff3b30] transition-all">
            <input
              className="flex-1 px-4 py-2 outline-none text-sm bg-transparent text-[#e5e5e5] placeholder-[#4a4a4a]"
              placeholder="Ask anything about your document..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2 bg-[#ff3b30] text-white rounded-full disabled:bg-[#2a2a2a] transition-colors hover:bg-[#d32f2f] shadow-[0_0_10px_rgba(255,59,48,0.3)]"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full">
      
      {/* Document Preview */}
      {activeDocument && (
        <div className="p-3 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center gap-3">
          <div className="p-2 bg-[#ff3b30]/10 rounded-lg">
            <FileText className="w-5 h-5 text-[#ff3b30]" />
          </div>
          <div>
            <p className="text-sm text-[#e5e5e5] font-medium">{activeDocument}</p>
            <p className="text-xs text-[#8a8a8a]">Active Document</p>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 pb-20">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "user" && (
              <div className="flex gap-3 max-w-[80%] p-3 rounded-2xl bg-[#ff3b30] text-white rounded-tr-none shadow-sm">
                <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-invert">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
                <User className="w-5 h-5 shrink-0 mt-1" />
              </div>
            )}

            {m.role === "assistant" && (
              <div className="flex gap-3 max-w-[80%] p-3 rounded-2xl bg-[#2a2a2a] border border-[#3a3a3a] text-[#e5e5e5] rounded-tl-none shadow-sm">
                <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-invert">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%] p-3 rounded-2xl bg-[#2a2a2a] border border-[#3a3a3a] text-[#e5e5e5] rounded-tl-none shadow-sm items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#ff3b30] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#ff3b30] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#ff3b30] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-[#8a8a8a]">Retrieving context and generating answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0f0f0f] to-transparent">
        <div className="max-w-3xl mx-auto flex gap-2 p-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full shadow-lg focus-within:ring-2 ring-[#ff3b30] transition-all">
          <input
            className="flex-1 px-4 py-2 outline-none text-sm bg-transparent text-[#e5e5e5] placeholder-[#4a4a4a]"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-[#ff3b30] text-white rounded-full disabled:bg-[#2a2a2a] transition-colors hover:bg-[#d32f2f] shadow-[0_0_10px_rgba(255,59,48,0.3)]"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
