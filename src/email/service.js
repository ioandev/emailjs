"use strict";

import dotenv from "dotenv"
dotenv.config()
import amqp from "amqplib"
// RabbitMQ connection string
const messageQueueConnectionString = process.env.CLOUDAMQP_URL;
if (messageQueueConnectionString == null) {
  throw "No rabbitmq url was found";
}

// simulate request ids
let lastRequestId = 1;

class EmailService {
  constructor() {}

  async addEmail(requestData) {
    // save request id and increment
    let requestId = lastRequestId;
    lastRequestId++;

    // connect to Rabbit MQ and create a channel
    let connection = await amqp.connect(messageQueueConnectionString);
    let channel = await connection.createConfirmChannel();

    // publish the data to Rabbit MQ
    await publishToChannel(channel, {
      routingKey: "request",
      exchangeName: "processing",
      data: {
        requestId,
        requestData,
      },
    });
    console.log("Published a request message, requestId:", requestId);

    // send the request id in the response
    return {
      requestId,
    }
  }
}

// utility function to publish messages to a channel
function publishToChannel(channel, { routingKey, exchangeName, data }) {
  return new Promise((resolve, reject) => {
    channel.publish(
      exchangeName,
      routingKey,
      Buffer.from(JSON.stringify(data), "utf-8"),
      {
        persistent: true,
      },
      function (err, ok) {
        if (err) {
          return reject(err);
        }

        resolve();
      }
    );
  });
}

export default EmailService;
