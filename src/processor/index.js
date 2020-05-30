import {
  sendEmail
} from './emailSender'

import dotenv from "dotenv"
dotenv.config()
import amqp from "amqplib"
import sleep from 'await-sleep'

// RabbitMQ connection string
const messageQueueConnectionString = process.env.CLOUDAMQP_URL;
if (messageQueueConnectionString == null) {
  throw "No rabbitmq url was found"
}

async function listenForMessages() {
  // connect to Rabbit MQ
  let connection = await amqp.connect(messageQueueConnectionString);

  // create a channel and prefetch 1 message at a time
  let channel = await connection.createChannel();
  await channel.prefetch(1);

  // create a second channel to send back the results
  let resultsChannel = await connection.createConfirmChannel();

  // start consuming messages
  await consume({
    connection,
    channel,
    resultsChannel
  })
}

// consume messages from RabbitMQ
function consume({
  connection,
  channel,
  resultsChannel
}) {
  return new Promise((resolve, reject) => {
    channel.consume("processing.requests", async function (msg) {
      something(msg, channel, resultsChannel).then(resolve).catch(reject)
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

async function something(msg, channel, resultsChannel) { // parse message
  let msgBody = msg.content.toString();
  let data = JSON.parse(msgBody);
  let requestId = data.requestId;
  let requestData = data.requestData;
  console.log("Received a request message, requestId:", requestId);
  
  // process data
  let processingResults = {}
  try {
    console.log("Processing: ", requestData)
    processingResults = await processMessage(requestData)
  } catch (err) {
    console.error("Failed processing: ", requestData, err)
    await sleep(5 * 1000); // sleep between each error // TODO: could do back off here.
    await channel.nack(msg, false, false); // TODO: requeue. need dead lettering
    //await channel.ack(msg);
    return
  }

  // publish results to channel
  await publishToChannel(resultsChannel, {
    exchangeName: "processing",
    routingKey: "result",
    data: {
      requestId,
      processingResults
    }
  });
  console.log("Published results for requestId:", requestId);

  // acknowledge message as processed successfully
  await channel.ack(msg);

  await sleep(5 * 1000); // sleep between each mail being sent
}

async function processMessage(requestData) {
  return await sendEmail(requestData)
}

// utility function to publish messages to a channel
async function publishToChannel(channel, {
  routingKey,
  exchangeName,
  data
}) {
  return new Promise((resolve, reject) => {
    channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(data), 'utf-8'), {
      persistent: true
    }, function (err) {
      if (err) {
        return reject(err);
      }

      resolve();
    })
  });
}


listenForMessages().catch(err => {
  console.error("A fatal exception has occured, exiting")
  console.error(err)
  process.exit(1);
});
console.log("Listening for emails to process...")
