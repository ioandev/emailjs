'use strict'

import {
    mail as mailSchema
} from './schemas'

import service from './service'

var emailService = new service()

module.exports = async function (fastify, opts) {
    fastify.post('/', {
        schema: mailSchema
    }, addEmailToQueue)
}

async function addEmailToQueue(req, reply) {
    return await emailService.addEmail(req.body)
}