import { z } from "zod";
import { AIProviderType } from "@/services/ai-services/ai-provider-type";

const AIProviderEnum = z.nativeEnum(AIProviderType);

const SubmitQuestionSchema = z.object({
  question: z.object({
    content: z
      .string()
      .min(1, { message: "Question cannot be empty" })
      .max(500, { message: "Question cannot be longer than 500 characters" }),
    userId: z.string().uuid({ message: "Invalid user ID" }),
  }),
  provider: AIProviderEnum.default(AIProviderType.HUGGINGFACE),
});

type SubmitQuestionData = z.infer<typeof SubmitQuestionSchema>;

export { SubmitQuestionSchema, SubmitQuestionData };
