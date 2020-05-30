'use strict'

const path = require('path')
const fp = require('fastify-plugin')

const EmailService = require('./email/service')

const swaggerOption = {
    routePrefix: '/swagger',
    exposeRoute: true,
    swagger: {
        info: {
            title: 'Test swagger',
            description: 'testing the fastify swagger api',
            version: '0.1.0'
        },
        host: 'localhost:3000',
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json']
    }
}

const schema = {
    type: 'object',
    required: ['MONGODB_URL', 'REDIS_URL', 'JWT_SECRET'],
    properties: {
        MONGODB_URL: {
            type: 'string'
        },
        REDIS_URL: {
            type: 'string'
        },
        JWT_SECRET: {
            type: 'string'
        }
    },
    additionalProperties: false
}

async function decorateFastifyInstance(fastify) {
    const emailService = new EmailService()
    fastify.decorate('emailService', emailService)
}

module.exports = async function (fastify, opts) {
    fastify
        .register(require('fastify-swagger'), swaggerOption)
        // fastify-env checks and coerces the environment variables and save the result in `fastify.config`
        // See https://github.com/fastify/fastify-env
        //.register(require('fastify-env'), {
        //    schema,
        //    data: [opts]
        //})
        // APIs modules
        .register(require('./email'), {
            prefix: '/api/email'
        })
        // Serving static files
        .register(require('fastify-static'), {
            root: path.join(__dirname, 'frontend', 'build'),
            prefix: '/'
        })
}