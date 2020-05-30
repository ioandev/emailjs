'use strict'

const {
    tweet: tweetSchema,
} = require('./schemas')

import service from './service'

var emailService = new service()


module.exports = async function (fastify, opts) {
    // All APIs are under authentication here!
    fastify.post('/', {
        schema: tweetSchema
    }, addTwitterHandler)
}

async function addTwitterHandler(req, reply) {
    return await emailService.addTweet(req.body)
}