'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 * @returns {Promise}
 */
function runParallel(jobs, parallelNum, timeout = 1000) {
    return new Promise((resolve) => {
        if (jobs.length === 0) {
            resolve([]);

            return;
        }

        const results = [];
        let runningCount = 0;
        let lastStartedIndex = -1;

        function start(index) {
            runningCount++;

            Promise.race([
                jobs[index]()
                    .catch(err => err),
                delay(timeout, new Error('Promise timeout'))
            ])
                .then(result => {
                    results[index] = result;
                    runningCount--;
                    startNext();
                    if (runningCount === 0) {
                        resolve(results);
                    }
                });
        }

        function startNext() {
            lastStartedIndex++;
            if (lastStartedIndex >= jobs.length) {
                return;
            }
            start(lastStartedIndex);
        }

        for (let i = 0; i < parallelNum; i++) {
            startNext();
        }
    });
}

function delay(timeout, result) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout, result);
    });
}
