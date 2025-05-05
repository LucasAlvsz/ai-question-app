import { z } from "zod";

const SubmitQuestionSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Question cannot be empty" })
    .max(500, { message: "Question cannot be longer than 500 characters" }),
  userId: z.string().uuid({ message: "Invalid user ID" }),
});

type SubmitQuestion = z.infer<typeof SubmitQuestionSchema>;

export { SubmitQuestionSchema, SubmitQuestion };
