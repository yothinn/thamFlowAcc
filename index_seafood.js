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
        let s2fa = new PurchasesSeaFoodToFlowAcc("แปรรูป (Food Processing)", flowAccCredentail);

        await s2fa.init();

        // let purchasesList = await s2fa.toPurchases("./purchases_seafood/purchases_seafood.xlsx", "seafood", 2, 5);
        let res = await s2fa.createPurchases("./purchases_seafood/purchases_seafood.xlsx", "purchases", 2, 24);

        // console.log(res);

    } catch (error) {
        console.log(error);
    }
})();