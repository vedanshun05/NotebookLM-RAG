import Link from "next/link";
import { Bot, Upload, MessageSquare } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="p-4 bg-[#2a2a2a] rounded-3xl mb-6 shadow-[0_0_20px_rgba(255,59,48,0.2)]">
        <Bot className="w-16 h-16 text-[#ff3b30]" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-[#e5e5e5] sm:text-6xl mb-4">
        Vectored <span className="text-[#ff3b30]">Ground</span>
      </h1>
      <p className="text-lg text-[#8a8a8a] max-w-2xl mb-10">
        Your personal grounded AI assistant. Upload documents, index them into 
        a vector database, and have a conversation rooted purely in your data.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/upload" 
          className="flex items-center justify-center gap-2 px-8 py-4 bg-[#ff3b30] text-white rounded-full font-semibold hover:bg-[#d32f2f] transition-all shadow-[0_0_15px_rgba(255,59,48,0.4)]"
        >
          <Upload className="w-5 h-5" />
          Upload Document
        </Link>
        <Link 
          href="/chat" 
          className="flex items-center justify-center gap-2 px-8 py-4 bg-[#1a1a1a] border border-[#2a2a2a] text-[#e5e5e5] rounded-full font-semibold hover:bg-[#2a2a2a] transition-all shadow-sm"
        >
          <MessageSquare className="w-5 h-5" />
          Start Chatting
        </Link>
      </div>
    </div>
  );
}
