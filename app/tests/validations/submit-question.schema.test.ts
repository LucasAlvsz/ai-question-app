import { AIProviderType } from "@/services/ai-services/ai-provider-type";
import { SubmitQuestionData, SubmitQuestionSchema } from "@/validations/submit-question.schema";

describe("SubmitQuestionSchema", () => {
  const submitData: SubmitQuestionData = {
    question: {
      content: "Qual a capital do Brasil?",
      userId: "a3f23e29-8dcf-4b51-8b6f-df147911b21e",
    },
    provider: AIProviderType.HUGGINGFACE,
  };

  it("should pass with valid input", () => {
    const parsed = SubmitQuestionSchema.parse(submitData);

    expect(parsed).toEqual(submitData);
  });

  it("should fail if content is empty", () => {
    const data = { ...submitData, question: { ...submitData.question, content: "" } };

    expect(() => SubmitQuestionSchema.parse(data)).toThrow(/cannot be empty/i);
  });

  it("should fail if content is too long", () => {
    const data = {
      ...submitData,
      question: { ...submitData.question, content: "a".repeat(501) },
    };

    expect(() => SubmitQuestionSchema.parse(data)).toThrow(/longer than 500/i);
  });

  it("should fail if userId is not a valid UUID", () => {
    const data = {
      ...submitData,
      question: { ...submitData.question, userId: "invalid-uuid" },
    };

    expect(() => SubmitQuestionSchema.parse(data)).toThrow(/invalid user id/i);
  });

  it("should fail if required fields are missing", () => {
    const data = {
      question: {},
    };

    expect(() => SubmitQuestionSchema.parse(data)).toThrow(/Required/i);
  });
});
