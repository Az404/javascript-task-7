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

        const queue = jobs.slice();
        const results = new Map();
        let runningCount = 0;

        function start(job) {
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
                        onComplete();
                    }
                });
        }

        function startNext() {
            const job = queue.shift();
            if (!job) {
                return;
            }
            start(job);
        }

        function onComplete() {
            resolve(jobs.map(job => results[job]));
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
