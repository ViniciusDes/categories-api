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
        messagesProcessor.processAddCategory(msg.content.toString());
      }
    );
  }

  consumeUpdateCategoryQueue() {
    const messagesProcessor = container.resolve(MessagesProcessor);

    this.rabbitmqClient.consumeFromQueue(
      QueuesNames.UPDATE_CATEGORY,
      (msg: ConsumeMessage) => {
        messagesProcessor.processUpdateCategory(msg.content.toString());
      }
    );
  }

  consumeDeleteCategoryQueue() {
    const messagesProcessor = container.resolve(MessagesProcessor);

    this.rabbitmqClient.consumeFromQueue(
      QueuesNames.DELETE_CATEGORY,
      (msg: ConsumeMessage) => {
        messagesProcessor.processDeleteCategory(msg.content.toString());
      }
    );
  }
}
