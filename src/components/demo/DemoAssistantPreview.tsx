"use client";

import React, { useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  ExternalLink,
  Mic,
  MicOff,
  Navigation,
  Send,
  Sparkles,
} from "lucide-react";
import { CampusAILogo } from "../assistant/CampusAILogo";

export function DemoAssistantPreview() {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reply, setReply] = useState<string | null>(
    "👋 Try a voice or text command below to see how Campus AI operates your portal in sandbox mode."
  );
  const [results, setResults] = useState<any[]>([]);
  const recognitionRef = useRef<any>(null);

  const sampleChips = [
    "Open my attendance",
    "Find hackathons this month",
    "Where is the library?",
    "Explain deadlock in simple words",
  ];

  const handleRunCommand = async (commandText: string) => {
    if (!commandText.trim() || isLoading) return;

    setIsLoading(true);
    setQuery(commandText);
    setTranscript("");

    try {
      const res = await fetch("/api/demo/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commandText, language: "en-IN" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sandbox error");

      setReply(data.reply_text);
      setResults(data.results || []);
    } catch (err: any) {
      setReply(`Sandbox Notice: ${err.message || "Failed to process query."}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Web Speech API for the Sandbox
  const toggleSpeech = () => {
    if (typeof window === "undefined") return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("Speech recognition is not supported in this browser. Please use text input.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.lang = "en-IN";
      rec.interimResults = true;

      rec.onstart = () => {
        setIsListening(true);
        setTranscript("");
      };

      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setTranscript(text);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
        setTranscript((t) => {
          if (t && t.length > 1) {
            handleRunCommand(t);
          }
          return "";
        });
      };

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-cyan-500/30 p-5 sm:p-6 shadow-2xl backdrop-blur-md text-left space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <CampusAILogo size="md" isListening={isListening} />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-sm sm:text-base">
                Try Campus AI (Sandbox Preview)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[9px] font-bold">
                SANDBOX
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Interactive sandbox demo · No login required
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-block text-[11px] text-slate-400 font-medium">
          🔒 Mock Data Only
        </span>
      </div>

      {/* Clickable Example Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">Try:</span>
        {sampleChips.map((chip) => (
          <button
            key={chip}
            type="button"
            disabled={isLoading || isListening}
            onClick={() => handleRunCommand(chip)}
            className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-500/15 hover:border-cyan-500/40 border border-slate-700 text-[11px] text-slate-300 hover:text-cyan-200 transition-all cursor-pointer whitespace-nowrap"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Live Mic Wave / Listening Bar */}
      {isListening && (
        <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-between text-xs text-cyan-300 animate-pulse">
          <span className="flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            {transcript ? `"${transcript}"` : "Listening... speak your command"}
          </span>
          <span className="font-mono text-[10px]">WebSpeech</span>
        </div>
      )}

      {/* Response Display Box */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 min-h-[100px]">
        {reply && (
          <div className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
            <Bot className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="flex-1">{reply}</div>
          </div>
        )}

        {/* Animated Result Card: Attendance Preview in Sandbox */}
        {results?.map((res) => (
          <div key={res.id} className="mt-2 p-3 rounded-xl bg-slate-900 border border-slate-700/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">{res.title}</span>
              <span className="text-[10px] text-slate-400">{res.subtitle}</span>
            </div>

            {res.type === "attendance" && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400">Overall Attendance</div>
                  <div className="text-base font-extrabold text-emerald-400">{res.data.overall}%</div>
                </div>
                <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800 text-center">
                  <div className="text-[10px] text-rose-300">Computer Networks</div>
                  <div className="text-base font-extrabold text-rose-400">72% (Need 3)</div>
                </div>
              </div>
            )}

            {res.type === "map" && (
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-cyan-300">
                📍 {res.data.directions} ({res.data.building})
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Voice & Text Input Dock */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={toggleSpeech}
          title={isListening ? "Stop listening" : "Click to speak via Web Speech API"}
          className={`p-2.5 rounded-xl transition-all cursor-pointer ${
            isListening
              ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/50 animate-pulse"
              : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
          }`}
        >
          <Mic className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type e.g. 'Where is the library?' or click a chip..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) handleRunCommand(query);
          }}
          className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
        />

        <button
          type="button"
          disabled={!query.trim() || isLoading}
          onClick={() => handleRunCommand(query)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs disabled:opacity-40 cursor-pointer shadow-md"
        >
          {isLoading ? "Running..." : "Try"}
        </button>
      </div>

      {/* Sandbox Disclaimer Note */}
      <p className="text-[10px] text-slate-400 text-center pt-1">
        💡 Demo data only. Log in to use Campus AI with your own real-time student account and full tool permissions.
      </p>
    </div>
  );
}
