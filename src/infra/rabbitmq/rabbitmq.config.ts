import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "";

export class ClientRabbitMq {
  connection: amqp.Connection | null;
  channel: amqp.Channel | null;

  constructor() {
    this.connect();
  }

  async connect() {
    this.connection = await amqp.connect(RABBITMQ_URL);
    this.channel = await this.connection.createChannel();
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
    }

    if (!this.channel) {
      return;
    }
    this.channel.sendToQueue(queueName, Buffer.from(message), {
      persistent: true,
    });
  }

  async consumeFromQueue(queueName: string, callback: Function) {
    if (!this.channel) {
      await this.connect();
    }

    if (!this.channel) {
      return;
    }
    await this.channel.consume(queueName, (msg) => {
      if (msg !== null && this.channel) {
        try {
          callback(msg);
          this.channel.ack(msg);
        } catch (error) {
          this.channel?.nack(msg, false, true);
          this.connect();
        }
      }
    });
  }

  async close() {
    if (!this.channel || !this.connection) {
      return;
    }
    await this.channel.close();
    await this.connection.close();
  }
}

export default new ClientRabbitMq();
