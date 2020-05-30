import dotenv from "dotenv"
dotenv.config()

import amqp from "amqplib"
// RabbitMQ connection string
const messageQueueConnectionString = process.env.RABBITMQ_CONNECTION_STRING;

async function setup() {
  console.log("Setting up RabbitMQ Exchanges/Queues");
  // connect to RabbitMQ Instance
  let connection = await amqp.connect(messageQueueConnectionString);

  // create a channel
  let channel = await connection.createChannel();

  // create exchange
  await channel.assertExchange("processing", "direct", { durable: true });

  // create queues
  await channel.assertQueue("processing.requests", { durable: true, autoDelete: false });
  await channel.assertQueue("processing.results", { durable: true, autoDelete: false });

  // bind queues
  await channel.bindQueue("processing.requests","processing", "request");
  await channel.bindQueue("processing.results","processing", "result");

  console.log("Setup DONE");
  process.exit();
}

setup();