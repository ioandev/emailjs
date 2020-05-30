'use strict'

const email = {
    body: {
        type: 'object',
        required: ['from', 'to', 'subject', 'text'],
        properties: {
            from: {
                type: 'string',
                minLength: 1,
                maxLength: 144
            },
            to: {
                type: 'string',
                minLength: 1,
            },
            subject: {
                type: 'string',
                minLength: 1,
                maxLength: 144
            },
            text: {
                type: 'string',
            },
            html: {
                type: 'string',
            },
        },
        additionalProperties: false
    }
}
export {email}