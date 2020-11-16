const utils = require("../utils");

exports.PAGE365_ORDER_STAGE = {
    DRAFT: "draft",
    UNPAID: "unpaid",
    PAID: "paid",
    SHIPPED: "shipped",
    EXPIRED: "expired",
    VOIDED: "voided"
};

exports.PAGE365_BANKACC_NO = {
    riceInAdv: "สั่งซื้อข้าวล่วงหน้า",
    promtpay: "0505556005091",
    KBANK_2309  : "048-3-402309",
    BBL_9919: "063-0-339919"
};

exports.page365User = {
    username: process.env.PAGE365_USERNAME,
    password: process.env.PAGE365_PASSWORD,
};

/**
 * Check order detail is rice in advance (สั่งซื้อข้าวล่วงหน้า)
 * @param {*} orderDetail 
 * @returns true is rice in advance otherwise false
 */
exports.isOrderRiceInAdv = (orderDetail) => {
    if (!orderDetail) {
        return false;
    }

    return orderDetail.bank ? orderDetail.bank.bank_no === this.PAGE365_BANKACC_NO.riceInAdv : false;
};


exports.isOrderVoided = (orderDetail) => {
    return order.stage === this.PAGE365_ORDER_STAGE.VOIDED;
}


/**
 * Get firstname and lastname in page365 customer name
 * @param {*} orderDetail 
 * @returns [firstName, lastName]
 * NOTE: if prefix is not in prefix regularexpression , it will be bug
 * and if suffix is not in (*), it bug
 */
exports.getCustomerName = (orderDetail) => {
    const prefixReg = /(นาย|นางสาว|นส.|น.ส.|น.ส|นาง|ผู้บริจาค :|ของขวัญแด่...|คุณ|นาวาเอก|อาจารย์|รศ.ดร.|ร.อ.)/g;
    const suffixReg = /[(].*[)]/g;

    if (!orderDetail) {
        return ["", ""];
    }

    let name = orderDetail.customer_name;
    let firstName = "";
    let lastName = "";

    // Replace prefix
    let tmpStr = name.replace(prefixReg, "").trim();
    // console.log(tmpStr);

    // Replace suffix
    tmpStr = tmpStr.replace(suffixReg, "").trim();
    // console.log(tmpStr);

    strArr = tmpStr.split(" ");   

    // filter empty string
    [firstName, lastName] = strArr.filter(value => value !== "");

    return [firstName ? utils.cleanString(firstName) : ""
            , lastName ? utils.cleanString(lastName) : ""]; 
};







