const { createLogger, format, transports, config } = require('winston');
const fs = require('fs');
const path = require('path');

const logDir = 'log';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const filename = path.join(logDir, 'cyberacc.log');

const cyberaccLog = createLogger({
    format: format.combine(
        format.timestamp(),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: filename})
    ]
});

module.exports = cyberaccLog;