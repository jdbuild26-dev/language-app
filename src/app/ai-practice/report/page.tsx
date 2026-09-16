"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileDown,
  MessageCircle,
  Info,
  CheckCircle2,
  XCircle,
  Languages,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, ChatCircleText, CheckCircle, Lightbulb, BookOpenText, TextAa, Waveform, ChatsCircle, Leaf, Compass } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InlineDiff } from "@/lib/inlineDiff";
import MessageBubble from "@/features/ai-practice/components/chat/MessageBubble";
import { translateText } from "@/services/aiPracticeApi";
import { getLangName } from "@/utils/languages";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface StoredMessage {
  id: string;
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
  learningLanguage?: string;
  translationLanguage?: string;
  learnerInstruction?: string;
  instructionTranslation?: string;
}

interface ParsedTweak {
  original: string;
  corrected: string;
  explanation: string;
  native_version: string;
}

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
// Markdown parser
// ---------------------------------------------------------------------------
function parseReportMarkdown(markdown: string, level: string): ParsedReport {
  const lines = markdown.split("\n");
  const sections: { title: string; content: string }[] = [];
  let currentTitle = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentTitle) sections.push({ title: currentTitle, content: currentContent.join("\n").trim() });
      currentTitle = line.replace(/^##\s*/, "").trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  if (currentTitle) sections.push({ title: currentTitle, content: currentContent.join("\n").trim() });

  const summarySection = sections.find((s) => s.title.toLowerCase().includes("overall") || s.title.match(/^1\./));
  const executive_summary = summarySection
    ? summarySection.content.replace(/\|.*\n?/g, "").trim().split("\n")[0] || summarySection.content.slice(0, 300)
    : "Session analysis complete.";

  const cefrMatch = executive_summary.match(/\b(A1|A2|B1|B2|C1|C2)\b/);
  const cefr_level = cefrMatch ? cefrMatch[1] : level;

  // Extract sentence corrections (4-col table)
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
        detailed_tweaks.push({ original: cells[0], corrected: cells[1], explanation: cells[2] || "", native_version: cells[3] || "" });
      }
    }
  }

  const overallSection = sections.find((s) => s.title.toLowerCase().includes("overall analysis") || s.title.match(/^9\./));
  const improved_version = overallSection ? overallSection.content.trim().split("\n")[0] || "" : "";

  let overall_score = 70;
  const ratingsSection = sections.find((s) => s.title.toLowerCase().includes("parameter rating") || s.title.match(/^3\./));
  if (ratingsSection) {
    const overallMatch = ratingsSection.content.match(/overall rating[:\s]+(\d+)/i);
    if (overallMatch) overall_score = parseInt(overallMatch[1], 10);
  }

  const grammar_rows: GrammarRow[] = [];
  return { overall_score, cefr_level, executive_summary, improved_version, detailed_tweaks, grammar_rows, sections };
}

