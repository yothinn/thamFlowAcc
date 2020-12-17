
const XLSX = require("XLSX");

const cyberaccUtils = require("../../libs/cyberacc/cyberaccUtils");
const cyberaccLog = require("./cyberaccLog");

class PettyCashToCyberAcc {
    _fileName;
    _sheetName;
    _workbook;
    _worksheet;
    _trans;
    _cyberAccDb;

    constructor(cyberAccDbConnect) {
        this._fileName = "";
        this._sheetName = "";
        this._workbook = null;
        this._worksheet = null;
        this._trans = null;

        this._cyberAccDb = cyberAccDbConnect;
    }


    async createCyberAccGLMain(orderDate) {
        try {
            if (!(orderDate instanceof Date)) {
                throw "orderDate require date object";
            }

            let d = orderDate.getDate();
            let m = orderDate.getMonth()+1;
            // convert to พ.ศ.
            let y = orderDate.getFullYear()+543;
            
            // console.log(startDay.getMonth()+1);
            // console.log(startDay.getFullYear()+543);
            // create GLMain
            let glMainId = await this._cyberAccDb.getNewGLMainId(cyberaccUtils.ACCOUNTTYPE_ABBR.PV, m.toString(), y.toString());

            if (glMainId) {
                // FORMAT (พ.ศ.) : day/month/year
                let dateStr = `${d}/${m}/${y}`;
                let desp = "";

                await this._cyberAccDb.insertToGLMain(glMainId, dateStr, desp);

                cyberaccLog.info(`GLMain: success created ${glMainId}`);
                // console.log(`GLMain : success created ${glMainId}`);
            }

            return glMainId;
        } catch(error) {
            throw error;
        }
    }

    async createCyberAccGLCredit(glMainId, glCredit) {
        try {
            for (let credit of glCredit) {

                let id = await this._cyberAccDb.getNewIdGLCredit();
                if (!id) {
                    throw "Can't generate id of GLCredit";
                }

                await this._cyberAccDb.insertToGLCredit(glMainId, id, credit.accountCode, credit.description, credit.amount);

                cyberaccLog.info(`GLCredit: success create ${glMainId} ${id} ${credit.accountCode} ${credit.description} ${credit.amount}`);
                //console.log(`GLCredit : success create ${glMainId} ${id} ${credit.accountCode} ${credit.desp} ${credit.amount}`);
            }

        } catch(error) {
            throw error;
        }
    }

    async createCyberAccGLDebit(glMainId, glDebit) {
        try {
            for (let debit of glDebit) {

                let id = await this._cyberAccDb.getNewIdGLDebit();
                if (!id) {
                    throw "Can't generate id of GLDebit";
                }

                await this._cyberAccDb.insertToGLDebit(glMainId, id, debit.accountCode, debit.description, debit.amount);

                cyberaccLog.info(`GLDebit: success create ${glMainId} ${id} ${debit.accountCode} ${debit.description} ${debit.amount}`);
                // console.log(`GLDebit : success create ${glMainId} ${id} ${debit.accountCode} ${debit.desp} ${debit.amount}`);
            }

        } catch(error) {
            throw error;
        }
    }

    /**
     * Calculate gl list from transcation 
     * @param {*} transList : transaction from file
     * glList : [
     *  {
     *      date:,
     *      no:,
     *      debit: [{
     *          accountCode:,
     *          description:,
     *          amount:,
     *      }],
     *      credit: [{
     *          accountCode:,
     *          description:,
     *          amount:,
     *      }]
     *  }
     * ]
     */
    async calGLList(transList) {
        try {
            let glList = [];
            let gl = null;

            for (let trans of transList) {

                // Check null
                // if have null throw error
                if (!trans.date || !trans.no || !trans.accountcode ||
                    !trans.paymentcode || !trans.payment || !trans.description ||
                    !trans.amount) {
                        throw `Null Field : ${trans.date}, ${trans.no}, ${trans.accountcode}, 
                                ${trans.paymentcode}, ${trans.payment}, ${trans.description}, ${trans.amount}`;
                }

                if (!gl || gl.no !== trans.no) {
                    gl = await glList.find((item)=> {
                        return item.no === trans.no;
                    });
                }

                let d;
                if (Number.isInteger(trans.date)) {
                    d = this.excelDateValueToDate(trans.date);
                } else {
                    throw 'Date is not typeof excel date(number)';
                }
                // console.log(d);

                if (!gl) {
                    gl = {
                        date: d,
                        no: trans.no,
                        debit: [],
                        credit: [],
                    }

                    glList.push(gl);
                }

                gl.debit.push({
                    accountCode: trans.accountcode,
                    description: trans.description,
                    amount: trans.amount
                });

                let glCredit = gl.credit.find((item) => {
                    return item.accountCode === trans.paymentcode;
                });

                if (!glCredit) {
                    glCredit = {
                        accountCode: trans.paymentcode,
                        description: trans.payment,
                        amount: 0.0,
                    }
                    gl.credit.push(glCredit);
                }

                glCredit.amount += trans.amount;

            }
            return glList;
        } catch(error) {
            throw error;
        }
    }

    /**
     * read transaction from file and send to cyberacc database
     * @param {*} fileName 
     * @param {*} sheetName 
     */
    async downloadToCyberAccByFile(fileName, sheetName, startRow=0, endRow=0) {
        try {

            this._workbook = await XLSX.readFile(fileName);
            this._worksheet = this._workbook.Sheets[sheetName];
            this._trans = XLSX.utils.sheet_to_json(this._worksheet);

            let glList;
            if ((startRow > 0) && (endRow > 0)) {
                // Read start to end row transaction
                glList = await this.calGLList(this._trans.slice(startRow-2, endRow-1));
            } else {
                // Read all transaction
                glList = await this.calGLList(this._trans);
            }

            // console.log(JSON.stringify(glList, null, 3));

            for (let gl of glList) {
                let glMainId = await this.createCyberAccGLMain(gl.date);
                if (glMainId) {
                    await this.createCyberAccGLCredit(glMainId, gl.credit);
                    await this.createCyberAccGLDebit(glMainId, gl.debit);
                } else {
                    throw "Can't generate glMainid in GLMain";
                }
            }

        } catch (error) {
            throw error;
        }
    }

    /**
     * convert excel date value(number) to date object
     * @param {*} excelDateValue 
     */
    excelDateValueToDate(excelDateValue) {
        try {
            if (Number.isInteger(excelDateValue)) {
                return new Date(Math.floor((excelDateValue - 25569)*86400*1000));
            } else {
                throw 'Cannot covert excel date value to date';
            }
        } catch(error) {
            throw error;
        }
    }
}

module.exports = PettyCashToCyberAcc;