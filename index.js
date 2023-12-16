class Memoize {
  constructor(func, cachesize) {
    this.func = func;
    this.cachesize = cachesize;
    this.cache = new Array(this.cachesize);

    this.getFunction = this.getFunction.bind(this);
    this.getValueFromCache = this.getValueFromCache.bind(this);
    this._getIndexFromCache = this._getIndexFromCache.bind(this);
  }

  getFunction() {
    function wrapper(...args) {
      const result = this.func(...args);
      let currentInsertIndex = 0,
        minCount = 50000;

      for (let i = 0; i < this.cachesize; i++) {
        const entry = this.cache[i];

        if (!entry) {
          currentInsertIndex = i;
          break;
        }

        const { cacheHitCount } = entry;

        if (minCount > cacheHitCount) {
          minCount = cacheHitCount;
          currentInsertIndex = i;
        }
      }

      // store the result
      this.cache[currentInsertIndex] = {
        args,
        result,
        cacheHitCount: 0,
      };
      currentInsertIndex = (currentInsertIndex + 1) % this.cachesize;

      // return the result
      return result;
    }
    return wrapper.bind(this);
  }

  isEntryPresent(...currentArgs) {
    console.log(
      "Searching for",
      ...currentArgs,
      "in",
      this.cache.map((entry) => entry?.args)
    );
    const isPresent =
      this._getIndexFromCache(...currentArgs) > -1 ? true : false;

    return isPresent;
  }

  _getIndexFromCache(...currentArgs) {
    const cacheIndex = this.cache.findIndex((entry) => {
      if (!(entry && entry.args)) {
        return false;
      }
      const { args: entryArgs } = entry;

      // check if entryArgs and currentArgs are the same
      return entryArgs.every((entryArg, index) => {
        return entryArg === currentArgs[index];
      });
    });

    return cacheIndex;
  }

  getValueFromCache(...args) {
    const index = this._getIndexFromCache(...args);

    if (index < 0) {
      return;
    }

    const entry = this.cache[index];
    const { result } = entry;

    entry.cacheHitCount += 1;

    return entry;
  }
}

function main() {
  function logic(n1, n2, n3) {
    return n1 * n2 * n3;
  }

  const mem = new Memoize(logic, 2);
  const mem_func = mem.getFunction();
  let args = [
    [1, 1, 1],
    [2, 3, 4],
    [1, 1, 1],
    [5, 4, 3],
    [2, 3, 4],
    [1, 1, 1],
    [1, 1, 1],
    [5, 4, 3],
    [5, 4, 3],
    [5, 4, 3],
    [5, 4, 3],
    [2, 3, 4],
    [2, 3, 4],
  ];

  args.forEach((currentArgs) => {
    mem.isEntryPresent(...currentArgs)
      ? console.log(
          "Cache hit for",
          ...currentArgs,
          " and result is",
          mem.getValueFromCache(...currentArgs)
        )
      : console.log(
          "Cache miss for",
          ...currentArgs,
          " and result is ",
          mem_func(...currentArgs)
        );
  });
}

main();
