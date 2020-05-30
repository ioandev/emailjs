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

class TweetService {
  constructor() {}

  async addTweet(requestData) {
    // save request id and increment
    let requestId = lastRequestId;
    lastRequestId++;

    // connect to Rabbit MQ and create a channel
    let connection = await amqp.connect(messageQueueConnectionString);
    let channel = await connection.createConfirmChannel();

    // publish the data to Rabbit MQ
    console.log("request data was: ");
    console.log(requestData);
    console.log("Published a request message, requestId:", requestId);
    await publishToChannel(channel, {
      routingKey: "request",
      exchangeName: "processing",
      data: {
        requestId,
        requestData,
      },
    });

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

async function listenForResults() {
  // connect to Rabbit MQ
  let connection = await amqp.connect(messageQueueConnectionString);

  // create a channel and prefetch 1 message at a time
  let channel = await connection.createChannel();
  await channel.prefetch(1);

  // start consuming messages
  await consume({
    connection,
    channel,
  });
}

// consume messages from RabbitMQ
function consume({ connection, channel, resultsChannel }) {
  return new Promise((resolve, reject) => {
    channel.consume("processing.results", async function (msg) {
      // parse message
      let msgBody = msg.content.toString();
      let data = JSON.parse(msgBody);
      let requestId = data.requestId;
      let processingResults = data.processingResults;
      console.log(
        "Received a result message, requestId:",
        requestId,
        "processingResults:",
        processingResults
      );

      // acknowledge message as received
      await channel.ack(msg);
    });

    // handle connection closed
    connection.on("close", (err) => {
      return reject(err);
    });

    // handle errors
    connection.on("error", (err) => {
      return reject(err);
    });
  });
}

module.exports = TweetService;