// ---------------------------------------------------------------------------
// Section content renderer
// ---------------------------------------------------------------------------
function MarkdownTable({ raw }: { raw: string }) {
  const rows = raw.split("\n").map((r) => r.trim()).filter((r) => r.startsWith("|") && !r.match(/^\|[-\s|]+\|$/));
  if (rows.length === 0) return null;
  const parseRow = (row: string) => row.split("|").slice(1, -1).map((c) => c.trim());
  const [header, ...body] = rows;
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800 mt-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            {parseRow(header).map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} className={`border-b border-slate-50 dark:border-slate-800 last:border-0 ${ri % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-800/40"}`}>
              {parseRow(row).map((cell, ci) => {
                const lc = cell.toLowerCase();
                let badge: React.ReactNode = null;
                if (lc === "strong" || lc === "very strong") badge = <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3" />{cell}</span>;
                else if (lc === "weak" || lc === "very weak") badge = <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700"><XCircle className="w-3 h-3" />{cell}</span>;
                else if (lc === "mixed") badge = <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">{cell}</span>;
                return <td key={ci} className="px-4 py-2.5 text-slate-700 dark:text-slate-300 align-top">{badge || cell}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InlineMarkdown({ value }: { value: string }) {
  return <>{value.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index} className="rounded bg-slate-100 px-1 py-0.5 text-[0.9em] dark:bg-slate-800">{part.slice(1, -1)}</code>;
    return part;
  })}</>;
}

function SectionContent({ content }: { content: string }) {
  type ContentBlock = { type: "table"; value: string } | { type: "heading"; value: string } | { type: "paragraph"; value: string } | { type: "list"; value: string[] };
  const blocks: ContentBlock[] = [];
  const lines = content.split("\n");
  let paragraph: string[] = [];
  let list: string[] = [];
  let table: string[] = [];

  const flushParagraph = () => { if (paragraph.length) blocks.push({ type: "paragraph", value: paragraph.join(" ").trim() }); paragraph = []; };
  const flushList = () => { if (list.length) blocks.push({ type: "list", value: list }); list = []; };
  const flushTable = () => { if (table.length) blocks.push({ type: "table", value: table.join("\n") }); table = []; };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith("|")) {
      flushParagraph(); flushList(); table.push(rawLine); continue;
    }
    flushTable();
    const heading = line.match(/^#{3,6}\s+(.+)$/);
    if (heading) {
      flushParagraph(); flushList(); blocks.push({ type: "heading", value: heading[1] }); continue;
    }
    const bullet = line.match(/^(?:[-*•])\s+(.+)$/);
    if (bullet) {
      flushParagraph(); list.push(bullet[1]); continue;
    }
    if (!line) { flushParagraph(); flushList(); continue; }
    flushList(); paragraph.push(line);
  }
  flushParagraph(); flushList(); flushTable();

  return (
    <div className="w-full min-w-0 space-y-4 break-words">
      {blocks.map((block, i) => {
        if (block.type === "table") return <MarkdownTable key={i} raw={block.value} />;
        if (block.type === "heading") return (
          <div key={i} className="mt-7 border-l-2 border-blue-500 pl-3 first:mt-0">
            <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white"><InlineMarkdown value={block.value} /></h3>
          </div>
        );
        if (block.type === "list") return (
          <ul key={i} className="space-y-2 pl-1 text-base leading-7 text-slate-700 dark:text-slate-200">
            {block.value.map((item, itemIndex) => <li key={itemIndex} className="flex gap-2"><span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" /><span className="min-w-0 flex-1"><InlineMarkdown value={item} /></span></li>)}
          </ul>
        );
        return <p key={i} className="text-base leading-7 text-slate-700 dark:text-slate-200"><InlineMarkdown value={block.value} /></p>;
      })}
    </div>
  );
}

function isParameterSection(title: string) {
  return /\bparameter\b/i.test(title);
}

function formatPdfContent(content: string) {
  return content
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || /^\|[-\s|]+\|$/.test(trimmed)) return "";
      if (trimmed.startsWith("|")) {
        return trimmed.split("|").slice(1, -1).map((cell) => cell.trim()).filter(Boolean).join(" - ");
      }
      return trimmed.replace(/^#{1,6}\s*/, "");
    })
    .filter(Boolean)
    .join("\n");
}

