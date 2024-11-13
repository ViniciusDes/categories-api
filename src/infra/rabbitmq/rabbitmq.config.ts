import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "";

export class ClientRabbitMq {
  connection: amqp.Connection | null;
  channel: amqp.Channel | null;

  async connect() {
    this.connection = await amqp.connect(RABBITMQ_URL);
  }

  async createQueue(queueName: string) {
    if (!this.channel) {
      await this.connect();
    }

    if (!this.channel) {
      return;
    }
    await this.channel.assertQueue(queueName, { durable: true });
  }

  async publishToQueue(queueName: string, message: any) {
    if (!this.channel) {
      await this.connect();
      await this.createChannel();
    }

    if (!this.channel) {
      return;
    }
    await this.channel?.assertQueue(queueName, { durable: true });
    this.channel.sendToQueue(queueName, Buffer.from(message), {
      persistent: true,
    });
  }

  async consumeFromQueue(queueName: string, callback: Function) {
    if (!this.channel) {
      await this.connect();
      await this.createChannel();
    }

    if (!this.channel) {
      return;
    }
    await this.channel.assertQueue("update-category-queue");
    this.channel.consume(
      queueName,
      (msg) => {
        if (msg !== null && this.channel) {
          try {
            callback(msg);
            this.channel.ack(msg);
          } catch (error) {
            this.channel.nack(msg, false, true);
          }
        }
      },
      {
        noAck: false,
      }
    );
  }

  async close() {
    if (!this.channel || !this.connection) {
      return;
    }
    await this.channel.close();
    await this.connection.close();
  }

  async createChannel() {
    if (!this.connection) {
      throw new Error("RabbitMQ connection is not established");
    }
    await this.connect();

    this.channel = await this.connection.createChannel();
    this.channel.assertQueue("update-category-queue", {
      durable: true,
    });
    this.setupChannelEvents();
  }

  private setupChannelEvents() {
    if (!this.channel) return;

    this.channel.on("close", async () => {
      await this.createChannel();
    });

    this.channel.on("error", async (error) => {
      await this.createChannel();
    });
  }
}

export default new ClientRabbitMq();
