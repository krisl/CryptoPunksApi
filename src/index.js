const { init } = require('./punkInfo.js')
const { makeGraphQLApp } = require('./graphql.js')

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
eventEmitter.then(() =>
  app.listen(
    4000,
    () => {
      console.log('Running a GraphQL API server at localhost:4000/graphql')
      installErrorHandler(eventEmitter)
    }
  )
)

