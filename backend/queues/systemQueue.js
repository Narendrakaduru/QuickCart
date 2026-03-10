const { Queue } = require('bullmq');
const connection = require('../config/bullmq');

const systemQueue = new Queue('system-tasks', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

module.exports = systemQueue;
