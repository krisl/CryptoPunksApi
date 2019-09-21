const Web3 = require('web3')
const { makeBatchQueue, partition, batchPromiseBulkAdd } = require('./utils.js')
const cryptoPunksJson = require('./resources/CryptoPunks.json')
const contractAbi = require('./resources/Contract.abi.json')
const NETWORK_WSS = 'wss://mainnet.infura.io/ws/v3/498494c790964af8be6eafe6e2cdffec'
const NETWORK_HTTPS = 'https://mainnet.infura.io/v3/498494c790964af8be6eafe6e2cdffec'
const CONTRACT_ID = "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb"


const getPunk = (punkId) => cryptoPunksJson[punkId] || {}

/*
 * rather than query the network for each client request for punk information
 * or by trying to maintain the same state as the contracts authoritive mapping
 * 'punksOfferedForSale', we will listen to all events capable of invalidating
 * that state and requery the network for the state of the affected punk. This
 * frees us from having to replicate the exact logic of the contract and allows
 * us to offer a streaming api to the client through GraphQL subscriptions eg
*/
function init (punksForSale) {
  /* we use HTTPS for batch request as under NodeJS these are */
  /* much faster than WS and allow for greater batch sizes. */
  /* In the browser however, no partitioning is required */
  const web3Https = new Web3(NETWORK_HTTPS)
  const HTTPS_BATCH_SIZE = 1600

  /* again, under NodeJS we need to bump up the frame size */
  /* to recieve the large initial payload of the prior events */
  const web3 = new Web3(new Web3.providers.WebsocketProvider(NETWORK_WSS, {clientConfig: {
    maxReceivedFrameSize: 5 * 1024 * 1024,
    maxReceivedMessageSize: 10 * 1024 * 1024
  }}))

  web3.currentProvider.on('connect', () => {
    console.log('WebSocket connected')

    const contract = new web3.eth.Contract(contractAbi, CONTRACT_ID)
    const updateForSaleInfo = (res) => {
      /* punkIndex is 0 on punks that have never been offered */
      /* for sale, so only update if seller is non zero */
      if (Number.parseInt(res.seller) > 0)
        punksForSale[res.punkIndex] = res
    }

    /* take an array of punkIndexes, return a promise that will be */
    /* resolved when the ForSale status of each punk as been obtained */
    const offeredForSale = (punkIndexes) => {
      console.log('Fetching ForSale status, punk count:', punkIndexes.length)
      return Promise.all(partition(punkIndexes, HTTPS_BATCH_SIZE).map((subset) => {
        const batch = new web3Https.BatchRequest()
        const promise = batchPromiseBulkAdd(
          batch,
          subset.map(i => contract.methods.punksOfferedForSale(i).call.request),
          updateForSaleInfo
        )
        batch.execute()
        console.log('Sent batch of requests, size: ', batch.requests.length)
        return promise.then(
          () => console.log('Number of punks for sale', Object.values(punksForSale).filter(punk => punk && punk.isForSale).length)
        )
      }))
    }

    const forSaleInfoFetchQueue = makeBatchQueue(offeredForSale)

    /* Listen for the only three events capable of invalidating */
    /* the Forsale state */
    contract.events.allEvents(
      {topics:[[
        web3.utils.keccak256('PunkBought(uint256,uint256,address,address)'),
        web3.utils.keccak256('PunkOffered(uint256,uint256,address)'),
        web3.utils.keccak256('PunkNoLongerForSale(uint256)')
      ]]},
      (err, evt) => {
        /* if we throw an execption at this point all bets are off */
        /* and the init proceedure should be started again*/
        if (err) throw err
        return forSaleInfoFetchQueue.add(evt.returnValues.punkIndex)
      }
    )
  })
}

module.exports = { getPunk, init }
