# CryptoPunksAPI
* https://www.larvalabs.com/cryptopunks
* https://etherscan.io/address/0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb

## Install
```
  npm install
  npm test
  npm start
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
