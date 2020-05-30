'use strict'

const path = require('path')

function getSwaggerOptions() {
    return {
        routePrefix: '/swagger',
        exposeRoute: true,
        swagger: {
            info: {
                title: 'Email service swagger',
                description: 'Send e-mails',
                version: '0.0.1'
            },
            host: `${process.env.HOSTNAME}:${process.env.PORT}`,
            schemes: ['http'],
            consumes: ['application/json'],
            produces: ['application/json']
        }
    }
}

export default function (fastify) {
    fastify
        //swagger
        .register(require('fastify-swagger'), getSwaggerOptions())

        // APIs modules
        .register(require('./email'), {
            prefix: '/api/email'
        })
        // Serving static files
        .register(require('fastify-static'), {
            root: path.join(__dirname, 'frontend', 'build'),
            prefix: '/'
        })
    
    fastify.ready(err => {
        if (err) throw err
        fastify.swagger()
    })
}