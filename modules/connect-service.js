/**
 * manage connection for page365, ocha, cyberacc, accrevo
 */

const CyberAccDatabase = require("../libs/cyberacc/cyberaccDatabase");
const Ocha = require("../libs/ocha/ocha");
const Page365 = require("../libs/page365/page365");
const AccRevo = require("../libs/accrevo/accrevo");

module.exports.ochaConnect = async(ochaUser) => {
    try {
        var oConnect = new Ocha();
        
        await oConnect.connect(ochaUser.mobileNo, ochaUser.username, ochaUser.password);

        return oConnect;
    } catch(error) {
        throw error;
    }
}

module.exports.page365Connect = async(page365User) => {
    try {
        var pConnect = new Page365();

        await pConnect.connect(page365User.username, page365User.password);

        return pConnect;
    } catch(error) {
        throw error;
    }
}


module.exports.cyberAccDbConnect = async(cyberAccConfig) => {
    try {
        var cConnect = new CyberAccDatabase();

        await cConnect.connect(
            cyberAccConfig.username,
            cyberAccConfig.password,
            cyberAccConfig.server,
            cyberAccConfig.database,
            cyberAccConfig.instance);

        return cConnect;
    } catch(error) {
        throw error;
    }
}

module.exports.accRevoConnect = async(accRevoUser) => {
    try {
        var aConnect = new AccRevo();

        await aConnect.authorize(accRevoUser.username, accRevoUser.password, accRevoUser.apiKey);

        return aConnect;
    } catch(error) {
        throw error;
    }
}
