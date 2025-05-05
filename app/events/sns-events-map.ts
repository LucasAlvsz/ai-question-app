export type SnsEventMap = {
  QuestionCreated: {
    question: {
      id: string;
      content: string;
    };
    timestamp: number;
  };
  AnswerReady: {
    question: {
      id: string;
      answer: string;
    };
    timestamp: number;
  };
};
