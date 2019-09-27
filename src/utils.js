function debounceWithThreshold (fn, debounceMs, thresholdMs, argumentReducer, argumentFinaliser, initialState) {
  let debounceId, thresholdId, externalResolve, promise, state

  function resetVariables () {
    promise = new Promise(resolve => { externalResolve = resolve})
    debounceId = null
    thresholdId = null
    state = initialState()
  }

  function executor () {
    clearTimeout(debounceId)
    clearTimeout(thresholdId)
    externalResolve(fn(argumentFinaliser(state)))
    resetVariables()
  }

  resetVariables()

  return function (item) {
      state = argumentReducer(state, item)
      if (!thresholdId) {
        thresholdId = setTimeout(executor, thresholdMs)
      }
      clearTimeout(debounceId)
      debounceId = setTimeout(executor, debounceMs)
      return promise
  }
}

function debounceUnique (fn, debounceMs, thresholdMs) {
  return debounceWithThreshold(
    fn,
    debounceMs,
    thresholdMs,
    (state, item) => (state[item] = true, state),
    state => Object.keys(state),
    () => ({})
  )
}


/* convenience function to wrap *?
/* web3 batching in a promise */
function batchPromiseBulkAdd (batch, requests, callback) {
  return new Promise((resolve, reject) => {
    var count = requests.length
    var rejected = false
    const results = []
    const promiseCallback = (err, res) => {
      if (rejected) return
      if (err) {
        rejected = true
        reject(err)
        return
      }
      results.push(res)
      callback(res)
      if (--count == 0) resolve(results)
    }
    requests.forEach(request => {
      batch.add(request(promiseCallback))
    })
  })
}

/* give a promise returning function, returns an object with an "add" */
/* method. All _unique_ added items will be passed to the promise */
/* returning function as a single array. Subsequent calls to that */
/* function will only be made after the promise is resolved */
function makeBatchQueue (promiseFn) {
  return {
    _h: {},
    _promise: Promise.resolve(),
    _promiseFn: promiseFn,
    /* 'add' returns the promise that will be resolved once the */
    /* added item is handled by the promiseFn, allowing for a */
    /* single outstanding network request at one time */
    add: function (x) {
      this._h[x] = true
      if (!this._promise._hasChain) {
        const lastPromise = this._promise
        this._promise = new Promise(resolve => {
          setTimeout(() => {
            lastPromise.then(() => {
              const items = this.drain()
              this._promise = this._promiseFn(items)
              resolve(this._promise)
            }, 200)
          })
        })
        this._promise._hasChain = true
      }
      return this._promise
    },
    drain: function () {
      const items = Object.keys(this._h)
      this._h = {}
      return items
    }
  }
}

/* given an array and a size, returns an */
/* array of arrays of specified size */
function partition (array, size) {
  const result = []
  while (array.length > 0) { result.push(array.splice(0, size)) }
  return result
}

module.exports = { makeBatchQueue, partition, batchPromiseBulkAdd, debounceUnique }
