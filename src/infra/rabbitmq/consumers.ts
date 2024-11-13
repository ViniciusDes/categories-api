import { ConsumeMessage } from "amqplib";
import { QueuesNames } from "../../shared/enums/queues-name.enum";
import { RabbitmqNames } from "../../shared/enums/rabbitmq-name.enum";
import { MessagesProcessor } from "./messge-processor";
import { ClientRabbitMq } from "./rabbitmq.config";
import { container, inject, injectable } from "tsyringe";

@injectable()
export class RabbitmqConsumer {
  constructor(
    @inject(RabbitmqNames.CATEGORIES)
    private rabbitmqClient: ClientRabbitMq
  ) {}

  consumeAddCategoryQueue() {
    const messagesProcessor = container.resolve(MessagesProcessor);

    this.rabbitmqClient.consumeFromQueue(
      QueuesNames.ADD_CATEGORY,
      (msg: ConsumeMessage) => {
        try {
          messagesProcessor.processAddCategory(msg.content.toString());
        } catch (error) {
          this.rabbitmqClient.channel?.nack(msg, false, true);
        }
      }
    );
  }

  consumeUpdateCategoryQueue() {
    const messagesProcessor = container.resolve(MessagesProcessor);

    this.rabbitmqClient.consumeFromQueue(
      QueuesNames.UPDATE_CATEGORY,
      (msg: ConsumeMessage) => {
        try {
          messagesProcessor.processUpdateCategory(msg.content.toString());
        } catch (error) {
          this.rabbitmqClient.channel?.nack(msg, false, true);
        }
      }
    );
  }

  consumeDeleteCategoryQueue() {
    const messagesProcessor = container.resolve(MessagesProcessor);

    this.rabbitmqClient.consumeFromQueue(
      QueuesNames.DELETE_CATEGORY,
      (msg: ConsumeMessage) => {
        try {
          messagesProcessor.processDeleteCategory(msg.content.toString());
        } catch (error) {
          this.rabbitmqClient.channel?.nack(msg, false, true);
        }
      }
    );
  }
}
