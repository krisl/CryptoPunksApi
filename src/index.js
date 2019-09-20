const express = require('express')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')
const { getPunk, init } = require('./punkInfo.js')

const punksForSale = {}

/* Construct a schema, using GraphQL schema language */
const schema = buildSchema(`
  type Punk {
    id: Int
    isForSale: Boolean
    price: String
    gender: String
    accessories: [String]
  }
  type Query {
    getPunk(punkId: Int): Punk
    getPunksForSale: [Punk]
  }
`)

/* The root provides a resolver function for each API endpoint */
const root = {
  getPunk: params => getPunk(params.punkId, punksForSale),
  getPunksForSale: () => Object.entries(punksForSale)
    .filter(([_, punk]) => punk.isForSale)
    .map(([id, _]) => getPunk(id, punksForSale)),
}

const app = express()
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}))

init(punksForSale)

app.listen(
  4000,
  () => console.log('Running a GraphQL API server at localhost:4000/graphql')
)
