import fastify from 'fastify'
import fastifyInitialiser from './fastifyInitialiser'

async function main() {
    let app = fastify()
    await fastifyInitialiser(app, [])
    app.ready(err => {
        if (err) throw err
        app.swagger()
    })
    app.listen(3000, '127.0.0.1', err => {
        if (err) throw err
        console.log(`server listening on ${app.server.address().port}`);
    })
}

main()