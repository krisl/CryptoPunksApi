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

/* given an array and a size, returns an */
/* array of arrays of specified size */
function partition (array, size) {
  const result = []
  while (array.length > 0) { result.push(array.splice(0, size)) }
  return result
}

module.exports = { partition, batchPromiseBulkAdd, debounceUnique }
