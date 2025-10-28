import * as XLSX from "xlsx";
import { QuizQuestion } from "../types";

export const exportResultsToExcel = (
  quizData: QuizQuestion[],
  answers: Record<number, string[]>
) => {
  const results = quizData.map((question) => {
    const userAnswers = answers[question.id] || [];
    const isCorrect =
      userAnswers.length === question.correct.length &&
      userAnswers.every((a) => question.correct.includes(a));

    return {
      "Câu hỏi": question.question,
      "Đáp án của bạn": userAnswers.join(", "),
      "Đáp án đúng": question.correct.join(", "),
      "Kết quả": isCorrect ? "Đúng" : "Sai",
      Điểm: isCorrect ? question.points : 0,
    };
  });

  const ws = XLSX.utils.json_to_sheet(results);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Kết quả");
  XLSX.writeFile(wb, `ket-qua-${Date.now()}.xlsx`);
};
