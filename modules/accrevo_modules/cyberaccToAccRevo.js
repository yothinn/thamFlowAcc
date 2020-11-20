const fs = require("fs");
const glob = require("glob");
const path = require("path");
// const AccRevo = require("../../libs/accrevo/accrevo");
// const CyberAccDatabase = require("../../libs/cyberacc/cyberaccDatabase");
// const accountChart = require("../../libs/cyberacc/cyberacc_accountChart.json");
const cyberAccInfo = require("../../libs/cyberacc/cyberaccUtils");
const accRevoInfo = require("../../libs/accrevo/accrevoUtils");
const accRevoLog = require("./accrevoLog");
// const PREFIX_IMGFILE = "Test12";
const IMG_MOCKUP_FILE = "./modules/accrevo_modules/mockup.jpg";

const COUNT_TRANS = 25;
const SLEEP_TIMEOUT = 60000;

class CyberAccToAccRevo {
    _cyberAccDb;
    _accRevo;
    _imgDir = "./";                     // Image Directory
    _accountChart = {};

    _cyberAccConfig;
    _accRevoUser;

    constructor(cyberAccDbConnect, accRevoConnect) {
        this._cyberAccDb = cyberAccDbConnect;
        this._accRevo = accRevoConnect;
    }

    // async authorize(cyberAccConfig, accRevoUser) {
    //     try {
    //         this._cyberAccConfig = cyberAccConfig;
    //         this._accRevoUser = accRevoUser;

    //         // console.log(this._cyberAccConfig);
    //         // console.log(this._accRevoUser);

    //         // Connet mssql cyberacc database;
    //         this._cyberAccDb = new CyberAccDatabase();
    //         let res = await this._cyberAccDb.connect(this._cyberAccConfig.username,
    //                                         this._cyberAccConfig.password,
    //                                         this._cyberAccConfig.server,
    //                                         this._cyberAccConfig.database);
    //         // console.log(res);

    //         this._accRevo = new AccRevo();
    //         res = await this._accRevo.authorize(this._accRevoUser.username,
    //                                         this._accRevoUser.password,
    //                                         this._accRevoUser.apiKey);
    //         // console.log(res);

    //     } catch (error) {
    //         throw error;
    //     }
    // }

    setImageDir(imgDir) {
        this._imgDir = imgDir;
    }

    getImageDir() {
        return this._imgDir;
    }

    setAccountChart(chart) {
        this._accountChart = chart;
    }

    getAccountChart() {
        return this._accountChart;
    }

