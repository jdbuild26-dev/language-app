import { jsPDF } from "jspdf";
import type { EnhancedAnalysisData } from "./EnhancedFeedbackView";
import { normalizeWriteImageSummary } from "./writeImageSummary";
import { stripReportHeading } from "../lib/reportHeading";

const margin = 18;
const pageBottom = 276;
const contentWidth = 174;

async function loadFont(name: string): Promise<string> {
  const response = await fetch(`/fonts/${name}`);
  if (!response.ok) throw new Error("Report font unavailable");
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Report font unavailable"));
    reader.onload = () => resolve(String(reader.result).split(",", 2)[1]);
    reader.readAsDataURL(blob);
  });
}

export async function createWriteImagePdf(data: EnhancedAnalysisData, userText: string): Promise<jsPDF> {
  const dataSummary = data.data_session_summary;
  if ((!data.overall_session_summary && !data.topic_session_summary && !dataSummary) || !data.grammar_language_feedback || !data.corrected_response_segments) {
    throw new Error("Report is incomplete");
  }

  const [regular, bold] = await Promise.all([
    loadFont("NotoSans-Regular.ttf"),
    loadFont("NotoSans-Bold.ttf"),
  ]);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.addFileToVFS("NotoSans-Regular.ttf", regular);
  doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
  doc.addFileToVFS("NotoSans-Bold.ttf", bold);
  doc.addFont("NotoSans-Bold.ttf", "NotoSans", "bold");

  let y = 22;
  const newPageIfNeeded = (needed = 9) => {
    if (y + needed > pageBottom) {
      doc.addPage();
      y = 22;
    }
  };
  const heading = (label: string, size = 14) => {
    newPageIfNeeded(16);
    y += 5;
    doc.setFont("NotoSans", "bold");
    doc.setFontSize(size);
    doc.setTextColor(24, 44, 78);
    doc.text(label, margin, y);
    y += 8;
  };
  const paragraph = (value: string, size = 10.5) => {
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(size);
    doc.setTextColor(43, 55, 72);
    for (const line of value.split("\n")) {
      const wrapped: string[] = doc.splitTextToSize(line || " ", contentWidth);
      for (const piece of wrapped) {
        newPageIfNeeded(5.8);
        doc.text(piece, margin, y);
        y += 5.8;
      }
    }
    y += 3;
  };

  doc.setFont("NotoSans", "bold");
  doc.setFontSize(19);
  doc.setTextColor(37, 86, 196);
  const reportTitle = data.report_kind === "write_analysis" ? "Write About Data" : data.report_kind === "write_documents" ? "Write Documents" : data.report_kind === "write_topic" ? "Write About Topic" : data.report_kind === "speak_topic" ? "Speak About Topic" : data.report_kind === "speak_image" ? "Speak About Image" : "Write About Image";
  doc.text(`${reportTitle} · Analysis Report`, margin, y);
  y += 11;
  paragraph(`CEFR ${data.cefr_level}    ${data.topic_session_summary ? "Overall score" : "Overall content score"} ${data.overall_score}/100`, 10);

  heading("Original Submission");
  paragraph(userText);

  heading("Session Summary");
  if (dataSummary) {
    for (const [label, value] of [
      ["Overall Content Assessment", dataSummary.overall_content_assessment],
      ["What the Learner Did Well", dataSummary.what_the_learner_did_well.join("\n") || "No specific strengths were identified in this response."],
      ["Data Inaccuracies & Incorrect Interpretations", dataSummary.data_inaccuracies.map(issue =>
        `Learner statement: ${issue.learner_statement}\nIssue: ${issue.issue}\nCorrect interpretation: ${issue.correct_interpretation}`).join("\n\n") || "No meaningful data inaccuracies were identified."],
      ["Missing or Underdeveloped Analysis", dataSummary.missing_or_underdeveloped_analysis],
      ["How the Learner Can Improve", dataSummary.how_the_learner_can_improve.map((item, index) => `${index + 1}. ${item}`).join("\n")],
    ]) { heading(label, 11); paragraph(value); }
  } else if (data.topic_session_summary) {
    const summary = data.topic_session_summary;
    for (const [label, value] of [
      ["Task & Objective Achievement", summary.task_objective_achievement],
      [data.report_kind === "speak_topic" ? "Overall Speaking Performance" : "Overall Writing Performance", summary.overall_performance],
      ["What the Learner Did Well", summary.what_the_learner_did_well],
      ["What Could Have Been Better", summary.what_could_have_been_better],
      ["How the Learner Can Improve", summary.how_the_learner_can_improve.map((item, index) => `${index + 1}. ${item}`).join("\n")],
    ]) { heading(label, 11); paragraph(stripReportHeading(value, [label, "Overall Writing/Speaking Performance"])); }
  } else if (data.overall_session_summary) {
    const summary = normalizeWriteImageSummary(data.overall_session_summary);
    for (const [label, value] of [
      ["Overall Description", summary.overall_description],
      ["What the Learner Did Well", summary.what_the_learner_did_well],
      ["What Was Missing or Could Have Been Better", summary.what_was_missing_or_could_have_been_better],
      ["How the Learner Can Improve", summary.how_the_learner_can_improve.map((item, index) => `${index + 1}. ${item}`).join("\n")],
    ]) { heading(label, 11); paragraph(stripReportHeading(value, [label])); }
  }
  heading(data.topic_session_summary || dataSummary ? "Parameter Ratings" : "Content Ratings");
  for (const rating of data.parameters ?? []) {
    paragraph(`${rating.name}: ${rating.score / 10}/10${rating.justification ? `\n${rating.justification}` : ""}`);
  }
  doc.addPage();
  y = 22;
  heading("Suggested Corrections");

  newPageIfNeeded(42);
  heading("Part 1 · Overall Language Feedback");
  paragraph(stripReportHeading(data.grammar_language_feedback, ["Part 1 · Overall Language Feedback", "Overall Language Feedback"]));

  heading("Part 2 · Corrected Learner Response");
  let inlineX = margin;
  const nextInlineLine = () => {
    inlineX = margin;
    y += 6.2;
    newPageIfNeeded(6.2);
  };
  const drawInline = (value: string, color: [number, number, number], strike = false) => {
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...color);
    for (const token of value.replace(/\r/g, "").match(/\n|[^\S\n]+|[^\s]+/g) ?? []) {
      if (token === "\n") {
        nextInlineLine();
        continue;
      }
      const chunks = doc.getTextWidth(token) > contentWidth
        ? doc.splitTextToSize(token, contentWidth) as string[] : [token];
      for (const chunk of chunks) {
        const width = doc.getTextWidth(chunk);
        if (inlineX + width > margin + contentWidth) nextInlineLine();
        if (chunk.trim()) doc.text(chunk, inlineX, y);
        if (strike && chunk.trim()) {
          doc.setDrawColor(...color);
          doc.line(inlineX, y - 1.5, inlineX + width, y - 1.5);
        }
        inlineX += width;
      }
    }
  };
  for (const segment of data.corrected_response_segments) {
    if (segment.type === "unchanged") {
      drawInline(segment.text, [43, 55, 72]);
    } else {
      if (segment.original) drawInline(segment.original, [206, 61, 65], true);
      if (segment.original && segment.corrected) drawInline(" → ", [90, 104, 122]);
      if (segment.corrected) drawInline(segment.corrected, [11, 132, 98]);
      doc.setFont("NotoSans", "bold");
      doc.setFontSize(7);
      doc.setTextColor(37, 86, 196);
      const marker = String(segment.number);
      if (inlineX + doc.getTextWidth(marker) > margin + contentWidth) nextInlineLine();
      doc.text(marker, inlineX, y - 2.4);
      inlineX += doc.getTextWidth(marker);
    }
  }
  y += 9;

  heading("Part 3 · Correction Table");
  const documentGrammar = data.document_grammar;
  const showAlternatives = data.report_kind === "write_image" || data.report_kind === "write_analysis" ||
    data.report_kind === "write_topic" || data.report_kind === "speak_topic" || data.report_kind === "speak_image";
  const correctionRows: { marker: string; cells: string[]; dataOnly?: boolean }[] = documentGrammar
    ? [
        ...documentGrammar.correction_table.map(row => ({
          marker: `${row.number}.`,
          cells: [String(row.number), row.original || "[insertion]", `${row.corrected || "[remove]"}\n${row.explanation}`,
            row.alternatives.map(item => `${item.text} (${item.translation})`).join("\n")],
        })),
        ...documentGrammar.register_suggestions.map(row => ({
          marker: "",
          cells: ["", row.original, `Register suggestion\n${row.explanation}`,
            row.alternatives.map(item => `${item.text} (${item.translation})`).join("\n")],
        })),
      ]
    : (data.grammar_correction_table ?? []).map(row => ({
        marker: `${row.number}.`,
        cells: showAlternatives
          ? [String(row.number), row.original || "[insertion]", row.corrected || "[remove]", row.explanation,
            row.alternatives?.map(item => `${item.text} (${item.translation})`).join("\n") || "No additional alternative needed."]
          : [`${row.number}. ${row.original || "[insertion]"}`, row.corrected || "[remove]", row.explanation],
      }));
  for (const [index, row] of (data.data_suggestions ?? []).entries()) {
    const label = `D${index + 1}`;
    correctionRows.push({ marker: label, dataOnly: true, cells: [label, row.original, "No language correction required",
      `Data accuracy\n${row.explanation}`, row.alternatives?.map(item => `${item.text} (${item.translation})`).join("\n") || "No additional alternative needed."] });
  }
  if (correctionRows.length) {
    const columns = documentGrammar ? [12, 41, 61, 60] : showAlternatives ? [10, 31, 31, 55, 47] : [49, 49, 76];
    const labels = documentGrammar
      ? ["NO.", "LEARNER WORDING", "CORRECTION & EXPLANATION", "ALTERNATIVE SUGGESTIONS"]
      : showAlternatives ? ["#", "YOUR SENTENCE", "CORRECTION", "EXPLANATION", "ALTERNATE SUGGESTIONS"]
        : ["YOUR SENTENCE", "CORRECTION", "EXPLANATION"];
    const starts = columns.map((_, index) => columns.slice(0, index).reduce((start, width) => start + width, margin));
    const tableHeader = () => {
      newPageIfNeeded(12);
      doc.setFillColor(239, 244, 250);
      doc.rect(margin, y - 3, contentWidth, 9, "F");
      doc.setFont("NotoSans", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(45, 60, 85);
      labels.forEach((label, index) => doc.text(label, starts[index] + 2, y + 2));
      y += 9;
    };
    tableHeader();
    for (const { cells, marker, dataOnly } of correctionRows) {
      doc.setFont("NotoSans", "normal");
      doc.setFontSize(8.5);
      const lines = cells.map((cell, index) => doc.splitTextToSize(cell, columns[index] - 5) as string[]);
      const rowHeight = Math.max(...lines.map((cellLines) => cellLines.length)) * 5 + 5;
      // Keep ordinary rows together. Oversized rows continue across pages.
      if (rowHeight <= pageBottom - 31 && y + rowHeight > pageBottom) {
        doc.addPage();
        y = 22;
        tableHeader();
      }
      let offset = 0;
      const totalLines = Math.max(...lines.map((cellLines) => cellLines.length));
      while (offset < totalLines) {
        let capacity = Math.floor((pageBottom - y - 5) / 5);
        if (capacity < 1) {
          doc.addPage();
          y = 22;
          tableHeader();
          capacity = Math.floor((pageBottom - y - 5) / 5);
        }
        const count = Math.min(capacity, totalLines - offset);
        const height = count * 5 + 5;
        doc.setFont("NotoSans", "normal");
        doc.setFontSize(8.5);
        doc.setDrawColor(223, 231, 240);
        doc.rect(margin, y - 2, contentWidth, height);
        lines.forEach((cellLines, index) => {
          const part = cellLines.slice(offset, offset + count);
          if (offset > 0 && index === 0 && !part.length && marker) part.push(documentGrammar || showAlternatives ? marker : `${marker} (continued)`);
          if (showAlternatives) {
            if (!dataOnly && index === 1 && cells[index] !== "[insertion]") doc.setTextColor(185, 28, 28);
            else if (!dataOnly && index === 2 && cells[index] !== "[remove]") doc.setTextColor(4, 120, 87);
            else doc.setTextColor(45, 60, 85);
          }
          if (part.length) doc.text(part, starts[index] + 2, y + 3, { lineHeightFactor: 5 * 72 / 25.4 / 8.5 });
        });
        y += height;
        offset += count;
      }
    }
  } else {
    paragraph(documentGrammar ? "No language corrections or register suggestions." : "No language corrections needed.");
  }

  if (data.report_kind !== "write_analysis") {
    const samples = data.sample_descriptions ?? [];
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(10.5);
    doc.addPage();
    y = 22;
    heading("Sample Answers");
    if (!samples.length) paragraph("No saved sample answers are available for this exercise.");
    samples.forEach((sample, index) => {
      heading(`Sample ${index + 1}`, 11);
      paragraph(sample);
    });
  }

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(8);
    doc.setTextColor(133, 146, 166);
    doc.text(`Page ${page} of ${pages}`, 192, 287, { align: "right" });
  }
  return doc;
}

export async function downloadWriteImagePdf(data: EnhancedAnalysisData, userText: string) {
  const doc = await createWriteImagePdf(data, userText);
  const name = data.report_kind === "write_analysis" ? "Write-About-Data" : data.report_kind === "write_documents" ? "Write-Documents" : data.report_kind === "write_topic" ? "Write-About-Topic" : data.report_kind === "speak_topic" ? "Speak-About-Topic" : data.report_kind === "speak_image" ? "Speak-About-Image" : "Write-About-Image";
  doc.save(`${name}-Report-${Date.now()}.pdf`);
}
