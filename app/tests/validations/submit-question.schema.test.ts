import { SubmitQuestionSchema } from "@/validations/submit-question.schema";

describe("SubmitQuestionSchema", () => {
  const submitData = {
    content: "fake question",
    userId: "a3f23e29-8dcf-4b51-8b6f-df147911b21e",
  };

  it("should pass with valid input", () => {
    const parsed = SubmitQuestionSchema.parse(submitData);

    expect(parsed).toEqual(submitData);
  });

  it("should fail if content is empty", () => {
    const data = { ...submitData, content: "" };

    expect(() => SubmitQuestionSchema.parse(data)).toThrow(/cannot be empty/i);
  });

  it("should fail if content is too long", () => {
    const data = {
      ...submitData,
      content: "a".repeat(501),
    };

    expect(() => SubmitQuestionSchema.parse(data)).toThrow(/longer than 500/i);
  });

  it("should fail if userId is not a valid UUID", () => {
    const data = {
      ...submitData,
      userId: "invalid-uuid",
    };

    expect(() => SubmitQuestionSchema.parse(data)).toThrow(/invalid user id/i);
  });

  it("should fail if required fields are missing", () => {
    const data = {};

    expect(() => SubmitQuestionSchema.parse(data)).toThrow(/required/i);
  });
});
