const db = require("./databaseConnection").db;

/**
 * wrapper function to run a query and return the result
 * @param {string} func
 * @param {sqlQueryString} statement
 * @param {[*]} params
 * @returns
 */
async function runQuery(func, statement, params) {
    try {
      return await runQueryPromise(func, statement, params);
    } catch (error) {
      log(error);
    }
  }
  
  /**
   * generic function to run a query and return the promise
   * @param {string} func
   * @param {sqlQueryString} statement
   * @param {{*}} params
   * @returns Promise
   */
async function runQueryPromise(func, statement, params) {
    return new Promise((resolve, reject) => {
      if (!["run", "get", "all"].includes(func)) {
        const error = new Error("Invalid SQLite3 function.");
        log(error);
        reject(error);
        return;
      }
      db[func](statement, params, function (err, result) {
        if (err) {
          log(err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }

module.exports = {
    runQuery,
};