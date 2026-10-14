"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Languages,
  Mic,
  MicOff,
  Navigation,
  Radio,
  Send,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useAssistant } from "./AssistantContext";
import { CampusAILogo } from "./CampusAILogo";
import { AssistantLanguage } from "@/lib/assistant/types";

export function AssistantPanel() {
  const { data: session } = useSession();
  const {
    isOpen,
    setIsOpen,
    isListening,
    startListening,
    stopListening,
    isSpeaking,
    stopSpeaking,
    transcript,
    messages,
    language,
    setLanguage,
    voiceRepliesEnabled,
    setVoiceRepliesEnabled,
    handsFree,
    setHandsFree,
    isSpeechSupported,
    micError,
    sendMessage,
    confirmAction,
    clearHistory,
    audioLevels,
  } = useAssistant();

  const [inputQuery, setInputQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const role = session?.user?.role || "STUDENT";

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isSubmitting) return;

    const q = inputQuery;
    setInputQuery("");
    setIsSubmitting(true);
    await sendMessage(q);
    setIsSubmitting(false);
  };

  // Role-aware "Try saying..." recommendation chips
  const getRoleSuggestions = () => {
    if (role === "FACULTY") {
      return [
        "Students with attendance below 65%",
        "What's my next lecture?",
        "Where is the Turing AI lab?",
        "Explain deadlock in simple words",
      ];
    }
    if (role === "ADMIN") {
      return [
        "Show platform stats and fee collection",
        "Where is the auditorium?",
        "Find hackathons this month",
        "Recent grievance tickets",
      ];
    }
    // Student default suggestions
    return [
      "Open my attendance",
      "Which subjects are below 75%?",
      "What's my next class?",
      "Where is the library?",
      "Explain deadlock in simple words",
      "Make a quiz on DBMS",
      "Order a masala dosa and a coffee",
      "Find hackathons this month",
    ];
  };

  const suggestions = getRoleSuggestions();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Campus AI Assistant Panel"
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] md:w-[480px] bg-slate-950/95 border-l border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col text-slate-100 animate-in slide-in-from-right duration-300"
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. HEADER */}
      {/* ------------------------------------------------------------- */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <CampusAILogo size="md" isListening={isListening} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base tracking-tight">
                AETHER
              </span>
              <span className="px-1.5 py-0.2 rounded bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold">
                CAMPUS AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Voice & Text Institutional Operating System
            </p>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-1">
          {/* Language Selector Dropdown */}
          <div className="relative group">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as AssistantLanguage)}
              title="Select Assistant Language"
              className="appearance-none pl-2 pr-6 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="en-IN">English (en-IN)</option>
              <option value="te-IN">తెలుగు (te-IN)</option>
              <option value="hi-IN">हिंदी (hi-IN)</option>
            </select>
            <Languages className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none" />
          </div>

          {/* TTS Speech Mute/Unmute */}
          <button
            type="button"
            onClick={() => setVoiceRepliesEnabled(!voiceRepliesEnabled)}
            title={voiceRepliesEnabled ? "Mute Voice Replies" : "Enable Voice Replies"}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {voiceRepliesEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Hands-Free Mode Toggle */}
          <button
            type="button"
            onClick={() => setHandsFree(!handsFree)}
            title={handsFree ? "Hands-Free Listening ON" : "Turn On Hands-Free Mode"}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              handsFree ? "text-amber-400 bg-amber-500/15" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Radio className="w-4 h-4" />
          </button>

          {/* Clear History */}
          <button
            type="button"
            onClick={clearHistory}
            title="Clear Chat History"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Close Panel Button */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              stopListening();
              stopSpeaking();
            }}
            title="Close Assistant"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. "TRY SAYING..." ROLE-BASED CHIP CAROUSEL */}
      {/* ------------------------------------------------------------- */}
      <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Try:
        </span>
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          {suggestions.map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => sendMessage(cmd)}
              className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-500/15 hover:border-cyan-500/40 border border-slate-700/60 text-[11px] text-slate-300 hover:text-cyan-200 transition-all cursor-pointer"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. LIVE SPEECH WAVEFORM BAR (Active when Listening) */}
      {/* ------------------------------------------------------------- */}
      {isListening && (
        <div className="px-4 py-3 bg-gradient-to-r from-cyan-950/60 via-indigo-950/70 to-slate-950 border-b border-cyan-500/30 flex items-center justify-between shrink-0 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
            </span>
            <span className="text-xs font-bold text-cyan-300">
              {transcript ? `"${transcript}"` : "Listening for voice command..."}
            </span>
          </div>

          {/* Simulated Sound Waveform Bars */}
          <div className="flex items-center gap-1">
            {audioLevels.map((lvl, idx) => (
              <span
                key={idx}
                className="w-1 bg-cyan-400 rounded-full transition-all duration-100"
                style={{ height: `${lvl}px` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Mic Error Banner if any */}
      {micError && (
        <div className="p-3 bg-rose-950/80 border-b border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{micError}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. MESSAGE STREAM */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            {/* Sender Label & Timestamp */}
            <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
              {m.sender === "assistant" ? (
                <>
                  <Bot className="w-3 h-3 text-cyan-400" />
                  <span className="font-bold text-slate-300">AETHER AI</span>
                </>
              ) : (
                <span className="font-bold text-slate-300">You</span>
              )}
              <span>· {m.timestamp}</span>
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[92%] rounded-2xl p-3.5 leading-relaxed shadow-md ${
                m.sender === "user"
                  ? "bg-amber-600 text-white rounded-br-xs"
                  : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs"
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              {/* Action Confirm Card (Requires user confirmation) */}
              {m.needsConfirmation && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-amber-500/50 space-y-2.5">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-xs">
                        {m.needsConfirmation.title}
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        {m.needsConfirmation.description}
                      </p>
                      {m.needsConfirmation.warning && (
                        <p className="text-[10px] text-amber-400/90 mt-1">
                          ⚠️ {m.needsConfirmation.warning}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => confirmAction(m.needsConfirmation!.id, "CANCEL")}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmAction(m.needsConfirmation!.id, "CONFIRM")}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Confirm Action
                    </button>
                  </div>
                </div>
              )}

              {/* Interactive Result Cards */}
              {m.results && m.results.length > 0 && (
                <div className="mt-3 space-y-2">
                  {m.results.map((res) => (
                    <div
                      key={res.id}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{res.title}</span>
                        {res.subtitle && (
                          <span className="text-[10px] text-slate-400">{res.subtitle}</span>
                        )}
                      </div>

                      {/* Result Card: Attendance */}
                      {res.type === "attendance" && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                            <span className="text-[11px] text-slate-300 font-semibold">Overall Attendance</span>
                            <span className="font-bold text-sm text-emerald-400">
                              {res.data.overall}%
                            </span>
                          </div>
                          {res.data.atRiskSubjects?.map((s: any) => (
                            <div
                              key={s.code || s.name}
                              className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/60 flex items-center justify-between text-[11px]"
                            >
                              <span className="text-rose-200">{s.name}</span>
                              <span className="font-bold text-rose-300">{s.pct}% (At Risk)</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Result Card: Schedule */}
                      {res.type === "schedule" && (
                        <div className="space-y-1 pt-1">
                          {res.data.schedule?.map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]"
                            >
                              <div>
                                <div className="font-semibold text-white">{item.course}</div>
                                <div className="text-[10px] text-slate-400">{item.room}</div>
                              </div>
                              <span className="font-mono text-cyan-400 text-[10px]">{item.time}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Result Card: Campus Map */}
                      {res.type === "map" && (
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
                          <div className="text-cyan-300 font-semibold">📍 {res.data.directions}</div>
                          <div className="text-slate-400 text-[10px]">Building: {res.data.building} · Floor: {res.data.floor}</div>
                        </div>
                      )}

                      {/* Card Action Link */}
                      {res.actionUrl && (
                        <Link
                          href={res.actionUrl}
                          onClick={() => setIsOpen(false)}
                          className="pt-1 flex items-center justify-between text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] transition-colors"
                        >
                          <span>{res.actionLabel || "View Full Details"}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. BOTTOM INPUT DOCK */}
      {/* ------------------------------------------------------------- */}
      <div className="p-3.5 bg-slate-900 border-t border-slate-800 shrink-0 space-y-2">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          {/* Microphone Push-to-Talk / Toggle Button */}
          {isSpeechSupported ? (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              title={isListening ? "Stop Listening" : "Speak to Campus AI (Speech-to-Text)"}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/50 animate-pulse scale-105"
                  : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          ) : (
            <button
              type="button"
              disabled
              title="Speech not supported in this browser. Please use text input."
              className="p-2.5 rounded-xl bg-slate-800/50 text-slate-600 cursor-not-allowed"
            >
              <MicOff className="w-4 h-4" />
            </button>
          )}

          {/* Query Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              isListening
                ? "Listening... speak now"
                : language === "te-IN"
                ? "క్యాంపస్ AI ని అడగండి (ఉదా: నా అటెండెన్స్ చూపించు)..."
                : language === "hi-IN"
                ? "कैंपस AI से पूछें (उदा: मेरी अटेंडेंस दिखाओ)..."
                : "Ask Campus AI or speak a command..."
            }
            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputQuery.trim() || isSubmitting}
            aria-label="Send Message"
            className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Privacy Note */}
        <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
          <span>🔒 Privacy: Audio is processed client-side. Operations respect your verified role permissions.</span>
        </p>
      </div>
    </div>
  );
}
