import { Question } from "@/entities/question";

export interface QuestionRepository {
  save: (question: Question) => Promise<void>;
}