// ---------------------------------------------------------------------------
// Analysis row
// ---------------------------------------------------------------------------
function AnalysisRow({ label, value, tooltip }: { label: string; value: number; tooltip?: string }) {
  const parameterLabel = label.toLowerCase();
  const ParameterIcon = /task|completion/.test(parameterLabel) ? Target
    : /comprehens/.test(parameterLabel) ? ChatCircleText
    : /appropriat/.test(parameterLabel) ? CheckCircle
    : /expression|meaning|express/.test(parameterLabel) ? Lightbulb
    : /vocab/.test(parameterLabel) ? BookOpenText
    : /grammar/.test(parameterLabel) ? TextAa
    : /fluen|continuity/.test(parameterLabel) ? Waveform
    : /interaction/.test(parameterLabel) ? ChatsCircle
    : /natural/.test(parameterLabel) ? Leaf
    : Compass;
  const scoreTone = value >= 75
    ? { bar: "bg-emerald-500" }
    : value >= 60
      ? { bar: "bg-amber-500" }
      : { bar: "bg-red-500" };
  const scoreMeaning = value >= 75
    ? "Strong"
    : value >= 60
      ? "Developing well"
      : value >= 40
        ? "Needs attention"
        : "Needs focused practice";
  return (
    <div className="min-w-0 space-y-3">
      <div className="flex min-h-12 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <ParameterIcon weight="duotone" size={24} aria-hidden="true" className="shrink-0 text-blue-600/80 dark:text-blue-400" />
          <span className="min-w-0 text-base font-semibold leading-6 text-slate-900 dark:text-white">{label}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="whitespace-nowrap text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100">{value}<span className="text-xs font-normal text-slate-500 dark:text-slate-400"> /100</span></span>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" aria-label={`More information about ${label}`} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 outline-none transition-colors hover:bg-slate-200/60 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200">
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">{tooltip}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      <div role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} className="relative h-2 w-full bg-slate-200/70 dark:bg-slate-800 rounded-full overflow-hidden">
        <div style={{ width: `${Math.max(0, Math.min(100, value))}%` }} className={`h-full rounded-full ${scoreTone.bar}`} />
      </div>
      <div className="text-xs leading-5 text-slate-600 dark:text-slate-400">{scoreMeaning}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grammar Mistakes transcript with each suggestion directly below its message
// ---------------------------------------------------------------------------
function GrammarMistakesPane({ tweaks, messages }: { tweaks: ParsedTweak[]; messages: StoredMessage[] }) {
  const { realTweaks, matchingTweaksByMessage, unlinkedTweaks } = useMemo(() => {
    const seenTweaks = new Set<string>();
    const validTweaks = tweaks.filter((tweak) => {
      if ((tweak.original ?? "").trim() === (tweak.corrected ?? "").trim()) return false;
      const key = [tweak.original, tweak.corrected, tweak.explanation, tweak.native_version].map((value) => (value || "").trim().toLowerCase()).join("|");
      if (seenTweaks.has(key)) return false;
      seenTweaks.add(key);
      return true;
    });
    const matches = new Map<StoredMessage, ParsedTweak[]>();
    const remainingTweaks = [...validTweaks];

    messages.forEach((message) => {
      if (message.sender !== "user") return;
      const messageTweaks = remainingTweaks.filter((tweak) => tweak.original && message.text.includes(tweak.original));
      matches.set(message, messageTweaks);
      messageTweaks.forEach((tweak) => remainingTweaks.splice(remainingTweaks.indexOf(tweak), 1));
    });

    return {
      realTweaks: validTweaks,
      matchingTweaksByMessage: matches,
      unlinkedTweaks: remainingTweaks,
    };
  }, [messages, tweaks]);

  return (
    <div className="min-h-[500px] bg-white dark:bg-slate-950">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <MessageCircle className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">Grammar mistakes</span>
      </div>
      {realTweaks.length === 0 ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center p-12 text-center">
          <CheckCircle2 className="mb-4 h-12 w-12 text-emerald-500" />
          <p className="text-lg font-bold text-slate-600 dark:text-slate-300">No corrections needed for this session</p>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 md:py-8">
          {messages.map((msg, mi) => {
            const isUser = msg.sender === "user";
            const matchingTweaks = isUser ? (matchingTweaksByMessage.get(msg) || []) : [];
            return (
              <div key={mi} className={`flex flex-col ${isUser ? "items-end" : "items-start"} gap-2`}>
                <div className={`w-fit max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[76%] ${
                  isUser
                    ? "rounded-tr-sm bg-blue-600 text-white shadow-sm"
                    : "rounded-tl-sm border border-slate-100 bg-white text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                }`}>
                  {isUser && msg.correction ? (
                    <InlineDiff original={msg.text} corrected={msg.correction} />
                  ) : msg.text}
                </div>
                {matchingTweaks.map((tweak, index) => (
                  <div key={`${mi}-${index}`} className="w-fit max-w-[88%] border-l-2 border-sky-400 py-0.5 pl-3 sm:max-w-[76%]">
                    {tweak.explanation && <p className="text-sm italic leading-relaxed text-slate-500 dark:text-slate-400">{tweak.explanation}</p>}
                    {tweak.native_version && tweak.native_version !== tweak.corrected && (
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300"><span className="font-medium text-slate-500 dark:text-slate-400">More natural: </span>{tweak.native_version}</p>
                    )}
                  </div>
                ))}
                {msg.timestamp && <span className="px-1 text-[10px] text-slate-400">{msg.timestamp}</span>}
              </div>
            );
          })}
          {unlinkedTweaks.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Other suggestions</p>
              <div className="mt-3 space-y-3">
                {unlinkedTweaks.map((tweak, index) => (
                  <div key={index} className="border-l-2 border-sky-400 pl-3">
                    <p className="text-sm text-slate-700 dark:text-slate-200"><span className="font-medium">Correction: </span>{tweak.corrected}</p>
                    {tweak.explanation && <p className="mt-1 text-sm italic text-slate-500 dark:text-slate-400">{tweak.explanation}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
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
  const [activeTab, setActiveTab] = useState<"conversation" | "grammar" | "feedback">("conversation");
  const [showInstructionTranslation, setShowInstructionTranslation] = useState(false);
  const [translatedInstruction, setTranslatedInstruction] = useState<string | null>(null);
  const [isTranslatingInstruction, setIsTranslatingInstruction] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownloadPDF = async () => {
    if (!parsed || !report) return;
    setIsDownloading(true);
    try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    const bottom = pageHeight - 18;
    let y = margin;
    const addPage = () => { doc.addPage(); y = margin; };
    const ensureSpace = (height: number) => { if (y + height > bottom) addPage(); };
    const write = (text: string, options?: { size?: number; style?: "normal" | "bold" | "italic"; color?: [number, number, number]; gap?: number }) => {
      const size = options?.size ?? 10.5;
      const lineHeight = size * 0.46;
      doc.setFont("helvetica", options?.style ?? "normal");
      doc.setFontSize(size);
      doc.setTextColor(...(options?.color ?? [31, 41, 55]));
      for (const paragraph of (text || "—").split("\n")) {
        const wrappedLines = doc.splitTextToSize(paragraph || " ", contentWidth) as string[];
        for (const line of wrappedLines) {
          ensureSpace(lineHeight);
          doc.text(line, margin, y);
          y += lineHeight;
        }
      }
      y += options?.gap ?? 1.5;
    };
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("AI PRACTICE FEEDBACK REPORT", margin, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${report.title} · ${report.level} Level`, margin, 30);
    y = 52;
    write("Session details", { size: 15, style: "bold", gap: 3 });
    write(`${report.title} | ${report.level} | ${new Date(report.date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}`, { size: 10, color: [71, 85, 105], gap: 3 });
    if (report.learnerInstruction) {
      write("Instructions", { size: 14, style: "bold", gap: 2 });
      write(report.learnerInstruction, { gap: 4 });
    }
    write("Session analysis", { size: 14, style: "bold", gap: 2 });
    write(`Overall score: ${cefrScore}%`, { style: "bold", gap: 2 });
    (report.parameters || []).forEach((parameter) => write(`${parameter.name}: ${parameter.score}%`, { size: 10, gap: 0.75 }));
    parsed.sections.filter((section) => !isParameterSection(section.title)).forEach((section) => {
      ensureSpace(12);
      write(section.title, { size: 14, style: "bold", gap: 2 });
      write(formatPdfContent(section.content), { gap: 4 });
    });
    ensureSpace(12);
    write("Transcript", { size: 14, style: "bold", gap: 2 });
    report.messages.forEach((message) => {
      ensureSpace(10);
      write(`${message.sender === "ai" ? "AI conversation partner" : "You"}${message.timestamp ? ` | ${message.timestamp}` : ""}`, { size: 10, style: "bold", color: [2, 132, 199], gap: 0.5 });
      write(message.text, { gap: message.correction ? 1 : 3 });
      if (message.sender === "user" && message.correction) write(`Correction: ${message.correction}`, { size: 9.5, style: "italic", color: [180, 83, 9], gap: 3 });
    });
    const pageCount = doc.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
      doc.setPage(page);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 9, { align: "right" });
    }
    doc.save(`AIReport-${report.level}-${Date.now()}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleInstructionTranslation = async () => {
    if (!report?.learnerInstruction) return;
    if (showInstructionTranslation) {
      setShowInstructionTranslation(false);
      return;
    }
    const targetLanguage = report.translationLanguage || "en";
    if (targetLanguage === "en" && report.instructionTranslation) {
      setShowInstructionTranslation(true);
      return;
    }
    if (translatedInstruction) {
      setShowInstructionTranslation(true);
      return;
    }
    try {
      setIsTranslatingInstruction(true);
      const result = await translateText(report.learnerInstruction, targetLanguage);
      setTranslatedInstruction(result.translation);
      setShowInstructionTranslation(true);
    } catch {
      setTranslatedInstruction("Translation unavailable. Please try again.");
      setShowInstructionTranslation(true);
    } finally {
      setIsTranslatingInstruction(false);
    }
  };

  if (!report || !parsed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const tabs = [
    { id: "conversation", label: "Transcript" },
    { id: "grammar",      label: "Grammar Mistakes" },
    { id: "feedback",     label: "Feedback Report" },
  ] as const;

  const cefrScore = report.overall_score ?? parsed.overall_score;
  const overallMeaning = cefrScore >= 90
    ? "Excellent"
    : cefrScore >= 75
      ? "Good"
      : cefrScore >= 60
        ? "Fair"
        : cefrScore >= 40
          ? "Weak"
          : "Very weak";

  const scoreFromSection = (section?: { content: string }) => {
    if (!section) return 65;
    const strong = (section.content.match(/\bstrong\b/gi) || []).length;
    const weak = (section.content.match(/\bweak\b/gi) || []).length;
    const total = strong + weak;
    return total > 0 ? Math.round((strong / total) * 100) : 65;
  };
  const grammarSection = parsed.sections.find((s) => s.title.toLowerCase().includes("grammar") || s.title.match(/^8\./));
  const vocabSection   = parsed.sections.find((s) => s.title.toLowerCase().includes("vocab")   || s.title.match(/^7\./));
  const commSection    = parsed.sections.find((s) => s.title.toLowerCase().includes("communication") || s.title.match(/^3\./));

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-4 px-4 pb-2 pt-6 md:px-8">

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-5 overflow-x-auto sm:gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative whitespace-nowrap px-1 pb-4 text-sm font-black uppercase tracking-tighter transition-all focus-visible:outline-blue-500",
                  activeTab === tab.id ? "text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">

          {/* ── ORIGINAL CONVERSATION ── */}
          {activeTab === "conversation" && (
            <motion.div key="conv" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-black uppercase tracking-widest text-slate-500">Transcript</span>
                  </div>
                </div>
                {report.learnerInstruction && (
                  <div className="mx-4 my-4 rounded-2xl border border-sky-100 bg-sky-50/70 px-5 py-4 shadow-sm dark:border-sky-900/60 dark:bg-sky-950/20 sm:mx-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-sky-700 dark:text-sky-300">Instructions</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{showInstructionTranslation ? (translatedInstruction || report.instructionTranslation || report.learnerInstruction) : report.learnerInstruction}</p>
                    {report.translationLanguage && report.translationLanguage !== report.learningLanguage && (
                      <button type="button" onClick={handleInstructionTranslation} disabled={isTranslatingInstruction} className="mt-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-100 active:scale-[0.97] disabled:opacity-60 dark:text-sky-300 dark:hover:bg-sky-900/50">
                        <Languages className="h-3.5 w-3.5" />
                        {isTranslatingInstruction ? "Translating..." : showInstructionTranslation ? "Show original" : `Translate to ${getLangName(report.translationLanguage || "en")}`}
                      </button>
                    )}
                  </div>
                )}
                <div className="space-y-4 p-6">
                  {report.messages && report.messages.length > 0 ? report.messages.map((msg, i) => (
                    <MessageBubble key={msg.id || i} message={msg} learningLanguage={report.learningLanguage || "fr"} translationLanguage={report.translationLanguage || "en"} showCorrectedAsPrimary />
                  )) : (
                    <p className="text-slate-400 text-center py-8">No conversation recorded.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── GRAMMAR MISTAKES ── */}
          {activeTab === "grammar" && (
            <motion.div key="grammar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                <GrammarMistakesPane
                  tweaks={parsed.detailed_tweaks}
                  messages={report.messages || []}
                />
              </div>
            </motion.div>
          )}

          {/* ── FEEDBACK REPORT ── */}
          {activeTab === "feedback" && (
            <motion.div key="feedback" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-10 pb-8 pt-4">

              {/* Scores and analysis lead the page; the detailed report follows below. */}
              <section className="space-y-7">
                <div className="flex flex-col gap-6 border-b border-slate-200 pb-7 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap items-start justify-between gap-4 lg:flex-1">
                    <div>
                      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{report.title}</h1>
                      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Session feedback · {new Date(report.date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Overall score</p>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className={`text-3xl font-semibold tabular-nums tracking-tight ${cefrScore >= 75 ? "text-emerald-600 dark:text-emerald-400" : cefrScore >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>{cefrScore}<span className="text-lg">%</span></span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{overallMeaning}</span>
                      </div>
                    </div>
                    <div className="h-10 w-px bg-slate-200 dark:bg-slate-800" />
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">CEFR level</p>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{parsed.cefr_level}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="py-1">
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Session analysis</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Each area is scored on a 0–100 scale.</p>
                  </div>
                  <div className="grid w-full min-w-0 grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 xl:grid-cols-3 xl:gap-x-10">
                    {report.parameters && report.parameters.length > 0
                      ? report.parameters.map((p) => <AnalysisRow key={p.name} label={p.name} value={p.score} tooltip={p.tooltip} />)
                      : <>
                          <AnalysisRow label="Vocabulary Range" value={scoreFromSection(vocabSection)} />
                          <AnalysisRow label="Grammar Accuracy" value={scoreFromSection(grammarSection)} />
                          <AnalysisRow label="Communication Success" value={scoreFromSection(commSection)} />
                        </>
                    }
                  </div>
                </div>
              </section>

              <section className="border-t border-slate-200 pt-8 dark:border-slate-800" aria-labelledby="written-report-title">
                <div className="mb-7">
                  <p className="mb-2 text-xs font-medium tracking-wide text-blue-600 dark:text-blue-400">Your conversation, reviewed</p>
                  <h2 id="written-report-title" className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Session report</h2>
                </div>
                <div>
                  <Accordion type="multiple" defaultValue={["section-0"]} className="min-w-0">
                    {parsed.sections.length === 0 && <p className="text-sm text-slate-500">Written feedback is not available for this session.</p>}
                    {parsed.sections.filter((section) => !isParameterSection(section.title)).map((section, index) => (
                      <AccordionItem id={`report-section-${index}`} key={index} value={`section-${index}`} className="scroll-mt-8">
                        <AccordionTrigger className="py-6">
                          <span className="text-xs font-medium tabular-nums text-blue-600 dark:text-blue-400">{String(index + 1).padStart(2, "0")}</span>
                          <span className="flex-1 text-base font-semibold sm:text-lg">{section.title.replace(/^\d+[.)]\s*/, "")}</span>
                        </AccordionTrigger>
                        <AccordionContent className="w-full min-w-0 pb-8"><SectionContent content={section.content} /></AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </section>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:justify-end">
                  <Button onClick={() => router.push("/ai-practice")} className="h-12 rounded-xl bg-blue-600 text-base font-black text-white shadow-xl shadow-blue-100 hover:bg-blue-700 dark:shadow-none">
                    Continue Practicing
                  </Button>
                  <Button onClick={handleDownloadPDF} disabled={isDownloading} variant="outline" className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-slate-100 bg-white font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-white">
                    <FileDown className="w-5 h-5" />
                    {isDownloading ? "Preparing PDF..." : "Download Report (PDF)"}
                  </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      </div>
    </TooltipProvider>
  );
}
