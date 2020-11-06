const fs = require("fs");
const AccRevo = require("../accrevo/accrevo");
const CyberAccDatabase = require("./cyberacc_database");
const cyberAccInfo = require("./cyberaccinfo");
const accRevoInfo = require("../accrevo/accrevoinfo");
const accountChart = require("./cyberacc_accountChart.json");

// const PREFIX_IMGFILE = "Test12";
const IMG_MOCKUP_FILE = "./libs/cyberacc/mockup.jpg"

class CyberAccToAccRevo {
    _cyberAccDb;
    _accRevo;

    _cyberAccConfig;
    _accRevoUser;

    constructor() {

    }

    async authorize(cyberAccConfig, accRevoUser) {
        try {
            this._cyberAccConfig = cyberAccConfig;
            this._accRevoUser = accRevoUser;

            // console.log(this._cyberAccConfig);
            // console.log(this._accRevoUser);

            // Connet mssql cyberacc database;
            this._cyberAccDb = new CyberAccDatabase();
            let res = await this._cyberAccDb.connect(this._cyberAccConfig.username,
                                            this._cyberAccConfig.password,
                                            this._cyberAccConfig.server,
                                            this._cyberAccConfig.database);
            // console.log(res);

            this._accRevo = new AccRevo();
            res = await this._accRevo.authorize(this._accRevoUser.username,
                                            this._accRevoUser.password,
                                            this._accRevoUser.apiKey);
            // console.log(res);

        } catch (error) {
            throw error;
        }
    }

    async uploadToAccRevoByDate(dateStr) {
        try {
            let cyberAccGL = await this._cyberAccDb.getGLTableByDate(dateStr);
            // console.log(cyberAccGL.length);

            let docList = await this.toAccRevoDoc(cyberAccGL);
            console.log(docList.length);
            // console.log(JSON.stringify(docList[0]));

            let count = 0;
            for (let docBody of docList) {
                try {
                    count++;
                    let d = new Date(docBody.date);
                    let suffix = Date.now();

                    let imgFileName = docBody.transaction_id.replace("/", "-");

                    let imgBody = {
                        file: {
                            value: fs.createReadStream(IMG_MOCKUP_FILE),
                            options: {
                                filename: `${suffix}_${imgFileName}.jpg`
                            }
                        },
                        month: d.getMonth()+1,
                        type: docBody.type
                    };
                    // console.log(imgBody);

                    // console.log(docBody);
                    docBody.transaction_id = `${docBody.transaction_id}_${suffix}`;
                    console.log(docBody.transaction_id);
                    let res = await this._accRevo.uploadDoc(imgBody, docBody);
                    // console.log(res);

                    // Delay send request;
                    if (count === 25) {
                        console.log("SLEEP 30000 ms");
                        await new Promise(resolve => setTimeout(resolve, 30000));
                        count = 0;
                        console.log("WAKE UP");
                    }

                } catch(error) {
                    console.log(`ERROR ID ${docBody.transaction_id}`);
                    console.log("SLEEP 30000 ms");
                    await new Promise(resolve => setTimeout(resolve, 30000));
                    count = 0;
                    continue;
                }
            }
        } catch(error) {
            throw error;
        }
    }

    async updloadToAccRevoByMainId(glMainId) {
        try {
            let cyberAccGL = await this._cyberAccDb.getGLTableByMainId(glMainId);

            let docList = await this.toAccRevoDoc(cyberAccGL);
            // console.log(JSON.stringify(docList[0]));

            for (let docBody of docList) {
                try {
                    let d = new Date(docBody.date);
                    let suffix = Date.now();

                    let imgFileName = docBody.transaction_id.replace("/", "-");

                    let imgBody = {
                        file: {
                            value: fs.createReadStream(IMG_MOCKUP_FILE),
                            options: {
                                filename: `${suffix}_${imgFileName}.jpg`
                            }
                        },
                        month: d.getMonth()+1,
                        type: docBody.type
                    };
                    // console.log(imgBody);

                    // console.log(docBody);
                    docBody.transaction_id = `${docBody.transaction_id}_${suffix}`;
                    let res = await this._accRevo.uploadDoc(imgBody, docBody);
                    console.log(res);
                } catch(error) {
                    console.log(`ERROR ID ${docBody.transaction_id}`);
                    continue;
                }
            }
        } catch (error) {
            throw error;
        }
    }

