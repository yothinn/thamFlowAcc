const dotenv = require("dotenv").config();
const FlowAccount = require("./libs/flowacc");

(async() => {

    let fa = new FlowAccount();

    await fa.authorize(
        process.env.FA_CLIENT_ID,
        process.env.FA_CLIENT_SECRET,
        process.env.FA_GRANT_TYPE,
        process.env.FA_SCOPE
    );

    let res = await fa.getAllProduct();
    
    console.log(res.length);
    console.log(res[1683]);
})();