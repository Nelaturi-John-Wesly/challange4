"use client";

import { ModalForm } from "@/components/shared/ModalForm";
import { useToast } from "@/components/shared/Toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Calendar,
  Clock,
  Eye,
  Headphones,
  Heart,
  MessageSquare,
  Newspaper,
  Pause,
  Play,
  Plus,
  Radio,
  Search,
  Share2,
  Sparkles,
  User,
} from "lucide-react";
import React, { useState } from "react";

interface Article {
  id: string;
  title: string;
  category: "Campus News" | "Tech Deep Dive" | "Alumni Voice" | "Op-Ed";
  author: string;
  readTime: string;
  date: string;
  views: number;
  likes: number;
  excerpt: string;
  content: string;
  bannerEmoji: string;
}

const ARTICLES: Article[] = [
  {
    id: "art-1",
    title: "Autonomous Drone Guild Wins National Innovation Gold at IIT Bombay",
    category: "Campus News",
    author: "Sneha Patel (Media Cell Chief)",
    readTime: "4 min read",
    date: "Apr 11, 2026",
    views: 1420,
    likes: 284,
    bannerEmoji: "🛸",
    excerpt: "How 6 undergraduate engineers created a sub-250g search and rescue drone running local vision models on Jetson Orin.",
    content: "The Autonomous Systems Guild captured first place at the national Techfest robotics summit. Competing against 45 universities, the quadcopter demonstrated autonomous indoor obstacle avoidance without GPS signals. Principal investigator Dr. Arvind Narayanan commended the multidisciplinary teamwork between the ECE and CSE departments.",
  },
  {
    id: "art-2",
    title: "Inside the AI Lab: What Quantum Quantization Means for Edge Silicon",
    category: "Tech Deep Dive",
    author: "Aditya Roy (3rd Year ECE)",
    readTime: "6 min read",
    date: "Apr 09, 2026",
    views: 980,
    likes: 195,
    bannerEmoji: "🧠",
    excerpt: "A student perspective on post-training integer quantization and running 8B parameter models on campus server clusters.",
    content: "Deploying high-capability foundation models on student workstations traditionally faced severe memory bottlenecks. Through 4-bit integer quantization (INT4), our computer center now allows students to run real-time audio and vision pipelines locally without incurring commercial cloud API credits.",
  },
  {
    id: "art-3",
    title: "From College Labs to a $100M FinTech: Interview with Vikramaditya Rao",
    category: "Alumni Voice",
    author: "Rohan Varma (Media Cell)",
    readTime: "5 min read",
    date: "Apr 04, 2026",
    views: 2150,
    likes: 412,
    bannerEmoji: "💼",
    excerpt: "2018 Batch alumnus shares the zero-to-one journey of scaling a payments gateway and advice for aspiring student founders.",
    content: "'The most valuable asset college gives you is low-consequence experimentation time,' says Vikramaditya. 'You have 4 years surrounded by brilliant peers with free computing labs. Build things people genuinely use before chasing seed checks.'",
  },
];

export default function MediaPage() {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isPlayingPodcast, setIsPlayingPodcast] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const [storyForm, setStoryForm] = useState({
    title: "",
    category: "Campus News",
    excerpt: "",
    authorName: "Ananya Reddy",
  });

  const handleSubmitStory = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Story Pitched to Media Cell!",
      description: "Editorial board will review your draft for the weekly Chronicle.",
      variant: "success",
    });
    setIsSubmitOpen(false);
    setStoryForm({ ...storyForm, title: "", excerpt: "" });
  };

  const filtered = activeCategory === "All"
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === activeCategory);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
              <Newspaper className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                The Campus Chronicle & Media Cell
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Student journalism, campus podcasts, tech dispatches, and student spotlight stories.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsSubmitOpen(true)}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Submit Story / Op-Ed
        </button>
      </div>

      {/* Featured Podcast Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-900/60 via-slate-900 to-indigo-950 border border-sky-500/30 text-white flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPlayingPodcast(!isPlayingPodcast)}
            className="w-12 h-12 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center justify-center shadow-lg transition-transform hover:scale-105 shrink-0"
          >
            {isPlayingPodcast ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-sky-500/20 text-sky-300 border-sky-400/30 text-[10px] font-bold">
                CAMPUS PODCAST • EPISODE 18
              </Badge>
              {isPlayingPodcast && (
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> PLAYING
                </span>
              )}
            </div>
            <h3 className="font-bold text-base mt-1">
              "How to Crack Tier-1 Placements & Summer Fellowships"
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Featuring final-year placed seniors from Google, Microsoft, and TI. Hosted by Media Cell.
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400 shrink-0">
          24:18 Mins • Stereo 320kbps
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["All", "Campus News", "Tech Deep Dive", "Alumni Voice", "Op-Ed"].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
              activeCategory === cat
                ? "bg-sky-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((art) => (
          <div
            key={art.id}
            className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            <div className="p-5 bg-gradient-to-br from-sky-500/5 to-transparent border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-3xl p-2 rounded-xl bg-white dark:bg-slate-800 border">
                  {art.bannerEmoji}
                </span>
                <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 text-[10px]">
                  {art.category}
                </Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-3 group-hover:text-sky-500 transition-colors line-clamp-2">
                {art.title}
              </h3>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                {art.excerpt}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                <span>By {art.author.split("(")[0]}</span>
                <span>{art.readTime}</span>
              </div>

              <button
                onClick={() => setSelectedArticle(art)}
                className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all text-center"
              >
                Read Full Article
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Article Reader Modal */}
      <ModalForm
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        title={selectedArticle?.title || "Article"}
        description={`${selectedArticle?.category || ""} • By ${selectedArticle?.author || ""}`}
      >
        {selectedArticle && (
          <div className="space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-sky-500" />
                <span>{selectedArticle.date}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-sky-500" /> {selectedArticle.views}
                </span>
                <span className="flex items-center gap-1 text-rose-500">
                  <Heart className="w-3.5 h-3.5 fill-current" /> {selectedArticle.likes}
                </span>
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {selectedArticle.excerpt}
            </p>

            <p className="pt-2 border-t border-slate-200 dark:border-slate-800">
              {selectedArticle.content}
            </p>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold"
              >
                Close Reader
              </button>
            </div>
          </div>
        )}
      </ModalForm>

      {/* Submit Story Modal */}
      <ModalForm
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        title="Pitch Campus Chronicle Story"
        description="Submit your story, event coverage, or op-ed to the media cell"
      >
        <form onSubmit={handleSubmitStory} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold block mb-1">Headline / Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Inside the New Quantum Lab Setup"
              value={storyForm.title}
              onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Category</label>
            <select
              value={storyForm.category}
              onChange={(e) => setStoryForm({ ...storyForm, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
            >
              <option>Campus News</option>
              <option>Tech Deep Dive</option>
              <option>Op-Ed & Student Life</option>
            </select>
          </div>

          <div>
            <label className="font-semibold block mb-1">Story Synopsis / Draft *</label>
            <textarea
              rows={4}
              required
              placeholder="Provide a detailed draft or outline of your report..."
              value={storyForm.excerpt}
              onChange={(e) => setStoryForm({ ...storyForm, excerpt: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md"
          >
            Submit Story to Editorial Board
          </button>
        </form>
      </ModalForm>
    </div>
  );
}
