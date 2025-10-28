import * as XLSX from "xlsx";
import { QuizQuestion, QuizOption } from "../types"; // Import thêm QuizOption

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

        const processedData: QuizQuestion[] = jsonData.map((row) => {
          // SỬA LẠI DÒNG NÀY
          const options: QuizOption[] = [];

          ["A", "B", "C", "D", "E", "F", "G", "H"].forEach((letter) => {
            const optionKey = `option${letter}`;
            if (row[optionKey]) {
              options.push({ label: letter, text: row[optionKey] });
            }
          });

          const correctAnswers = row.correct
            ? row.correct
                .toString()
                .split(",")
                .map((a: string) => a.trim())
            : [];

          return {
            id: row.id,
            type: row.type || "single",
            question: row.question,
            options,
            correct: correctAnswers,
            points: row.points || 1,
            explanation: row.explanation || "",
            image_url: row.image_url || "",
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
