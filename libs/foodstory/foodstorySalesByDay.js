const XLSX = require("XLSX");

const FOODSTORY_INDEXNAME = {
    date: "วันที่",
    totalbeforeDiscount: "ยอดก่อนลด",
    discountInItem: "ส่วนลด",
    discountEndBill: "ลดท้ายบิล",
    rounding: "ยอดปัดเศษ",
    total: "รวมสุทธิ (ยอดก่อนภาษี + ภาษี +  ยอดปัดเศษ) -  ยอดขายสินค้าไม่มีภาษี",
    refund: "คืนเงิน",
    branchName: "สาขา"
}

class FoodStorySalesByDay {
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
        if (!this._trans)  return null;

        if (i >= this._trans.length)    return null;

        return this._trans[i];
    }

    getDate(i) {
        if (!this._trans)  return null;

        if (i >= this._trans.length)    return null;

        let d = this._trans[i][FOODSTORY_INDEXNAME.date];
        if (!d) return "";

        let [day, mon, year] = d.split("/");
        // console.log(day);
        // console.log(mon);
        // console.log(year);
        if (isNaN(parseInt(day))) return null; 

        return `${year}-${mon}-${day}`;
    }

    getTotalBeforeDiscount(i) {
        if (!this._trans)  return null;

        if (i >= this._trans.length)    return null;

        return parseFloat(this._trans[i][FOODSTORY_INDEXNAME.totalbeforeDiscount]);
    }

    getDiscountInItem(i) {
        if (!this._trans)  return null;

        if (i >= this._trans.length)    return null;

        return parseFloat(this._trans[i][FOODSTORY_INDEXNAME.discountInItem]);
    }

    getDiscountEndBill(i) {
        if (!this._trans)  return null;

        if (i >= this._trans.length)    return null;

        return parseFloat(this._trans[i][FOODSTORY_INDEXNAME.discountEndBill]);
    }

    getRounding(i) {
        if (!this._trans)  return null;

        if (i >= this._trans.length)    return null;

        return parseFloat(this._trans[i][FOODSTORY_INDEXNAME.rounding]);
    }

    getTotal(i) {
        if (!this._trans)  return null;

        if (i >= this._trans.length)    return null;

        return parseFloat(this._trans[i][FOODSTORY_INDEXNAME.total]);
    }

    getRefund(i) {
        if (!this._trans)  return null;

        if (i >= this._trans.length)    return null;

        return parseFloat(this._trans[i][FOODSTORY_INDEXNAME.refund]);
    }

    getBranchName(i) {
        if (!this._trans)  return null;

        if (i >= this._trans.length)    return null;

        return this._trans[i][FOODSTORY_INDEXNAME.branchName];
    }
}

module.exports = FoodStorySalesByDay;