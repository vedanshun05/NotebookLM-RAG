import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import Sidebar from "./components/Sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vectored Ground",
  description: "A grounded AI assistant powered by NVIDIA NIM.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="flex h-screen bg-[#0f0f0f] text-[#e5e5e5]">
        <ClerkProvider>
          <div className="flex w-full h-full">
            {/* Left Sidebar - Fixed on Desktop, Hidden on Mobile */}
            <div className="hidden md:flex" style={{ width: "260px", minWidth: "260px", flexShrink: 0 }}>
              <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              {/* Top Bar */}
              <header className="flex justify-between items-center p-3 border-b border-[#2a2a2a] bg-[#1a1a1a] sticky top-0 z-50">
                <div className="text-xl font-bold tracking-tighter text-[#ff3b30] pl-4">
                  Vectored<span className="text-[#e5e5e5]">Ground</span>
                </div>
                <div className="flex items-center gap-4">
                  <Show when="signed-out">
                    <SignInButton mode="modal">
                      <button className="px-4 py-2 text-sm font-medium text-[#e5e5e5] hover:text-[#ff3b30] transition-colors">Sign In</button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="px-4 py-2 text-sm font-medium bg-[#ff3b30] text-white rounded-md hover:bg-[#d32f2f] transition-colors shadow-[0_0_10px_rgba(255,59,48,0.4)]">Sign Up</button>
                    </SignUpButton>
                  </Show>
                  <Show when="signed-in">
                    <UserButton afterSignOutUrl="/" />
                  </Show>
                </div>
              </header>

              {/* Page Content */}
              <main className="flex-1 overflow-y-auto bg-[#0f0f0f] scroll-smooth">
                {children}
              </main>
            </div>
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
