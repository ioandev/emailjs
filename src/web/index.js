if (process.env.EMAIL_ENV == null) {
    throw "process.env.EMAIL_ENV could not be found"
}

import dotenv from 'dotenv'
import path from 'path'
dotenv.config({
    path: path.resolve(process.cwd(), process.env.EMAIL_ENV == 'prod' ? '.env' : ('.env.' + process.env.EMAIL_ENV))
})

import fastify from 'fastify'
import fastifyInitialiser from './fastifyInitialiser'

const hostname = process.env.HOSTNAME
const port = process.env.PORT
if (hostname == null || port == null) {
    throw "Could not find configuration details to set up the web server: hostname, port"
}
async function main() {
    let app = fastify()
    await fastifyInitialiser(app, [])
    app.listen(port, hostname, err => {
        if (err) {
            console.error("Could not start the web server.")
            throw err
        }
        console.log(`server listening on ${app.server.address().port}`);
    })
}

main()