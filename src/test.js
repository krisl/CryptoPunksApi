const test = require('tape')

test('punk info service', (t) => {
  const { getPunk } = require('./punkInfo.js')
  t.plan(2)

  t.deepEqual(
    getPunk(1),
    { gender: "Male",
      accessories: [ "Smile", "Mohawk" ]
    },
    'Punk fetched from CryptoPunks.json file'
  )

  t.deepEqual(
    getPunk(10000),
    {},
    'Missing punks return empty object'
  )
})

