const XLSX = require("xlsx");

const FOODSTORY_INDEXNAME = {
    date: "วันที่ชำระเงิน",
    time: "เวลาที่ชำระเงิน",
    paymentId: "หมายเลขใบเสร็จ / ID",
    invId: "INV. No",
    menuName: "ชื่อเมนู",
    quantity: "จำนวน",
    unitPrice: "ราคาต่อหน่วย",
    totalbeforeDiscount: "ยอดก่อนลด",
    discount: "ส่วนลดทั้งหมด",
    total: "ราคาสุทธิ",
    paymentType: "ประเภทการชำระเงิน",
    remark: "หมายเหตุ",
    branchName: "สาขา",
}

// Read Food story (bill detail) from XLSX File
class FoodStory {
    _fileName;
    _sheetName;
    _wb;                    //  Workbook
    _ws;                    //  Worksheet
    _trans;                 //  transcation

    constructor() {
    }

    /**
     * Read data in file
     * @param {*} fileName 
     * @param {*} sheetName
     * @return total row 
     */
    async readFile(fileName, sheetName) {
        this._fileName = fileName;
        this._sheetName = sheetName;

        try {
            this._wb = await XLSX.readFile(fileName);
            this._ws = this._wb.Sheets[sheetName];
            this._trans = XLSX.utils.sheet_to_json(this._ws, {range: 1});

            return this._trans.length;
            // console.log(this._trans);
            // console.log(this._trans.length);
        } catch(error) {
            throw error;
        }
    }

    getRow(i) {
        return this._trans[i];
    }

    /**
     * Get Payment date : format : YYYY-MM-DD
     * @param {number} i : row index (in excel row 3 = index 0)
     */
    getPaymentDate(i) {
        if (this._trans) {
            let d = this._trans[i][FOODSTORY_INDEXNAME.date];
            if (!d) return "";

            let [day, mon, year] = d.split("/");
            // console.log(day);
            // console.log(mon);
            // console.log(year);
            if (isNaN(parseInt(day))) return null; 

            return `${year}-${mon}-${day}`;
        }
    }

    /**
     * Get payment time
     * @param {*} i 
     */
    getPaymentTime(i) {
        return this._trans ? this._trans[i][FOODSTORY_INDEXNAME.time] : null;
    }

    getPaymentId(i) {
        return this._trans ? this._trans[i][FOODSTORY_INDEXNAME.paymentId] || "" : null;
    }

    getInvNo(i) {
        return this._trans ? this._trans[i][FOODSTORY_INDEXNAME.invId] || "" : null;
    }

    /**
     * Get menu main name
     * NOTE : if has option , it ignored
     * function will split menu by x  and return first name that split
     * @param {*} i 
     */
    getMenuName(i) {
        if (!this._trans)   return "";

        if (this._trans[i][FOODSTORY_INDEXNAME.menuName]) {
            let menu = this._trans[i][FOODSTORY_INDEXNAME.menuName].split("x");
            return menu[0].trim();
        } else {
            return "";
        }
    }

    getQuantity(i) {
        return this._trans ? this._trans[i][FOODSTORY_INDEXNAME.quantity] : null;
    }

    getUnitPrice(i) {
        return this._trans ? this._trans[i][FOODSTORY_INDEXNAME.unitPrice] : null;
    }

    getTotalBeforeDiscount(i) {
        return this._trans ? this._trans[i][FOODSTORY_INDEXNAME.totalbeforeDiscount] : null;
    }

    getDiscount(i) {
        return this._trans ? this._trans[i][FOODSTORY_INDEXNAME.discount] : null;
    }

    getTotal(i) {
        return this._trans ? this._trans[i][FOODSTORY_INDEXNAME.total] : null;
    }

    getPaymentType(i) {
        return this._trans ? this._trans[i][FOODSTORY_INDEXNAME.paymentType] || "" : null;
    }

    getRemark(i) {
        return this._trans ? this._trans[i][FOODSTORY_INDEXNAME.remark] || "" : null;
    }

    getBranchName(i) {
        return this._trans ? this._trans[i][FOODSTORY_INDEXNAME.branchName] || "" : null;  
    }
}

module.exports = FoodStory;