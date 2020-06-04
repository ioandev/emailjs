if (process.env.EMAIL_ENV == null) {
  throw "process.env.EMAIL_ENV could not be found"
}

import dotenv from 'dotenv'
import path from 'path'
dotenv.config({
  path: path.resolve(process.cwd(), process.env.EMAIL_ENV == 'prod' ? '.env' : ('.env.' + process.env.EMAIL_ENV))
})

import amqp from "amqplib"
import sleep from 'await-sleep'
import {
  sendEmail
} from './emailSender'

if (process.env.EMAIL_ENV == null) {
  throw "process.env.EMAIL_ENV could not be found"
}

// RabbitMQ connection string
const messageQueueConnectionString = process.env.RABBITMQ_CONNECTION_STRING;
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
  console.log("Consuming messages..")
  // start consuming messages
  await consume({
    connection,
    channel,
    resultsChannel
  })
  console.log("Consuming messages finished.")
}

// consume messages from RabbitMQ
function consume({
  connection,
  channel,
  resultsChannel
}) {
  return new Promise((resolve, reject) => {
    let prefix = `newsletter.${process.env.EMAIL_ENV}.`
    channel.consume(prefix + "processing.requests", async function (msg) {
      consumeMessage(msg, channel, resultsChannel).then(resolve).catch(reject)
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

async function consumeMessage(msg, channel, resultsChannel) {
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

  let prefix = `newsletter.${process.env.EMAIL_ENV}.`
  // publish results to channel
  await publishToChannel(resultsChannel, {
    exchangeName: prefix + "processing",
    routingKey: prefix + "result",
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
