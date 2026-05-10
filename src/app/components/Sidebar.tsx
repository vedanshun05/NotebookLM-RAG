"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, MessageSquare, Trash2, FileText } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface Conversation {
  id: string;
  lastMessage: string;
  createdAt: string;
}

export default function Sidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDoc, setCurrentDoc] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetchConversations();
    fetchCurrentDoc();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentDoc = async () => {
    try {
      const res = await fetch("/api/upload/latest");
      if (res.ok) {
        const data = await res.json();
        setCurrentDoc(data.filename || null);
      }
    } catch {
      // ignore
    }
  };

  const handleNewChat = () => {
    router.push("/chat");
  };

  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this chat?")) return;

    try {
      const res = await fetch(`/api/conversations?id=${convId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setConversations((prev) => prev.filter((conv) => conv.id !== convId));
      } else {
        console.error("Failed to delete conversation.");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  return (
    <aside className="w-64 h-screen bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col shadow-[2px_0_10px_rgba(0,0,0,0.3)]">
      {/* Header */}
      <div className="p-4 border-b border-[#2a2a2a]">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#ff3b30] text-white rounded-lg font-medium hover:bg-[#d32f2f] transition-all shadow-[0_0_10px_rgba(255,59,48,0.3)]"
        >
          <Plus className="w-5 h-5" />
          New Chat
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="flex items-center justify-between px-1 mb-2">
          <h3 className="text-xs font-medium text-[#8a8a8a] uppercase tracking-wider">
            Recent Chats
          </h3>
          <span className="text-xs text-[#4a4a4a]">{conversations.length}</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#ff3b30] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="w-8 h-8 text-[#3a3a3a] mb-2" />
            <p className="text-sm text-[#4a4a4a]">No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => {
              const isActive = pathname === `/chat?id=${conv.id}`;
              return (
                <Link key={conv.id} href={`/chat?id=${conv.id}`}>
                  <div
                    className={`group flex items-center gap-3 p-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-[#ff3b30]/10 border border-[#ff3b30]/30"
                        : "hover:bg-[#2a2a2a] border border-transparent"
                    }`}
                    title="Click to open chat"
                  >
                      <MessageSquare className="w-4 h-4 text-[#8a8a8a] group-hover:text-[#ff3b30] transition-colors shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#e5e5e5] truncate">
                          {conv.lastMessage || "New Conversation"}
                        </p>
                        <p className="text-xs text-[#4a4a4a] mt-0.5">
                          {new Date(conv.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => deleteConversation(conv.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-500/20 hover:text-red-400 transition-all"
                        aria-label="Delete chat"
                        title="Delete chat"
                      >
                        <Trash2 className="w-4 h-4 text-[#4a4a4a]" />
                      </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Current Document */}
      <div className="p-4 border-t border-[#2a2a2a]">
        <h3 className="text-xs font-medium text-[#8a8a8a] uppercase tracking-wider mb-3">
          Current Document
        </h3>
        <div
          className="flex items-center gap-3 p-3 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a] hover:border-[#ff3b30]/50 transition-colors cursor-pointer"
          onClick={() => router.push("/upload")}
          title="Click to upload/change document"
        >
          <div className="p-2 bg-[#ff3b30]/10 rounded-lg shrink-0">
            <FileText className="w-5 h-5 text-[#ff3b30]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#e5e5e5] truncate font-medium">
              {currentDoc || "No document"}
            </p>
            <p className="text-xs text-[#4a4a4a]">
              {currentDoc ? "Click to change" : "Click to upload"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
