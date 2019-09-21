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
    add: function(x) {       
      this._h[x] = true              
      if (!this._promise._hasChain) {                   
        this._promise = this._promise.then(() => {
          const items = this.drain()                   
          return this._promise = this._promiseFn(items)
        })                            
        this._promise._hasChain = true
      }                   
      return this._promise
    },                  
    drain: function() {                       
      const items = Object.keys(this._h)
      this._h = {}
      return items
    }                                                         
  }
}

module.exports = { makeBatchQueue }
