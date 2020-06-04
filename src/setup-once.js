if (process.env.EMAIL_ENV == null) {
  throw "process.env.EMAIL_ENV could not be found"
}

import dotenv from 'dotenv'
import path from 'path'
dotenv.config({
    path: path.resolve(process.cwd(), process.env.EMAIL_ENV == 'prod' ? '.env' : ('.env.' + process.env.EMAIL_ENV))
})

import amqp from "amqplib"
// RabbitMQ connection string
const messageQueueConnectionString = process.env.RABBITMQ_CONNECTION_STRING;

if (process.env.EMAIL_ENV == null) {
  throw "process.env.EMAIL_ENV could not be found"
}

async function setup() {
  console.log("Setting up RabbitMQ Exchanges/Queues");
  // connect to RabbitMQ Instance
  let connection = await amqp.connect(messageQueueConnectionString);

  // create a channel
  let channel = await connection.createChannel();

  let prefix = `newsletter.${process.env.EMAIL_ENV}.`

  // create exchange
  await channel.assertExchange(prefix+"processing", "direct", { durable: true });

  // create queues
  await channel.assertQueue(prefix+"processing.requests", { durable: true, autoDelete: false });
  await channel.assertQueue(prefix+"processing.results", { durable: true, autoDelete: false });

  // bind queues
  await channel.bindQueue(prefix+"processing.requests",prefix+"processing",prefix+"request");
  await channel.bindQueue(prefix+"processing.results",prefix+"processing",prefix+"result");

  console.log("Setup DONE");
  process.exit();
}

setup();