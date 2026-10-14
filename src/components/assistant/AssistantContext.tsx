"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/shared/Toast";
import {
  AssistantAction,
  AssistantLanguage,
  AssistantResultCard,
  PendingConfirmation,
} from "@/lib/assistant/types";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  understoodQuery?: string;
  actions?: AssistantAction[];
  results?: AssistantResultCard[];
  needsConfirmation?: PendingConfirmation | null;
  timestamp: string;
  provider?: string;
}

interface AssistantContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  isSpeaking: boolean;
  stopSpeaking: () => void;
  transcript: string;
  messages: ChatMessage[];
  language: AssistantLanguage;
  setLanguage: (lang: AssistantLanguage) => void;
  voiceRepliesEnabled: boolean;
  setVoiceRepliesEnabled: (enabled: boolean) => void;
  handsFree: boolean;
  setHandsFree: (hf: boolean) => void;
  aiEnabled: boolean;
  setAiEnabled: (enabled: boolean) => void;
  isSpeechSupported: boolean;
  micError: string | null;
  sendMessage: (text: string) => Promise<void>;
  confirmAction: (confirmationId: string, decision: "CONFIRM" | "CANCEL") => Promise<void>;
  clearHistory: () => void;
  audioLevels: number[];
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [language, setLanguageState] = useState<AssistantLanguage>("en-IN");
  const [voiceRepliesEnabled, setVoiceRepliesState] = useState(true);
  const [handsFree, setHandsFreeState] = useState(false);
  const [aiEnabled, setAiEnabledState] = useState(true);
  const [micError, setMicError] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [audioLevels, setAudioLevels] = useState<number[]>([4, 8, 12, 8, 4]);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome-msg",
      sender: "assistant",
      text: "Hello! I am AETHER, your Campus AI assistant. Speak or type any command to check your attendance, look up exam dates, navigate modules, or find campus facilities.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isListeningRef = useRef(false);
  const handsFreeRef = useRef(false);
  const languageRef = useRef(language);

  // Sync refs
  useEffect(() => {
    isListeningRef.current = isListening;
    handsFreeRef.current = handsFree;
    languageRef.current = language;
  }, [isListening, handsFree, language]);

  // Load persistent preferences from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("campus_ai_lang") as AssistantLanguage;
      if (savedLang) setLanguageState(savedLang);

      const savedVoice = localStorage.getItem("campus_ai_voice_replies");
      if (savedVoice !== null) setVoiceRepliesState(savedVoice === "true");

      const savedHf = localStorage.getItem("campus_ai_hands_free");
      if (savedHf !== null) setHandsFreeState(savedHf === "true");

      const savedAi = localStorage.getItem("campus_ai_enabled");
      if (savedAi !== null) setAiEnabledState(savedAi === "true");

      synthRef.current = window.speechSynthesis || null;

      // Check SpeechRecognition support
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRec) {
        setIsSpeechSupported(false);
      }
    }
  }, []);

  const setLanguage = (lang: AssistantLanguage) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") localStorage.setItem("campus_ai_lang", lang);
  };

  const setVoiceRepliesEnabled = (enabled: boolean) => {
    setVoiceRepliesState(enabled);
    if (typeof window !== "undefined") localStorage.setItem("campus_ai_voice_replies", String(enabled));
  };

  const setHandsFree = (hf: boolean) => {
    setHandsFreeState(hf);
    if (typeof window !== "undefined") localStorage.setItem("campus_ai_hands_free", String(hf));
  };

  const setAiEnabled = (enabled: boolean) => {
    setAiEnabledState(enabled);
    if (typeof window !== "undefined") localStorage.setItem("campus_ai_enabled", String(enabled));
    if (!enabled) {
      stopListening();
      stopSpeaking();
      setIsOpen(false);
      setPaletteOpen(false);
    }
  };

  // Waveform animation loop when listening
  useEffect(() => {
    let interval: any;
    if (isListening) {
      interval = setInterval(() => {
        setAudioLevels([
          Math.floor(Math.random() * 20) + 4,
          Math.floor(Math.random() * 32) + 8,
          Math.floor(Math.random() * 40) + 12,
          Math.floor(Math.random() * 30) + 8,
          Math.floor(Math.random() * 18) + 4,
        ]);
      }, 100);
    } else {
      setAudioLevels([4, 8, 12, 8, 4]);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  // Text-To-Speech (SpeechSynthesis)
  const speakText = (text: string) => {
    if (!voiceRepliesEnabled || typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    // Clean markdown headings, bullets, asterisks for natural speech
    const cleanSpeech = text
      .replace(/[#*`_~]/g, "")
      .replace(/\[.*?\]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .slice(0, 300);

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.lang = languageRef.current;
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (handsFreeRef.current) {
        startListening();
      }
    };
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Speech-To-Text (SpeechRecognition)
  const startListening = () => {
    setMicError(null);
    if (typeof window === "undefined") return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setIsSpeechSupported(false);
      setMicError("Speech recognition is not supported in this browser. Please use text input.");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRec();
      recognition.lang = languageRef.current;
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("");
      };

      recognition.onresult = (event: any) => {
        const current = event.results[0][0].transcript;
        setTranscript(current);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setMicError("Microphone access was denied. Please allow microphone permissions in your browser.");
        } else if (event.error === "no-speech") {
          setMicError("No speech detected. Please speak clearly into your microphone.");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Automatically send if transcript has meaningful content
        setTranscript((finalTranscript) => {
          if (finalTranscript && finalTranscript.trim().length > 1) {
            sendMessage(finalTranscript);
          }
          return "";
        });
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn("Failed to start speech recognition:", err);
      setIsListening(false);
      setMicError("Could not start microphone. Try clicking the mic icon again.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignored
      }
    }
    setIsListening(false);
  };

  // Send message to server backend API
  const sendMessage = async (userText: string) => {
    if (!userText || !userText.trim()) return;

    const trimmed = userText.trim();
    const userMsgId = `user_${Date.now()}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Append user message immediately
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: trimmed,
      timestamp: nowTime,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsOpen(true); // Open panel if minimized

    try {
      const res = await fetch("/api/assistant/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: trimmed,
          language: languageRef.current,
          current_page: window.location.pathname,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process query.");

      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        sender: "assistant",
        text: data.reply_text,
        understoodQuery: data.understood_query,
        actions: data.actions,
        results: data.results,
        needsConfirmation: data.needs_confirmation,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        provider: data.provider,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Execute auto-nav actions if present
      if (data.actions && data.actions.length > 0) {
        const nav = data.actions.find((a: AssistantAction) => a.type === "NAVIGATE" && a.targetUrl);
        if (nav && nav.targetUrl) {
          setTimeout(() => {
            router.push(nav.targetUrl);
          }, 800);
        }
      }

      // Voice TTS
      speakText(data.reply_text);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: "assistant",
        text: `Error: ${err.message || "Failed to contact Campus AI. Please check your network connection."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  // Transactional action confirmation handler
  const confirmAction = async (confirmationId: string, decision: "CONFIRM" | "CANCEL") => {
    try {
      const res = await fetch("/api/assistant/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmationId, decision }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Confirmation action failed.");

      // Update message state removing the pending confirmation card
      setMessages((prev) =>
        prev.map((m) =>
          m.needsConfirmation?.id === confirmationId
            ? { ...m, needsConfirmation: null, text: `${m.text}\n\n${data.reply_text}` }
            : m
        )
      );

      toast({
        title: decision === "CONFIRM" ? "Action Confirmed! 🚀" : "Action Cancelled",
        description: data.reply_text,
        variant: decision === "CONFIRM" ? "success" : "info",
      });

      speakText(data.reply_text);
    } catch (err: any) {
      toast({ title: "Confirmation Error", description: err.message, variant: "error" });
    }
  };

  const clearHistory = () => {
    stopSpeaking();
    setMessages([
      {
        id: "cleared-msg",
        sender: "assistant",
        text: "Conversation cleared. How else can I assist your campus schedule, courses, or activities?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Global Keyboard Shortcuts (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
        setPaletteOpen(false);
        stopListening();
        stopSpeaking();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AssistantContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggleOpen: () => setIsOpen((prev) => !prev),
        paletteOpen,
        setPaletteOpen,
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
        aiEnabled,
        setAiEnabled,
        isSpeechSupported,
        micError,
        sendMessage,
        confirmAction,
        clearHistory,
        audioLevels,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const ctx = useContext(AssistantContext);
  if (!ctx) {
    throw new Error("useAssistant must be used within an AssistantProvider");
  }
  return ctx;
}
