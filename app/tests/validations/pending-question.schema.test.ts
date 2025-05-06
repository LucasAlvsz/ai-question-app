import { PendingQuestionSchema } from "@/validations/pending-question.schema";

describe("PendingQuestionSchema", () => {
  const validData = {
    question: {
      id: "c3bfe9a6-3b39-4c4f-81f4-9c8cb68847f5",
      content: "What is Zod?",
      userId: "b2a7f4c2-1023-48be-89b9-3bb0b61f85a9",
      status: "PENDING",
      timestamp: Date.now(),
    },
    provider: "openai",
  };

  it("should pass with valid data", () => {
    expect(() => PendingQuestionSchema.parse(validData)).not.toThrow();
  });

  it("should fail if question.id is missing", () => {
    const { question, ...rest } = validData;
    const invalid = { ...rest, question: { ...question, id: undefined } };

    expect(() => PendingQuestionSchema.parse(invalid)).toThrow(/required/i);
  });

  it("should fail if timestamp is not a positive integer", () => {
    const invalid = {
      ...validData,
      question: {
        ...validData.question,
        timestamp: -123,
      },
    };

    expect(() => PendingQuestionSchema.parse(invalid)).toThrow(/invalid timestamp/i);
  });

  it("should fail if status is not allowed", () => {
    const invalid = {
      ...validData,
      question: {
        ...validData.question,
        status: "COMPLETED",
      },
    };

    expect(() => PendingQuestionSchema.parse(invalid)).toThrow(/invalid enum value/i);
  });
  it("should set default provider to 'huggingface' if not provided", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { provider, ...rest } = validData;
    const invalid = { ...rest, question: { ...rest.question, provider: undefined } };
    const parsed = PendingQuestionSchema.parse(invalid);
    expect(parsed.provider).toBe("huggingface");
  });

  it("should fail if provider is not allowed", () => {
    const invalid = {
      ...validData,
      provider: "invalid-provider",
    };

    expect(() => PendingQuestionSchema.parse(invalid)).toThrow(/invalid enum value/i);
  });
});
