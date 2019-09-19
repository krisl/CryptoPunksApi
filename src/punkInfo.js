const cryptoPunksJson = require('./resources/CryptoPunks.json')
const getPunk = (punkId) => cryptoPunksJson[punkId] || {}

module.exports = { getPunk }
