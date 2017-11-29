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
        }

        const results = [];
        let runningCount = 0;
        let lastStartedIndex = -1;

        function start(index) {
            const job = jobs[index];
            runningCount++;

            Promise.race([
                job()
                    .catch(err => err),
                delay(timeout)
                    .then(() => new Error('Promise timeout'))
            ])
                .then(result => {
                    results[job] = result;
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

function delay(timeout) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}
