const { createLogger, format, transports, config } = require('winston');
const fs = require('fs');
const path = require('path');

const logDir = 'log';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const filename = path.join(logDir, 'accrevoRunningCode.log');

const accRevoRunningCodeLog = createLogger({
    format: format.combine(
        format.timestamp(),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
        new transports.File({ filename: filename})
    ]
});


module.exports = accRevoRunningCodeLog;