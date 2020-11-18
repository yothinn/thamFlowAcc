const { createLogger, format, transports, config } = require('winston');


const cyberaccLogger = createLogger({
    transports: [
        new transports.Console(),
        new transports.File({ filename: "cyberacc.log"})
    ]
});

module.exports = cyberaccLogger;