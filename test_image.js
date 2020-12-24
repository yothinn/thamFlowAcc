const fs = require("fs");
const nodeHtmlToImage = require('node-html-to-image');
const thamInfo = require("./modules/thaminfo_credential.json");
const Page365 = require("./libs/page365/page365");


createBillHtmlFromPage365 = (orderDetail) => {

    let tableStr = "";
    for (let [index, item] of orderDetail.items.entries()) {
        let total = item.price * item.quantity;
        let str = `
            <tr>
                <td id="no_col">${index+1}</td>
                <td id="product_col">${item.name}</td>
                <td id="quantity_col">${item.quantity}</td>
                <td id="unitpr_col">${item.price.toFixed(1)}</td>
                <td id="amount_col">${total.toFixed(1)}</td>
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
                            ${orderDetail.paid_amount.toLocaleString("th-TH", {minimumFractionDigits:1})} 
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


(async() => {
    try {

        let p365 = new Page365();

        await p365.connect(thamInfo.page365User.username, thamInfo.page365User.password);

        let orderDetail = await p365.getOrderDetailByBillNo(10337);
        
        // console.log(orderDetail);
        // let orderDetail = {};

        let htmlTemp = createBillHtmlFromPage365(orderDetail);

        console.log(htmlTemp);

        nodeHtmlToImage({
            output: './image.jpg',
            html: htmlTemp,
        })
        .then(() => {
            console.log('The Image was created successfully');
        });
        
    } catch(error) {
        console.log(error);
    }
})();



