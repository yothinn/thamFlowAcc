const { GoogleSpreadsheet } = require("google-spreadsheet");


const VEGETABLE_INDEXNAME = {
    date: "วันที่",
    suppiler: "ชื่อผู้จำหน่าย",
    productName: "รายการ",
    quantity: "จำนวนสุทธิ",
    unitPrice: "ราคารับซื้อ",
    total: "รวมเงิน",
    paymentType: "การจ่ายเงิน",
}

class VegetableData {
    _ggSheetCred;
    _workbookId;
    _worksheetId;
    _workbook;               // Google sheet workbook
    _worksheet;
    _rows;
    
    constructor() {
        this._workbook = null;
        this._worksheet = null;
        this._rows = null;
    }

    async authorize(ggSheetCred, workbookId) {
        try {
            this._ggSheetCred = ggSheetCred;
            this._workbookId = workbookId;

            // console.log(this._ggSheetCred);
            this._workbook = new GoogleSpreadsheet(this._workbookId);
            if (this._workbook) {
                await this._workbook.useServiceAccountAuth(this._ggSheetCred);

                await this._workbook.loadInfo();
            } else {
                throw "Authorize google sheet error";
            }
        } catch(error) {
            throw error;
        }
    }

    async readSheet(worksheetId) {
        try {
            this.worksheetId = worksheetId;
            if (this._workbook) {
                this._worksheet = this._workbook.sheetsById[worksheetId];
            } else {
                throw "You wasn't initial google sheet";
            }   

            if (!this._worksheet) {
                throw `Can't get worksheet from id : ${worksheetId}`;
            }

            this._rows = await this._worksheet.getRows();
        } catch(error) {
            throw error;
        }

    }

    getProductName(rowIndex) {
        if (!this._rows) {
            throw 'You have to call readSheet function first';
        }

        return this._rows[rowIndex-2][VEGETABLE_INDEXNAME.productName].trim();
    }

    getDate(rowIndex) {
        if (!this._rows) {
            throw 'You have to call readSheet function first';
        }

        let d = this._rows[rowIndex-2][VEGETABLE_INDEXNAME.date];
        let [day, mon, year] = d.split("/");

        return `${year}-${mon}-${day}`;
    }

    getSupplier(rowIndex) {
        if (!this._rows) {
            throw 'You have to call readSheet function first';
        }

        return this._rows[rowIndex-2][VEGETABLE_INDEXNAME.suppiler];
    }

    getQuantity(rowIndex) {
        if (!this._rows) {
            throw 'You have to call readSheet function first';
        }

        return parseFloat(this._rows[rowIndex-2][VEGETABLE_INDEXNAME.quantity]);
    }

    getUnitPrice(rowIndex) {
        if (!this._rows) {
            throw 'You have to call readSheet function first';
        }

        return parseFloat(this._rows[rowIndex-2][VEGETABLE_INDEXNAME.unitPrice]);
    }

    getTotal(rowIndex) {
        if (!this._rows) {
            throw 'You have to call readSheet function first';
        }

        return parseFloat(this._rows[rowIndex-2][VEGETABLE_INDEXNAME.total]);
    }

    getPaymentType(rowIndex) {
        if (!this._rows) {
            throw 'You have to call readSheet function first';
        }

        return this._rows[rowIndex-2][VEGETABLE_INDEXNAME.paymentType];
    }

    /**
     * find first row index that match date string
     * @param {*} dateStr : yyyy-mm-dd 
     * @returns : row index in google sheet format
     */
    async findDate(dateStr) {
        
        let index = await this._rows.findIndex((row, index) => {
            // index+2 เพราะเปลี่ยนจาก index ใน array เป็น index ตาม google sheet
            return this.equalDate(index+2, dateStr);
        });
        // console.log(fDate.getTime());

        // Return row index in google sheet format (have to add 2)
        return (index < 0) ? index : index+2;
    }

    /**
     * เทียบวันที่ว่าตรงกันไหม
     * @param {*} rowIndex : row index in google sheet format
     * @param {*} dateStr : format yyyy-mm-dd
     */
    equalDate(rowIndex, dateStr) {
        let d = new Date(dateStr);

        let [day, mon, year] = this._rows[rowIndex-2][VEGETABLE_INDEXNAME.date].split("/");
        if (!day) return false;

        day = day.padStart(2, 0);
        mon = mon.padStart(2, 0);
        let rowDate = new Date(`${year}-${mon}-${day}`);

        return d.getTime() === rowDate.getTime();
    }
}

module.exports = VegetableData;