const { init } = require('./punkInfo.js')
const { makeGraphQLApp } = require('./graphql.js')

const PORT = process.env.PORT || 4000
const punksForSale = {}
const app = makeGraphQLApp(punksForSale)

function installErrorHandler (ee) {
  ee.on('error', (e) => {
    ee.removeAllListeners()
    ee.on('error', (e) => {
      console.log('Encountered error on defunct event emitter, ignoring', e)
    })
    console.error('Encountered error', e)
    console.log('Reinitialising...')
    installErrorHandler(ee.reinit())
  })
}

const eventEmitter = init(punksForSale)

eventEmitter.on('error', e => {
  console.error('Exception encountered while starting, aborting', e)
  process.exit(1)
})

eventEmitter.then(() =>
  app.listen(
    PORT,
    () => {
      console.log(`Running a GraphQL API server at localhost:${PORT}/graphql`)
      eventEmitter.removeAllListeners()
      installErrorHandler(eventEmitter)
    }
  )
)
