"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileDown,
  MessageCircle,
  BookOpen,
  Info,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { InlineDiff } from "@/lib/inlineDiff";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { jsPDF } from "jspdf";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface StoredMessage {
  sender: "ai" | "user";
  text: string;
  correction?: string | null;
  timestamp?: string;
}

interface CefrParameter {
  name: string;
  tooltip: string;
  weight: number;
  score: number;
}

interface ReportData {
  level: string;
  title: string;
  date: string;
  report_markdown: string;
  messages: StoredMessage[];
  parameters?: CefrParameter[];
  overall_score?: number | null;
}

interface ParsedTweak {
  original: string;
  corrected: string;
  explanation: string;
  native_version: string;
}

// Grammar table row (used by A1-B2 level prompts)
interface GrammarRow {
  area: string;
  rating: string;
  comment: string;
}

interface ParsedReport {
  overall_score: number;
  cefr_level: string;
  executive_summary: string;
  improved_version: string;
  detailed_tweaks: ParsedTweak[];
  grammar_rows: GrammarRow[];
  sections: { title: string; content: string }[];
}

// ---------------------------------------------------------------------------
// Markdown parser — extracts structured data from the AI report markdown
// ---------------------------------------------------------------------------
function parseReportMarkdown(markdown: string, level: string): ParsedReport {
  const lines = markdown.split("\n");
  const sections: { title: string; content: string }[] = [];
  let currentTitle = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentTitle) {
        sections.push({ title: currentTitle, content: currentContent.join("\n").trim() });
      }
      currentTitle = line.replace(/^##\s*/, "").trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  if (currentTitle) {
    sections.push({ title: currentTitle, content: currentContent.join("\n").trim() });
  }

  // Extract executive summary from section 1 (Overall Summary)
  const summarySection = sections.find((s) =>
    s.title.toLowerCase().includes("overall") || s.title.match(/^1\./)
  );
  const executive_summary = summarySection
    ? summarySection.content.replace(/\|.*\n?/g, "").trim().split("\n")[0] || summarySection.content.slice(0, 300)
    : "Session analysis complete.";

  // Extract CEFR from summary text or use the level from report
  const cefrMatch = executive_summary.match(/\b(A1|A2|B1|B2|C1|C2)\b/);
  const cefr_level = cefrMatch ? cefrMatch[1] : level;

  // Extract tweaks from sentence corrections table
  // Primary: top-level section with "correction"/"mistake"/"error" in title, or numbered 5/6
  // Fallback: scan ALL section contents for a 4-column pipe table (the corrections table)
  const mistakesSection =
    sections.find((s) => {
      const t = s.title.toLowerCase();
      return t.includes("mistake") || t.includes("correction") || t.includes("error") ||
        s.title.match(/^5\./) || s.title.match(/^6\./);
    }) ||
    sections.find((s) => {
      const rows = s.content.split("\n").filter((r) => r.trim().startsWith("|") && !r.match(/^\|[-\s|]+\|$/));
      if (rows.length < 2) return false;
      return rows[0].split("|").slice(1, -1).length >= 4;
    });

  const detailed_tweaks: ParsedTweak[] = [];
  if (mistakesSection) {
    const tableRows = mistakesSection.content
      .split("\n")
      .filter((r) => r.trim().startsWith("|") && !r.match(/^\|[-\s|]+\|$/));
    for (const row of tableRows.slice(1)) {
      const cells = row.split("|").slice(1, -1).map((c) => c.trim());
      if (cells.length >= 2 && cells[0] && cells[1]) {
        detailed_tweaks.push({
          original: cells[0],
          corrected: cells[1],
          explanation: cells[2] || "",
          native_version: cells[3] || "",
        });
      }
    }
  }

  // Extract improved version from section 9 or overall analysis
  const overallSection = sections.find((s) =>
    s.title.toLowerCase().includes("overall analysis") || s.title.match(/^9\./)
  );
  const improved_version = overallSection
    ? overallSection.content.trim().split("\n")[0] || ""
    : "";

  // Derive a score from parameter ratings section if present
  let overall_score = 70;
  const ratingsSection = sections.find((s) =>
    s.title.toLowerCase().includes("parameter rating") || s.title.match(/^3\./)
  );
  if (ratingsSection) {
    const overallMatch = ratingsSection.content.match(/overall rating[:\s]+(\d+)/i);
    if (overallMatch) overall_score = parseInt(overallMatch[1], 10);
  }

  // grammar_rows kept for type compatibility but no longer used
  const grammar_rows: GrammarRow[] = [];

  return { overall_score, cefr_level, executive_summary, improved_version, detailed_tweaks, grammar_rows, sections };
}

