const PurchasesSeaFoodToFlowAcc = require("./libs/purchase/purchasesSeaFoodToFlowAcc");

const dotenv = require("dotenv").config();

const flowAccCredentail = {
    clientId: process.env.FA_CLIENT_ID,
    clientSecret: process.env.FA_CLIENT_SECRET,
    grantType: process.env.FA_GRANT_TYPE,
    scope: process.env.FA_SCOPE
};

(async() => {
    try {
        let s2fa = new PurchasesSeaFoodToFlowAcc(flowAccCredentail);

        // s2fa.init();

        s2fa.toPurchasesInline("./purchases_seafood/purchases_seafood.xlsx", "seafood", 2, 5);

    } catch (error) {
        console.log(error);
    }
})();