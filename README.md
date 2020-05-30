# emailjs

Simple service for sending e-mails with a POST call, using fastify and rabbitmq

Example request:

> URL: `http://localhost:3000/api/email/`
> 
> CONTENT-TYPE: application/json
> 
> METHOD: POST
> 
> BODY:
> 
>     {
>         "from": "ioan@iamioan.com",
>         "to": "contact@google.com",
>         "subject": "Testing my own email address service",
>         "text": "Hello world?",
>         "html": "<b>Hello world?</b>"
>     }


## Set up:
1. Copy `.env.spec` to `.env` and set your environment settings.
2. Copy `.env.accounts.js.spec` to `.env.accounts.js.spec` and set your email provider settings.
3. Run once `npm run setup`

## To run:
1. Run `npm run web`
2. Run `npm run processor`
3. Visit http://localhost:3000/swagger/ to send an e-mail

## Credits

Made with cloudamqp: https://manifold.co/services/cloudamqp . To view rabbitmq management UI, access: https://squid.rmq.cloudamqp.com/#/

## Todos:
- [x] MVP
- [ ] back off algorithm (if marked as spam)
- [ ] requeue failed email sends
- [ ] add deadletter queues
- [ ] add sentry