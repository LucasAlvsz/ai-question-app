import { SnsEventMap } from "@/events/sns-events-map";
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
      },
      timestamp: 1746403957565,
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
});
