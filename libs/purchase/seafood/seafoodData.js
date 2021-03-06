const XLSX = require('xlsx');

const INDEX_NAME = {
    date: "วันที่",
    billno: "เลขที่บิล",
    processCode: "รหัสสินค้า",
    name: "รายการสินค้า",
    weight: "น้ำหนัก(kg)",
    quantity: "จำนวน(ตัว,ชิ้น)",
    unitPrice: "ราคาต่อหน่วย",
    total: "รวม",
    supplier: "ผู้จำหน่าย",
    // paymentNo: "เลขที่ใบเสร็จ",
    // paymentType: "ประเภทใบเสร็จ",
    // categoryName: "ประเภท",
    // skuCode: "รหัสSKUสินค้า",
    // productName: "รายการ",
    // quantity: "จำนวน",
    // total: "ยอดขายรวม",
    // discount: "ส่วนลด",
}


class SeaFoodData {
    _fileName;
    _trans;
    _workbook;
    _workshee

    constructor() {
        this._fileName = null;
        this._trans = null
    }

    async readTransaction(fileName, sheetName) {
        try {
            this._workbook = await XLSX.readFile(fileName);
            this._worksheet = this._workbook.Sheets[sheetName];
            this._trans = await XLSX.utils.sheet_to_json(this._worksheet);

            // console.log(this._trans);

        } catch(error) {
            console.log(error);
            throw error;
        }
    }

    getTransaction(row) {
        try {
            if ((row-1) <= this._trans.length) {
                return this._trans[row-2];
            } else {

            }
        } catch(error) {
            throw error;
        }
    }

    getDate(row) {
        let serial = this._trans[row-2][INDEX_NAME.date];
        let dateInfo;
        if (typeof serial === 'number') {
            let utcDays  = Math.floor(serial - 25569);
            let utcValue = utcDays * 86400;                                        
            dateInfo = new Date(utcValue * 1000);    
        } else {
            throw `Row :${row} date error`;
        }

        // console.log(dateInfo);
        return `${dateInfo.getFullYear()}-${dateInfo.getMonth()+1}-${dateInfo.getDate()}`;
    }

    getSupplier(row) {
        return this._trans[row-2][INDEX_NAME.supplier];
    }

    getBillNo(row) {
        // console.log(row);
        return this._trans[row-2][INDEX_NAME.billno];
    }

    getProductName(row) {
        return this._trans[row-2][INDEX_NAME.name];
    }

    getProcessCode(row) {
        return this._trans[row-2][INDEX_NAME.processCode];
    }

    getWeight(row) {
        let str = this._trans[row-2][INDEX_NAME.weight];
        let num =parseFloat(str.replace(/[,]/g, "")); 
        return num;
    }

    getQuantity(row) {
        let str = this._trans[row-2][INDEX_NAME.quantity];
        let num =parseFloat(str.replace(/[,]/g, "")); 
        return num;
    }

    getUnitPrice(row) {
        let str = this._trans[row-2][INDEX_NAME.unitPrice];
        let num =parseFloat(str.replace(/[,]/g, "")); 
        return num;
    }

    getUnitName(row) {
        return this._trans[row-2].unitName;
    }

    getTotal(row) {
        let str = this._trans[row-2][INDEX_NAME.total];
        let num =parseFloat(str.replace(/[,]/g, "")); 
        return num;
    }
}

module.exports = SeaFoodData;

