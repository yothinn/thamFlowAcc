const CyberAccDatabase = require("../libs/cyberacc/cyberaccDatabase");
const Ocha = require("../libs/ocha/ocha");
const Page365 = require("../libs/page365/page365");


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
