import { QuestionStatus } from "@/entities/question";
import { AIProviderType } from "@/services/ai-services/ai-provider-type";

export type SnsEventMap = {
  QuestionCreated: {
    question: {
      id: string;
      content: string;
      timestamp: number;
      status: QuestionStatus;
      userId: string;
    };
    provider: AIProviderType;
  };
  AnswerReady: {
    question: {
      id: string;
      content: string;
      answer: string;
      timestamp: number;
      status: QuestionStatus;
      userId: string;
    };
  };
};
