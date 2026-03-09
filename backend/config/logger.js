const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.Http({
      host: 'logstash',
      port: 5000,
      path: '/'
    })
  ],
});

module.exports = logger;
