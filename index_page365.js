const dotenv = require("dotenv").config();
const FlowAccount = require("./libs/flowacc");

(async() => {

    let flowAcc = new FlowAccount();

    try {
        await flowAcc.authorize(
            process.env.FA_CLIENT_ID,
            process.env.FA_CLIENT_SECRET,
            process.env.FA_GRANT_TYPE,
            process.env.FA_SCOPE,
        );

        console.log(flowAcc._token);
        console.log(flowAcc._tokenExpire)
    } 
    catch(error) {
        console.log(error);
    }

})();