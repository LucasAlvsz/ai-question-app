import { PublishCommand } from "@aws-sdk/client-sns";

import { SnsEventMap } from "@/events/sns-events-map";
import { snsClient } from "@/shared/aws/clients";

export class SnsService {
  async publish<K extends keyof SnsEventMap>(
    topicArn: string,
    payload: SnsEventMap[K],
  ): Promise<void> {
    await snsClient.send(
      new PublishCommand({
        TopicArn: topicArn,
        Message: JSON.stringify(payload),
      }),
    );
  }
}