// ---------------------------------------------------------------------------
// Table renderer
// ---------------------------------------------------------------------------
function MarkdownTable({ raw }: { raw: string }) {
  const rows = raw
    .split("\n")
    .map((r) => r.trim())
    .filter((r) => r.startsWith("|") && !r.match(/^\|[-\s|]+\|$/));
  if (rows.length === 0) return null;
  const parseRow = (row: string) => row.split("|").slice(1, -1).map((c) => c.trim());
  const [header, ...body] = rows;
  const headers = parseRow(header);
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800 mt-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => {
            const cells = parseRow(row);
            return (
              <tr key={ri} className={`border-b border-slate-50 dark:border-slate-800 last:border-0 ${ri % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-800/40"}`}>
                {cells.map((cell, ci) => {
                  const lc = cell.toLowerCase();
                  let badge: React.ReactNode = null;
                  if (lc === "strong" || lc === "very strong") {
                    badge = <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="w-3 h-3" />{cell}</span>;
                  } else if (lc === "weak" || lc === "very weak") {
                    badge = <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"><XCircle className="w-3 h-3" />{cell}</span>;
                  } else if (lc === "mixed") {
                    badge = <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{cell}</span>;
                  }
                  return <td key={ci} className="px-4 py-2.5 text-slate-700 dark:text-slate-300 align-top">{badge || cell}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section content renderer
// ---------------------------------------------------------------------------
function SectionContent({ content }: { content: string }) {
  const blocks: { type: "text" | "table"; value: string }[] = [];
  const lines = content.split("\n");
  let buffer: string[] = [];
  let inTable = false;
  for (const line of lines) {
    const isTableRow = line.trim().startsWith("|");
    if (isTableRow) {
      if (!inTable) {
        if (buffer.length) blocks.push({ type: "text", value: buffer.join("\n").trim() });
        buffer = [];
        inTable = true;
      }
      buffer.push(line);
    } else {
      if (inTable) {
        blocks.push({ type: "table", value: buffer.join("\n") });
        buffer = [];
        inTable = false;
      }
      buffer.push(line);
    }
  }
  if (buffer.length) blocks.push({ type: inTable ? "table" : "text", value: buffer.join("\n").trim() });
  return (
    <div className="space-y-3">
      {blocks.map((block, i) =>
        block.type === "table" ? (
          <MarkdownTable key={i} raw={block.value} />
        ) : block.value ? (
          <div key={i} className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
            {block.value}
          </div>
        ) : null
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Analysis row with animated progress bar
// ---------------------------------------------------------------------------
function AnalysisRow({ label, value, tooltip }: { label: string; value: number; tooltip?: string }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-white leading-none">{label}</span>
        </div>
        {tooltip ? (
          <div title={tooltip}><Info className="w-5 h-5 text-slate-300 cursor-help" /></div>
        ) : (
          <Info className="w-5 h-5 text-slate-300" />
        )}
      </div>
      <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-emerald-500 rounded-full"
        />
      </div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-12">
        {value}th Percentile
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Transcript section (collapsible)
// ---------------------------------------------------------------------------
function TranscriptSection({ messages }: { messages: StoredMessage[] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <span className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm uppercase tracking-tight">
          <MessageCircle className="w-4 h-4 text-blue-500" />
          Conversation Transcript
        </span>
        <span className="text-sm text-slate-400">{expanded ? "Collapse ▲" : "Expand ▼"}</span>
      </button>
      {expanded && (
        <div className="p-6 space-y-4 border-t border-slate-100 dark:border-slate-800">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.sender === "user" ? "bg-blue-600 text-white rounded-tr-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm"}`}>
                {msg.sender === "user" && msg.correction ? (
                  <InlineDiff original={msg.text} corrected={msg.correction} />
                ) : msg.text}
              </div>
              {msg.timestamp && <span className="text-xs text-slate-400 mt-1 px-1">{msg.timestamp}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function FeedbackReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<ReportData | null>(null);
  const [parsed, setParsed] = useState<ParsedReport | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "tweaks" | "sample">("overview");
  const { speak, isSpeaking } = useTextToSpeech();

  useEffect(() => {
    const stored = sessionStorage.getItem("feedbackReport");
    if (!stored) { router.replace("/ai-practice"); return; }
    try {
      const data: ReportData = JSON.parse(stored);
      setReport(data);
      setParsed(parseReportMarkdown(data.report_markdown, data.level));
    } catch {
      router.replace("/ai-practice");
    }
  }, []);

  const handleDownloadPDF = () => {
    if (!parsed || !report) return;
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("AI PRACTICE FEEDBACK REPORT", 20, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${report.title} · ${report.level} Level · ${timestamp}`, 20, 30);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", 20, 55);
    doc.setFontSize(11);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(51, 65, 85);
    const summaryLines = doc.splitTextToSize(`"${parsed.executive_summary}"`, 170);
    doc.text(summaryLines, 20, 65);
    let y = 65 + summaryLines.length * 7 + 10;
    if (parsed.detailed_tweaks.length > 0) {
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Corrections", 20, y);
      y += 10;
      parsed.detailed_tweaks.forEach((t) => {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(239, 68, 68);
        doc.text(`ORIGINAL: ${t.original}`, 25, y);
        y += 5;
        doc.setTextColor(16, 185, 129);
        doc.text(`CORRECTION: ${t.corrected}`, 25, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        const expl = doc.splitTextToSize(`Note: ${t.explanation}`, 160);
        doc.text(expl, 30, y);
        y += expl.length * 5 + 8;
      });
    }
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Generated by Antigravity AI - Personalized Language Learning Platform", 105, 285, { align: "center" });
    doc.save(`AIReport-${report.level}-${Date.now()}.pdf`);
  };

  if (!report || !parsed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview & Insights" },
    { id: "tweaks", label: "Grammar and Vocabulary Tweaks" },
    { id: "sample", label: "Full Analysis" },
  ] as const;

  const cefrScore = report.overall_score ?? parsed.overall_score;

  // Fallback derived scores (used only if no parameters from analyzeSession)
  const grammarSection = parsed.sections.find((s) => s.title.toLowerCase().includes("grammar") || s.title.match(/^8\./));
  const vocabSection = parsed.sections.find((s) => s.title.toLowerCase().includes("vocab") || s.title.match(/^7\./));
  const commSection = parsed.sections.find((s) => s.title.toLowerCase().includes("communication") || s.title.match(/^3\./));

  const scoreFromSection = (section?: { content: string }) => {
    if (!section) return 65;
    const strong = (section.content.match(/\bstrong\b/gi) || []).length;
    const weak = (section.content.match(/\bweak\b/gi) || []).length;
    const total = strong + weak;
    return total > 0 ? Math.round((strong / total) * 100) : 65;
  };

  const grammarScore = scoreFromSection(grammarSection);
  const vocabScore = scoreFromSection(vocabSection);
  const commScore = scoreFromSection(commSection);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">

        {/* Top Navigation Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "pb-4 px-1 text-sm font-black uppercase tracking-tighter transition-all relative",
                  activeTab === tab.id
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          <AnimatePresence mode="wait">

            {/* ---- OVERVIEW TAB ---- */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                {/* Left column */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Session info card */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Session Report</h3>
                      <button
                        onClick={() => router.push("/ai-practice")}
                        className="flex items-center gap-1 text-blue-600 text-sm font-bold hover:underline"
                      >
                        <ArrowLeft className="w-3 h-3" /> Back
                      </button>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                      {report.title} · {new Date(report.date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
                    </div>
                    {/* Summary section content */}
                    {parsed.sections[0] && (
                      <div className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium text-base">
                        <SectionContent content={parsed.sections[0].content} />
                      </div>
                    )}
                  </div>

                  {/* AI Executive Summary */}
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-8 border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-blue-600"><MessageCircle className="w-6 h-6" /></div>
                      <h3 className="text-lg font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight">AI Executive Summary</h3>
                    </div>
                    <p className="text-lg font-medium text-blue-800 dark:text-blue-200 italic leading-relaxed">
                      "{parsed.executive_summary}"
                    </p>
                  </div>

                  {/* Transcript */}
                  {report.messages && report.messages.length > 0 && (
                    <TranscriptSection messages={report.messages} />
                  )}
                </div>

                {/* Right column */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Score & CEFR cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative flex flex-col items-center justify-center min-h-[140px]">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest absolute top-6 left-6">Overall Score</p>
                      <div className="bg-emerald-500 text-white font-black text-3xl px-6 py-2 rounded-lg shadow-lg mt-4">
                        {cefrScore}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative flex flex-col items-center justify-center min-h-[140px]">
                      <div className="absolute top-6 right-6"><Info className="w-4 h-4 text-slate-300" /></div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest absolute top-6 left-6">CEFR Level Detected</p>
                      <div className="text-5xl font-black text-slate-900 dark:text-white mt-4">{parsed.cefr_level}</div>
                    </div>
                  </div>

                  {/* Session Analysis */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Session Analysis</h4>
                    <div className="space-y-10">
                      {report.parameters && report.parameters.length > 0
                        ? report.parameters.map((p) => (
                            <AnalysisRow key={p.name} label={p.name} value={p.score} tooltip={p.tooltip} />
                          ))
                        : (
                          <>
                            <AnalysisRow label="Vocabulary Range" value={vocabScore} />
                            <AnalysisRow label="Grammar Accuracy" value={grammarScore} />
                            <AnalysisRow label="Communication Success" value={commScore} />
                          </>
                        )
                      }
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-3 pt-2">
                    <Button
                      onClick={() => router.push("/ai-practice")}
                      className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-xl shadow-blue-100 dark:shadow-none"
                    >
                      Continue Practicing
                    </Button>
                    <Button
                      onClick={handleDownloadPDF}
                      variant="outline"
                      className="w-full h-12 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-white flex items-center justify-center gap-2"
                    >
                      <FileDown className="w-5 h-5" />
                      Download Report (PDF)
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ---- TWEAKS TAB ---- */}
            {activeTab === "tweaks" && (
              <motion.div
                key="tweaks"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Grammar & Vocabulary Tweaks</h3>

                {/* Grammar control table (A1–B2 level prompts) */}
                {(parsed?.grammar_rows?.length ?? 0) > 0 && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Grammar Control Analysis</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                            <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 w-[25%]">Grammar Area</th>
                            <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 w-[20%]">Rating</th>
                            <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Comment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsed.grammar_rows.map((row, i) => {
                            const rl = row.rating.toLowerCase();
                            const ratingBadge = rl.includes("strong") ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" />{row.rating}
                              </span>
                            ) : rl.includes("weak") ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                <XCircle className="w-3 h-3" />{row.rating}
                              </span>
                            ) : rl.includes("medium") || rl.includes("mixed") ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                {row.rating}
                              </span>
                            ) : rl.includes("not shown") || rl.includes("n/a") ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-400">
                                {row.rating}
                              </span>
                            ) : (
                              <span className="text-slate-600 dark:text-slate-400">{row.rating}</span>
                            );
                            return (
                              <tr key={i} className={`border-b border-slate-50 dark:border-slate-800 last:border-0 align-top hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/30 dark:bg-slate-800/20"}`}>
                                <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">{row.area}</td>
                                <td className="px-5 py-4">{ratingBadge}</td>
                                <td className="px-5 py-4 text-slate-500 dark:text-slate-400 leading-relaxed italic">{row.comment}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Mistakes table (generic / C1–C2 prompts) */}
                {(parsed?.detailed_tweaks?.length ?? 0) > 0 && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Sentence Corrections</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                            <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 w-[22%]">Your Sentence</th>
                            <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 w-[22%]">Correction</th>
                            <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 w-[20%]">Explanation</th>
                            <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 w-[36%]">More natural way a native would say it</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsed.detailed_tweaks.map((tweak, i) => (
                            <tr key={i} className={`border-b border-slate-50 dark:border-slate-800 last:border-0 align-top hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/30 dark:bg-slate-800/20"}`}>
                              <td className="px-5 py-4 text-slate-600 dark:text-slate-400 leading-relaxed">{tweak.original}</td>
                              <td className="px-5 py-4 leading-relaxed"><span className="text-emerald-600 dark:text-emerald-400 font-semibold">{tweak.corrected}</span></td>
                              <td className="px-5 py-4 text-slate-500 dark:text-slate-400 leading-relaxed italic">{tweak.explanation}</td>
                              <td className="px-5 py-4 leading-relaxed">
                                {tweak.native_version ? (
                                  <span className="inline-flex items-start gap-2">
                                    <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <span className="text-slate-800 dark:text-slate-200 font-medium">{tweak.native_version}</span>
                                  </span>
                                ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {(parsed?.grammar_rows?.length ?? 0) === 0 && (parsed?.detailed_tweaks?.length ?? 0) === 0 && (
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-100 dark:border-slate-800 text-center">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                      <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No corrections found — great session!</p>
                    </div>
                    {process.env.NODE_ENV === "development" && (
                      <details className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
                        <summary className="cursor-pointer font-bold mb-2">Debug: section titles</summary>
                        <pre>{parsed.sections.map((s, i) => `${i}: "${s.title}"`).join("\n")}</pre>
                      </details>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ---- FULL ANALYSIS TAB ---- */}
            {activeTab === "sample" && (
              <motion.div
                key="sample"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Full Analysis</h3>
                {parsed.sections.map((section, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                    <h2 className="text-base font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 shrink-0 text-blue-600 dark:text-blue-400 text-xs font-black">
                        {idx + 1}
                      </span>
                      {section.title}
                    </h2>
                    <SectionContent content={section.content} />
                  </div>
                ))}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
