import * as XLSX from "xlsx";
import { QuizQuestion, QuizOption } from "../types";

const toStr = (v: any): string => {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.map(toStr).join(", ");
  try {
    return String(v);
  } catch {
    return "";
  }
};

export const parseQuizFromExcel = (file: File): Promise<QuizQuestion[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        const processedData: QuizQuestion[] = jsonData.map((row, idx) => {
          const options: QuizOption[] = [];
          ["A", "B", "C", "D", "E", "F", "G", "H"].forEach((letter) => {
            const optionKey = `option${letter}`;
            if (row[optionKey] != null && row[optionKey] !== "") {
              options.push({ label: letter, text: toStr(row[optionKey]) });
            }
          });

          const correctAnswers = toStr(row.correct)
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean);

          return {
            id: row.id ?? `${Date.now()}-${idx}`,
            type: row.type === "multiple" ? "multiple" : "single",
            question: toStr(row.question),
            options,
            correct: correctAnswers,
            points: Number(row.points) || 1,
            explanation: toStr(row.explanation),
            image_url: toStr(row.image_url),
          };
        });
        resolve(processedData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};
