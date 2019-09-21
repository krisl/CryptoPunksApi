const { init } = require('./punkInfo.js')
const { makeGraphQLApp } = require('./graphql.js')

const punksForSale = {}
const app = makeGraphQLApp(punksForSale)

init(punksForSale, (provider) =>
  app.listen(
    4000,
    () => {
      console.log('Running a GraphQL API server at localhost:4000/graphql')
      process.on('uncaughtException', (e) => {
        console.error(e)
        console.log('Reinitialising...')
        provider.disconnect()
        init(punksForSale, (newProvider) => { provider = newProvider })
      })
    }
  )
)

