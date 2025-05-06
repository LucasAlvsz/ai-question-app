import { Question } from "@/entities/question";

export interface QuestionRepository {
  save: (question: Question) => Promise<void>;
  update: (question: Partial<Question> & { id: string; timestamp: number }) => Promise<void>;
}
