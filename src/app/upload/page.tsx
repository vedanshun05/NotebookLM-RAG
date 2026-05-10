"use client";
import { useState } from "react";
import { Upload, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());
      setStatus("success");
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-4">
      <div className="max-w-2xl w-full p-8 border border-[#2a2a2a] rounded-2xl bg-[#1a1a1a] shadow-[0_0_20px_rgba(255,59,48,0.05)]">
        <div className="flex flex-col items-center gap-6">
          <div className="p-4 bg-[#2a2a2a] rounded-full shadow-[0_0_15px_rgba(255,59,48,0.2)]">
            <Upload className="w-12 h-12 text-[#ff3b30]" />
          </div>
          <h1 className="text-2xl font-bold text-[#e5e5e5]">Upload Document</h1>
          <p className="text-[#8a8a8a]">Upload a PDF or TXT file to start chatting with your data.</p>
          
          <div className="w-full border-2 border-dashed border-[#4a4a4a] rounded-xl p-10 flex flex-col items-center justify-center gap-4 hover:border-[#ff3b30] transition-colors cursor-pointer relative group">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.txt"
            />
            <FileText className="w-10 h-10 text-[#4a4a4a] group-hover:text-[#ff3b30] transition-colors" />
            <span className="text-sm text-[#8a8a8a]">
              {file ? file.name : "Click or drag and drop your file here"}
            </span>
          </div>

          <button 
            onClick={handleUpload}
            disabled={!file || status === "uploading"}
            className="w-full py-3 bg-[#ff3b30] text-white rounded-lg font-medium disabled:bg-[#2a2a2a] disabled:text-[#8a8a8a] flex justify-center items-center gap-2 hover:bg-[#d32f2f] transition-all shadow-[0_0_15px_rgba(255,59,48,0.3)]"
          >
            {status === "uploading" ? "Processing..." : "Index Document"}
          </button>

          {status === "success" && (
            <div className="flex items-center gap-2 text-green-400 font-medium">
              Document indexed successfully!
            </div>
          )}
          {status === "error" && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="w-full h-px bg-[#2a2a2a] my-2" />

          <Link 
            href="/chat" 
            className="w-full py-3 bg-[#1a1a1a] border border-[#ff3b30] text-[#ff3b30] rounded-lg font-medium flex justify-center items-center gap-2 hover:bg-[#ff3b30] hover:text-white transition-all group shadow-[0_0_10px_rgba(255,59,48,0.1)]"
          >
            Start Chatting
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