    async uploadToAccRevoByDate(dateStr) {
        try {
            let cyberAccGL = await this._cyberAccDb.getGLTableByDate(dateStr);
            // console.log(cyberAccGL.length);

            let docList = await this.toAccRevoDoc(cyberAccGL);
            accRevoLog.info(`UPLOAD: TOTAL TRANSACTION ${docList.length}`);

            let count = 0;
            for (let docBody of docList) {
                try {
                    count++;
                    let d = new Date(docBody.date);
                    let suffix = Date.now();

                    // let imgFileName = docBody.transaction_id.replace("/", "-");
                    // console.log(docBody.transaction_id);

                    let imgList = this.findImageFileByMainId(docBody.transaction_id);
                    if (!imgList || imgList.length === 0) {
                        imgList.push(IMG_MOCKUP_FILE);
                    }

                    accRevoLog.info(`IMAGE_FILE: ${JSON.stringify(imgList, null, 3)}`);
                    let imgBodyList = this.createImageBodyList(imgList, d.getMonth()+1, docBody.type);

                    // console.log(docBody);
                    docBody.transaction_id = `${docBody.transaction_id}_${suffix}`;

                    let res = await this._accRevo.uploadDocNImage(imgBodyList, docBody);
                    accRevoLog.info(`UPLOAD: count bill: ${count}, id ${docBody.transaction_id}`);
                    // console.log(res);

                    // Delay send request;
                    if (count === COUNT_TRANS) {
                        accRevoLog.info(`MAXTRANS: SLEEP ${SLEEP_TIMEOUT} ms`);
                        await new Promise(resolve => setTimeout(resolve, SLEEP_TIMEOUT));
                        count = 0;
                        accRevoLog.info("MAXTRANS: WAKE UP AFTER SLEEP");
                    }

                } catch(error) {
                    accRevoLog.error(`ERROR: id ${docBody.transaction_id}`);
                    accRevoLog.error(error);

                    accRevoLog.info(`ERROR: SLEEP ${SLEEP_TIMEOUT} ms`);
                    await new Promise(resolve => setTimeout(resolve, SLEEP_TIMEOUT));
                    count = 0;
                    accRevoLog.info("ERROR: WAKE UP AFTER SLEEP");
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

            if (!cyberAccGL) {
                throw `Can't find ${glMainId}`;
            }

            let docList = await this.toAccRevoDoc(cyberAccGL);

            accRevoLog.info(`UPLOAD: TOTAL TRANSACTION ${docList.length}`);

            let count = 0;
            for (let docBody of docList) {
                try {
                    let d = new Date(docBody.date);
                    let suffix = Date.now();

                    let imgList = this.findImageFileByMainId(docBody.transaction_id);
                    if (!imgList || imgList.length === 0) {
                        imgList.push(IMG_MOCKUP_FILE);
                    }

                    accRevoLog.info(`IMAGE_FILE: ${JSON.stringify(imgList, null, 3)}`);
                    let imgBodyList = this.createImageBodyList(imgList, d.getMonth()+1, docBody.type);


                    docBody.transaction_id = `${docBody.transaction_id}_${suffix}`;
                    let res = await this._accRevo.uploadDocNImage(imgBodyList, docBody);
                    // console.log(res);

                    accRevoLog.info(`UPLOAD: count bill: ${count}, id ${docBody.transaction_id}`);

                    // Delay send request;
                    if (count === COUNT_TRANS) {
                        accRevoLog.info(`MAXTRANS: SLEEP ${SLEEP_TIMEOUT} ms`);
                        await new Promise(resolve => setTimeout(resolve, SLEEP_TIMEOUT));
                        count = 0;
                        accRevoLog.info("MAXTRANS: WAKE UP AFTER SLEEP");
                    }
                    
                    // console.log(res);
                } catch(error) {
                    accRevoLog.error(`ERROR: id ${docBody.transaction_id}}`);
                    accRevoLog.error(error);

                    accRevoLog.info(`ERROR: SLEEP ${SLEEP_TIMEOUT} ms`);
                    await new Promise(resolve => setTimeout(resolve, SLEEP_TIMEOUT));
                    count = 0;
                    accRevoLog.info("ERROR: WAKE UP AFTER SLEEP");
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

                let price = itemGL.debit ? itemGL.debit : itemGL.credit;

                // When withholdingtax , don't push to docBody
                if (this._accountChart.withHoldingTax.code !== itemGL.accountcode) {
                    docBody.list.push({
                        item: itemGL.AccountName,
                        price: price,
                        quantity: 1,
                    });
                }

                // add only debit ( sum debit = sum credit)
                docBody.grandtotal += itemGL.debit;

                // // Calculate vat and withholding tax
                if ((this._accountChart.inputTax.code === itemGL.accountcode) ||
                    (this._accountChart.salesTax.code === itemGL.accountcode)) {
                    docBody.vat = price;                    
                } else if (this._accountChart.withHoldingTax.code === itemGL.accountcode) {
                    docBody.wht = price;
                }

                docBody.total = docBody.grandtotal - docBody.vat;
            }

            return docList;
        }catch(error) {
            throw error;
        }
    }

    createImageBodyList(imgFileList, month, journalTypeId) {
        let imgBodyList = [];
        let suffix = Date.now();
        try {
            for (let filePath of imgFileList) { 

                let imgFileName = path.basename(filePath);
                // console.log(imgFileName);
                imgBodyList.push({
                    file: {
                        value: fs.createReadStream(filePath),
                        options: {          // Change file name when send to server
                            filename: `${suffix}_${imgFileName}.jpg`
                        }
                    },
                    month: month,
                    type: journalTypeId
                });
            }
            return imgBodyList;
        } catch(error) {
            throw error;
        }    
    }

    /**
     * Find image file(jpg) from image directory by glMainId
     * @param {*} glMainId Format : AR0001/10-63
     * Image File Format : AR0001-10-63-xxx.jpg
     * @returns image file list
     */
    findImageFileByMainId(glMainId) {
        try {
            let imgFile = glMainId.replace("/", "-");
            let tmpPath1 = `${this._imgDir}/${imgFile}*.jpg`
            let tmpPath2 = `${this._imgDir}/*/${imgFile}*.jpg`
            let imgList1 = glob.sync(tmpPath1);
            let imgList2 = glob.sync(tmpPath2);

            return [...imgList1, ...imgList2];
        } catch(error) {
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
            case abbrType.SCA: 
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
            case abbrType.SCA:
                return "SCA";
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
 }

module.exports = CyberAccToAccRevo;