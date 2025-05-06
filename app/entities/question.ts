type QuestionStatus = "PENDING" | "ANSWERED";

type Question = {
  id: string;
  userId: string;
  content: string;
  answer?: string;
  timestamp: number;
  status: QuestionStatus;
};

export { Question, QuestionStatus };