    async toAccRevoDoc(cyberAccGL) {
        let docList = [];
        let docBody = null;

        try {
            for (let itemGL of cyberAccGL) {
                
                if (!docBody || docBody.transaction_id !== itemGL.glmainid) {
                    docBody = await docList.find((item) => {
                            return item.transaction_id === itemGL.glmainid;
                    })
                }

                if (!docBody) {
                    let d = this.convertToDateStr(itemGL.addDate);

                    docBody = {
                        transaction_id: itemGL.glmainid,
                        reference: "",
                        date: d,
                        duedate: d,
                        type: this.convertToJournalId(itemGL.glmainid).toString(),
                        customer_name: this.convertToCustomerName(itemGL.glmainid),
                        customer_address : "-",
                        customer_taxid: "-",
                        customer_branch: "สำนักงานใหญ่",
                        total: 0,
                        grandtotal: 0,
                        vat: 0,
                        wht: 0.00,
                        discount: 0,
                        list: [],
                    }

                    docList.push(docBody);
                }

                let price = itemGL.debit ? itemGL.debit : itemGL.credit

                if (accountChart.withHoldingTax.code !== itemGL.accountcode) {
                    docBody.list.push({
                        item: itemGL.AccountName,
                        price: price,
                        quantity: 1,
                    });
                }

                docBody.grandtotal += itemGL.debit;
                if ((accountChart.inputTax.code === itemGL.accountcode) ||
                    (accountChart.salesTax.code === itemGL.accountcode)) {
                    docBody.vat = price;                    
                } else if (accountChart.withHoldingTax.code === itemGL.accountcode) {
                    docBody.wht = price;
                } 
                docBody.total = docBody.grandtotal - docBody.vat;
            }

            return docList;
        }catch(error) {
            throw error;
        }
    }

    convertToDateStr(glDate) {
        try {
            let d = new Date(glDate);
            let year = d.getFullYear();
            let month = d.getMonth()+1;
            month = month.toString().padStart(2, "0");
            let day = d.getDate().toString().padStart(2, "0");
            return `${year}-${month}-${day}`;
        } catch(error) {
            throw error;
        }
    }

    convertToJournalId(glMainId) {
        // console.log(glMainId);
        let abbrType = cyberAccInfo.ACCOUNTTYPE_ABBR;

        // search first number in string
        let end = glMainId.search(/[0-9]/);
        let abbr = glMainId.substring(0, end);
        switch (abbr) {
            case abbrType.AR:
            case abbrType.RP:
            case abbrType.SCE:
            case abbrType.SEA: 
                return accRevoInfo.JOURNAL_ACCOUNTID.SALES;
            case abbrType.AP:
            case abbrType.APP:
            case abbrType.APR:
            case abbrType.APO:
                return accRevoInfo.JOURNAL_ACCOUNTID.PURCHASE;
            case abbrType.RV:
                return accRevoInfo.JOURNAL_ACCOUNTID.RECEIPT;
            case abbrType.PV:
                return accRevoInfo.JOURNAL_ACCOUNTID.PAYMENT;
            case abbrType.JV:
                return accRevoInfo.JOURNAL_ACCOUNTID.GENERAL;
        }
    }

    convertToCustomerName(glMainId) {
        let abbrType = cyberAccInfo.ACCOUNTTYPE_ABBR;

        // search first number in string
        let end = glMainId.search(/[0-9]/);
        let abbr = glMainId.substring(0, end);
        switch (abbr) {
            case abbrType.AR:
                return "ลูกค้าหนึ้การค้า";
            case abbrType.AP:
                return "เจ้าหนี้การค้า";
            case abbrType.RV:
                return "รับเงินลูกหนี้การค้า";
            case abbrType.PV:
                return "จ่ายเงินเจ้าหนี้การค้า/ค่าใช้จ่าย";
             case abbrType.JV:
                return "รายการปรับปรุง";
            case abbrType.RP:
                return "RP";
            case abbrType.SCE:
                return "SCE";
            case abbrType.SEA:
                return "SEA"; 
            case abbrType.APP:
                return "APP";
            case abbrType.APR:
                return "APR";
            case abbrType.APO:
                return "APO";
            default:
                return "ยังไม่ระบุลูกค้า";
        }
    }


    close() {
        this._cyberAccDb.close();
    }
 }

module.exports = CyberAccToAccRevo;