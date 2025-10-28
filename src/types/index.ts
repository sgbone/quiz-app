export interface QuizOption {
  label: string;
  text: string;
}

export interface QuizQuestion {
  id: number;
  type: "single" | "multiple" | "binary";
  question: string;
  options: QuizOption[];
  correct: string[];
  points: number;
  explanation: string;
  image_url?: string;
}

export interface QuizInfo {
  id: number;
  name: string;
  description?: string;
  questions: QuizQuestion[];
}
