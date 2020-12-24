const utils = require("../utils");
const nodeHtmlToImage = require('node-html-to-image');

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
    return orderDetail.stage === this.PAGE365_ORDER_STAGE.VOIDED;
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

exports.createOrderImage = async(fileName, orderDetail) => {
    try {
        let htmlTemp = this.createBillHtmlFromPage365(orderDetail);

        await nodeHtmlToImage({
            output: fileName,
            html: htmlTemp,
        });

    } catch (error) {
        throw error;
    }
}


exports.createBillHtmlFromPage365 = (orderDetail) => {

    let tableStr = "";
    for (let [index, item] of orderDetail.items.entries()) {
        let total = item.price * item.quantity;
        let str = `
            <tr>
                <td id="no_col">${index+1}</td>
                <td id="product_col">${item.name}</td>
                <td id="quantity_col">${item.quantity}</td>
                <td id="unitpr_col">${item.price.toLocaleString("th-TH", {minimumFractionDigits:1})}</td>
                <td id="amount_col">${total.toLocaleString("th-TH", {minimumFractionDigits:1})}</td>
            </tr>
        `;
        tableStr = tableStr + str;
    }

    let createDate = null;
    let createDateStr = "";
    let paidDate = null;
    let paidDateStr = "";

    // Created date 
    if (orderDetail.created_at) {
        createDate = new Date(orderDetail.created_at);
        createDateStr = `${createDate.getDate()}/${createDate.getMonth()+1}/${createDate.getFullYear()+543}`;
    }
    
    // Paid date
    if (orderDetail.paid_date) {
        paidDate = new Date(orderDetail.paid_date);
        paidDateStr = `${paidDate.getDate()}/${paidDate.getMonth()+1}/${paidDate.getFullYear()+543}`;
    }

    return `
        <html>
            <head>
                <link rel="preconnect" href="https://fonts.gstatic.com">
                <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@200&display=swap" rel="stylesheet">
                <style>
                    body {
                        width: 794;
                        hedigh: 1123;
                        font-family: "kanit", sans-serif;
                        padding: 10px 50px 50px 50px;
                    }

                    div {
                        padding: 3px;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;      
                    }

                    th {
                        padding: 5px;
                    }

                    td {
                        padding: 3px;
                    }

                    thead {
                        border-top: 1px solid black;
                        border-bottom: 1px solid black;
                    }

                    tbody {
                        border-bottom: 7px double black;
                    }

                    #header_container {
                        display:flex;
                        flex-direction: row;
                        margin-top: 5px;
                        margin-bottom: 5px;
                    }

                    #customer_info {
                        max-width: 50%;
                        width: 50%;
                        display: flex;
                        flex-direction: column;
                    }

                    #bill_info {
                        max-width: 50%;
                        width: 50%;
                        display: flex;
                        flex-direction: column;
                    }

                    #total_info {
                        display: flex;
                        flex-direction: column;
                        flex-grow: 1;
                    }

                    #remark_info {
                        display: flex;
                        flex-direction: column;  
                        flex-grow: 1;
                    }

                    #table_container {
                        margin-top: 5px;
                        margin-bottom: 5px;
                    }

                    #no_col {
                        text-align: center;
                    }

                    #product_col {
                        padding-left: 10px;
                    }

                    #quantity_col {
                        text-align: center;
                    }

                    #unitpr_col {
                        text-align: right;
                        padding-right: 10px;
                    }

                    #amount_col {
                        text-align: right;
                        padding-right: 10px;
                    }

                    #payment_container {
                        display:flex;
                        flex-direction: row;
                        margin-bottom: 50px;
                    }

                    #slip_info {
                        max-width: 50%;
                        display: flex;
                        width: 400px;
                        height: 400px;
                    }

                    #payment_info {
                        max-width: 50%;
                        display: flex;
                        flex-direction: column;
                        flex-grow: 1;
                    }

                    img {
                        max-width: 100%;
                        max-height: 100%;
                        width: auto;
                        height: auto;
                        object-fit: contain;
                    }

                </style>
            </head>
            <body >
                <div style="text-align:center;">
                    <h2 style="text-align:center;">ใบเสร็จรับเงิน</h2>
                </div>
                <div id="header_container">
                    <div id="customer_info">
                        <div>
                            <strong>ชื่อ:</strong> 
                            ${orderDetail.customer_name}
                        </div>
                        <div>
                            <strong>ที่อยู่:</strong> 
                            ${orderDetail.customer_address ? orderDetail.customer_address : ""} 
                        </div>
                        <div>
                            <strong>โทร:</strong> 
                            ${orderDetail.customer_phone ? orderDetail.customer_phone : ""} 
                        </div>
                    </div>
                    <div id="bill_info">
                        <div><strong>เลขที่บิล </strong> ${orderDetail.no}</div>
                        <div><strong>วันที่ </strong> ${createDateStr}</div>
                    </div>
                </div>
                <div id="table_container">
                    <table>
                        <thead>
                            <tr>
                                <th style="width:5%;">ลำดับ</th>
                                <th style="width:50%;">รายการสินค้า</th>
                                <th style="width:5%;">จำนวน</th>
                                <th style="width:20%;">ราคาต่อหน่วย</th>
                                <th style="width:20%;">จำนวนเงิน</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableStr}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td></td>
                                <td><strong>หมายเหตุ</strong></td>
                                <td></td>
                                <td><strong>รวม</strong></td>
                                <td id="amount_col">${orderDetail.subtotal.toLocaleString("th-TH", {minimumFractionDigits:1})} </td>
                            </tr>
                            <tr>
                                <td></td>
                                <td rowspan="3">${orderDetail.note ? orderDetail.note : ""}</td>
                                <td></td>
                                <td><strong>ส่วนลด</strong></td>
                                <td id="amount_col">
                                    ${orderDetail.discount ? orderDetail.discount.toLocaleString("th-TH", { minimumFractionDigits:1}) : "0.0"} 
                                </td>
                            </tr>
                            <tr>
                                <td></td>
                                <td></td>
                                <td><strong>ค่าจัดส่ง (${orderDetail.shipping_option})<strong></td>
                                <td id="amount_col">${orderDetail.shipping_cost.toLocaleString("th-TH", {minimumFractionDigits:1})} </td>
                            </tr>
                            <tr>
                                <td></td>
                                <td></td>
                                <td><strong>สุทธิ</strong></td>
                                <td id="amount_col">${orderDetail.total.toLocaleString("th-TH", {minimumFractionDigits:1})} </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div id="payment_container">
                    <div id="payment_info">
                        <div>
                            <strong>ชำระผ่านทาง </strong>
                             ${orderDetail.bank ? orderDetail.bank.bank_name : ""} 
                        </div>
                        <div>
                            <strong>เลขบัญชี </strong>
                            ${orderDetail.bank ? orderDetail.bank.bank_no : ""}
                        </div>
                        <div>
                            <strong>วันที่ชำระ </strong> 
                            ${paidDateStr} ${orderDetail.paid_time} 
                        </div>
                        <div>
                            <strong>ยอดโอน </strong> 
                            ${orderDetail.paid_amount ? orderDetail.paid_amount.toLocaleString("th-TH", {minimumFractionDigits:1}) : "" } 
                        </div>
                    </div>
                    <div id="slip_info">
                        <img src="${orderDetail.slip}">
                    </div>
                </div>
            </body>
        </html>
    `;
};








