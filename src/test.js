const test = require('tape')

test('Punk info service', (t) => {
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

test('Queue - unique items', t => {
  const { makeBatchQueue } = require('./utils.js')
  t.plan(1)
  const queue = makeBatchQueue((item) => {
    t.deepEqual(item, ['500', '501'], 'Processes only unique items')
    return Promise.resolve()
  })
  queue.add(500)
  queue.add(500)
  queue.add(501)
})

test('Queue - returns promise', t => {
  const { makeBatchQueue } = require('./utils.js')
  t.plan(2)
  const queue = makeBatchQueue((item) => Promise.resolve(item))
  const promise1 = queue.add(507)
  const promise2 = queue.add(508)
  t.equal(promise1, promise2, 'Items added in same loop return same promise')
  promise1.then((items) => {
    t.deepEqual(items, ['507', '508'], 'Returned promise is resolved with added items')
  })
})

test('Queue - batching', t => {
  const { makeBatchQueue } = require('./utils.js')
  t.plan(3)
  const queue = makeBatchQueue((item) => Promise.resolve(item))
  const promise1 = queue.add(507)

  promise1.then((item) => {
    t.deepEqual(item, ['507'], 'First promise resolved with first added items')
  })

  setTimeout(() => {
    const promise2 = queue.add(508)
    promise2.then((item) => {
      t.deepEqual(item, ['508'], 'Second promise resolved with second added items')
      t.notEqual(promise1, promise2, 'First and second promises are independent')
    })
  })
})

test('Partition', t => {
  const { partition } = require('./utils.js')
  t.plan(3)
  t.deepEqual(partition([], 10), [], 'Partitions empty array')
  t.deepEqual(partition([1,2], 1), [[1],[2]], 'Partitions evenly')
  t.deepEqual(partition([1,2,3], 2), [[1,2],[3]], 'Partitions overflow')
})
