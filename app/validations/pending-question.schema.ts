import { z } from "zod";
import { SubmitQuestionSchema } from "./submit-question.schema";

const PendingQuestionSchema = SubmitQuestionSchema.extend({
  question: SubmitQuestionSchema.shape.question.extend({
    id: z.string().uuid({ message: "Invalid question ID" }),
    status: z.enum(["PENDING", "ANSWERED"]),
    timestamp: z.number().int().positive({ message: "Invalid timestamp" }),
  }),
});

type PendingQuestionData = z.infer<typeof PendingQuestionSchema>;

export { PendingQuestionSchema, PendingQuestionData };
