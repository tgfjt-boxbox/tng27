const log = require('pino')({ level: 'info' })
const fastify = require('fastify')({ logger: log })
const helmet = require('fastify-helmet')
const fetch = require('node-fetch')
const hbs = require('handlebars')
const gql = require('graphql-tag')
const ApolloClient = require('apollo-client').default
const createNetworkInterface = require('apollo-client').createNetworkInterface

global.fetch = fetch

const client = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: 'https://api.graphcms.com/simple/v1/tng27',
    opts: {
      credentials: 'same-origin',
      headers: {
        Authorization: `Bearer ${process.env.GRAPHCMS_TOKEN}`
      }
    }
  })
})

const appName = 'tng27'

fastify.register(helmet)
fastify.register(require('point-of-view'), {
  engine: { handlebars: hbs },
  templates: './app/views'
})

fastify.get('/', (req, reply) => {
  client.query({
    query: gql`
      query Speakers {
        allSpeakers(orderBy: title_ASC) {
          id
          title
          name
        }
      }
    `
  })
    .then(res => {
      reply.view('/index.hbs', {
        title: `${appName}`,
        speakers: res.data.allSpeakers
      })
    })
    .catch(error => console.error(error))
})

function start() {
  fastify.listen(process.env.PORT || 3456, err => {
    if (err) throw err
    console.log(`server listening on ${fastify.server.address().port}`)
  })
}

if (require.main === module) {
  start()
}

module.exports = { start, fastify }
