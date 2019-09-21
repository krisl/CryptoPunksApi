# CryptoPunksAPI
* https://www.larvalabs.com/cryptopunks
* https://etherscan.io/address/0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb

## Install
```
  npm install
  npm test
  npm start
```

### expected start output
```
WebSocket connected
Fetching previous offer events...
Received previous offer events, count: 8190
Fetching ForSale status, punk count: 3186
Sent batch of requests, size:  2500
Sent batch of requests, size:  686
Number of punks for sale 207
Number of punks for sale 1051
Initialisation complete
Running a GraphQL API server at localhost:4000/graphql
```

## Interface
* GraphQL endpoint at `http://localhost:4000/graphql`
* Try running the queries:
```GraphQL
query {
  getPunk(punkId: 1) {
    id
    isForSale
    price
    gender
    accessories
  }
  getPunksForSale {
    id
    isForSale
  }
}
```
