import { SnsEventMap } from "@/events/sns-events-map";
import { AIProviderType } from "@/services/ai-services/ai-provider-type";
import { SnsService } from "@/services/sns.service";
import { snsClient } from "@/shared/aws/clients";

jest.mock("@/shared/aws/clients", () => ({
  snsClient: {
    send: jest.fn(),
  },
}));

describe("SnsService", () => {
  const service = new SnsService();

  it("should call snsClient.send with correct topicArn and payload", async () => {
    const topicArn = "sns-fake-topic-arn";
    const payload: SnsEventMap["QuestionCreated"] = {
      question: {
        id: "q-1",
        content: "Pergunta teste",
        timestamp: 1746403957565,
        status: "PENDING",
        userId: "user-id-123",
      },
      provider: AIProviderType.HUGGINGFACE,
    };

    await service.publish(topicArn, payload);

    expect(snsClient.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          TopicArn: topicArn,
          Message: JSON.stringify(payload),
        },
      }),
    );
  });

  it("should throw an error if snsClient.send fails", async () => {
    const topicArn = "sns-fake-topic-arn";
    const payload: SnsEventMap["QuestionCreated"] = {
      question: {
        id: "q-1",
        content: "Pergunta teste",
        timestamp: 1746403957565,
        status: "PENDING",
        userId: "user-id-123",
      },
      provider: AIProviderType.HUGGINGFACE,
    };

    (snsClient.send as jest.Mock).mockRejectedValue(new Error("SNS error"));

    await expect(service.publish(topicArn, payload)).rejects.toThrow("SNS error");
  });
});
