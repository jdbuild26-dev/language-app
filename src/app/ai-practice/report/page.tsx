"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  XCircle,
  BookOpen,
  BarChart2,
  MessageSquare,
  Target,
  TrendingUp,
  Layers,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface StoredMessage {
  sender: "ai" | "user";
  text: string;
  correction?: string | null;
  timestamp?: string;
}

interface ReportData {
  level: string;
  title: string;
  date: string;
  report_markdown: string;
  messages: StoredMessage[];
}

// ---------------------------------------------------------------------------
// Markdown → sections parser
// ---------------------------------------------------------------------------
function parseSections(markdown: string): { title: string; content: string }[] {
  const lines = markdown.split("\n");
  const sections: { title: string; content: string }[] = [];
  let currentTitle = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentTitle) {
        sections.push({ title: currentTitle, content: currentContent.join("\n").trim() });
      }
      currentTitle = line.replace("## ", "").trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  if (currentTitle) {
    sections.push({ title: currentTitle, content: currentContent.join("\n").trim() });
  }
  return sections;
}

// ---------------------------------------------------------------------------
// Table renderer — parses markdown pipe tables
// ---------------------------------------------------------------------------
function MarkdownTable({ raw }: { raw: string }) {
  const rows = raw
    .split("\n")
    .map((r) => r.trim())
    .filter((r) => r.startsWith("|") && !r.match(/^\|[-\s|]+\|$/));

  if (rows.length === 0) return null;

  const parseRow = (row: string) =>
    row
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());

  const [header, ...body] = rows;
  const headers = parseRow(header);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700 mt-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-slate-800">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-2.5 text-left font-semibold text-gray-700 dark:text-slate-300 border-b border-gray-200 dark:border-slate-700"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => {
            const cells = parseRow(row);
            // Colour Strong/Weak rows
            const isStrong = cells.some((c) =>
              c.toLowerCase().includes("strong") || c.toLowerCase().includes("very strong")
            );
            const isWeak = cells.some((c) =>
              c.toLowerCase().includes("weak") || c.toLowerCase().includes("very weak")
            );
            return (
              <tr
                key={ri}
                className={`border-b border-gray-100 dark:border-slate-800 last:border-0 ${
                  ri % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-gray-50/50 dark:bg-slate-800/40"
                }`}
              >
                {cells.map((cell, ci) => {
                  // Badge for Strong/Weak column
                  const lc = cell.toLowerCase();
                  let badge: React.ReactNode = null;
                  if (lc === "strong" || lc === "very strong") {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> {cell}
                      </span>
                    );
                  } else if (lc === "weak" || lc === "very weak") {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                        <XCircle className="w-3 h-3" /> {cell}
                      </span>
                    );
                  } else if (lc === "mixed") {
                    badge = (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                        {cell}
                      </span>
                    );
                  }
                  return (
                    <td key={ci} className="px-4 py-2.5 text-gray-700 dark:text-slate-300 align-top">
                      {badge || cell}
                    </td>
                  );
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
// Section content renderer (text + embedded tables)
// ---------------------------------------------------------------------------
function SectionContent({ content }: { content: string }) {
  // Split content into text and table blocks
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
  if (buffer.length) {
    blocks.push({ type: inTable ? "table" : "text", value: buffer.join("\n").trim() });
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, i) =>
        block.type === "table" ? (
          <MarkdownTable key={i} raw={block.value} />
        ) : block.value ? (
          <div key={i} className="text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
            {block.value}
          </div>
        ) : null
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section icons
// ---------------------------------------------------------------------------
const SECTION_ICONS: Record<number, React.ElementType> = {
  1: BarChart2,
  2: MessageSquare,
  3: CheckCircle2,
  4: Target,
  5: XCircle,
  6: Layers,
  7: BookOpen,
  8: TrendingUp,
  9: BarChart2,
};

// CEFR badge colours
const CEFR_COLORS: Record<string, string> = {
  A1: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  A2: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400",
  B1: "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400",
  B2: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
  C1: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  C2: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400",
};

// ---------------------------------------------------------------------------
// Transcript section
// ---------------------------------------------------------------------------
function TranscriptSection({ messages }: { messages: StoredMessage[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-8 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-slate-800/60 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
      >
        <span className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-sky-500" />
          Conversation Transcript
        </span>
        <span className="text-sm text-gray-500 dark:text-slate-400">
          {expanded ? "Collapse ▲" : "Expand ▼"}
        </span>
      </button>

      {expanded && (
        <div className="p-6 space-y-4 bg-white dark:bg-slate-900">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-sky-500 text-white rounded-tr-sm"
                    : "bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-tl-sm"
                }`}
              >
                {msg.text}
              </div>
              {msg.sender === "user" && msg.correction && (
                <div className="mt-1 max-w-[85%] px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                  ✓ Correction: <span className="font-medium">{msg.correction}</span>
                </div>
              )}
              {msg.timestamp && (
                <span className="text-xs text-gray-400 dark:text-slate-500 mt-1 px-1">
                  {msg.timestamp}
                </span>
              )}
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
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [sections, setSections] = useState<{ title: string; content: string }[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("feedbackReport");
    if (!stored) {
      router.replace("/ai-practice");
      return;
    }
    try {
      const data: ReportData = JSON.parse(stored);
      setReport(data);
      setSections(parseSections(data.report_markdown));
    } catch {
      router.replace("/ai-practice");
    }
  }, []);

  const handlePrint = () => window.print();

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const cefrColor = CEFR_COLORS[report.level] ?? CEFR_COLORS["B1"];
  const formattedDate = new Date(report.date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Screen view                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 print:hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={() => router.push("/ai-practice")}
              className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Practice
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Printer className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Report body */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Report header card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-8 mb-6 shadow-sm">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Session Feedback Report
                </h1>
                <p className="text-gray-500 dark:text-slate-400 text-sm">
                  {report.title} · {formattedDate}
                </p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${cefrColor}`}>
                {report.level} Level
              </span>
            </div>
          </div>

          {/* Transcript */}
          {report.messages && report.messages.length > 0 && (
            <TranscriptSection messages={report.messages} />
          )}

          {/* Sections */}
          <div className="space-y-4 mt-6">
            {sections.map((section, idx) => {
              const sectionNum = idx + 1;
              const Icon = SECTION_ICONS[sectionNum] ?? BookOpen;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm"
                >
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/30 shrink-0">
                      <Icon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    </span>
                    {section.title}
                  </h2>
                  <SectionContent content={section.content} />
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Print-only version                                                   */}
      {/* ------------------------------------------------------------------ */}
      <div ref={printAreaRef} id="report-print-area" style={{ display: 'none' }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "11pt", lineHeight: 1.6, padding: "20mm" }}>
          <div style={{ borderBottom: "2px solid #333", paddingBottom: "12px", marginBottom: "24px" }}>
            <h1 style={{ fontSize: "18pt", margin: 0 }}>Session Feedback Report</h1>
            <p style={{ margin: "4px 0 0", color: "#555" }}>
              {report.title} · {report.level} Level · {formattedDate}
            </p>
          </div>

          {sections.map((section, idx) => (
            <div key={idx} style={{ marginBottom: "20px", pageBreakInside: "avoid" }}>
              <h2 style={{ fontSize: "13pt", borderBottom: "1px solid #ccc", paddingBottom: "4px", marginBottom: "8px" }}>
                {section.title}
              </h2>
              <PrintableSection content={section.content} />
            </div>
          ))}

          {/* Transcript in print */}
          {report.messages && report.messages.length > 0 && (
            <div style={{ marginTop: "24px", pageBreakBefore: "auto" }}>
              <h2 style={{ fontSize: "13pt", borderBottom: "1px solid #ccc", paddingBottom: "4px", marginBottom: "12px" }}>
                Conversation Transcript
              </h2>
              {report.messages.map((msg, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <strong>{msg.sender === "ai" ? "AI" : "You"}{msg.timestamp ? ` (${msg.timestamp})` : ""}:</strong>{" "}
                  {msg.text}
                  {msg.sender === "user" && msg.correction && (
                    <div style={{ marginTop: "2px", color: "#b45309", fontSize: "10pt" }}>
                      ✓ Correction: {msg.correction}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Minimal print-mode section renderer (plain text + tables)
function PrintableSection({ content }: { content: string }) {
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
    <>
      {blocks.map((block, i) => {
        if (block.type === "table") {
          const rows = block.value
            .split("\n")
            .map((r) => r.trim())
            .filter((r) => r.startsWith("|") && !r.match(/^\|[-\s|]+\|$/));
          if (!rows.length) return null;
          const parseRow = (row: string) =>
            row.split("|").slice(1, -1).map((c) => c.trim());
          const [header, ...body] = rows;
          return (
            <table key={i} style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px", fontSize: "10pt" }}>
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  {parseRow(header).map((h, hi) => (
                    <th key={hi} style={{ border: "1px solid #d1d5db", padding: "5px 8px", textAlign: "left" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, ri) => (
                  <tr key={ri}>
                    {parseRow(row).map((cell, ci) => (
                      <td key={ci} style={{ border: "1px solid #d1d5db", padding: "5px 8px", verticalAlign: "top" }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          );
        }
        return block.value ? (
          <p key={i} style={{ margin: "6px 0", whiteSpace: "pre-wrap" }}>
            {block.value}
          </p>
        ) : null;
      })}
    </>
  );
}
