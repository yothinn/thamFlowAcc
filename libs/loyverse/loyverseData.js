const csvtojson = require('csvtojson');

/**
 * Csv name
    วันที่
    เลขที่ใบเสร็จ
    ประเภทใบเสร็จ
    ประเภท
    รหัสSKUสินค้า
    รายการ
    ตัวแปร
    ปรับเปลี่ยนการใช้งาน
    จำนวน
    ยอดขายรวม
    ส่วนลด
    ยอดขายสุทธิ
    ต้นทุนสินค้า
    กำไรรวม
    ภาษี
    ระบบขายหน้าร้าน
    ร้านค้า
    ชื่อแคชเชียร์
    รายชื่อติดต่อลูกค้า
    ความคิดเห็น
    สถานะ
*/

const INDEX_NAME = {
    date: "วันที่",
    paymentNo: "เลขที่ใบเสร็จ",
    paymentType: "ประเภทใบเสร็จ",
    categoryName: "ประเภท",
    skuCode: "รหัสSKUสินค้า",
    productName: "รายการ",
    quantity: "จำนวน",
    total: "ยอดขายรวม",
    discount: "ส่วนลด",
}


class LoyverseData {
    _csvData;
    billDate;
    paymentNo;
    paymentType;
    categoryName;
    skuCode;
    productName;
    quantity;
    total;
    discount;

    constructor(csvData) {
        this._csvData = csvData;

        // console.log(this._csvData[INDEX_NAME.date]);
        let [d, t] = this._csvData[INDEX_NAME.date].split(" ");
        let dateArr = d.split("/");
        let timeArr = t.split(":");

        let year = parseInt(dateArr[2]) + 2000;
        let month = parseInt(dateArr[1]) - 1;
        let day = parseInt(dateArr[0]);
        let hour = parseInt(timeArr[0]);
        let min = parseInt(timeArr[1]);

        this.billDate = new Date(year, month, day, hour, min);
        // console.log(this.billDate);

        this.paymentNo = this._csvData[INDEX_NAME.paymentNo];
        this.paymentType = this._csvData[INDEX_NAME.paymentType];
        this.categoryName = this._csvData[INDEX_NAME.categoryName];
        this.skuCode = this._csvData[INDEX_NAME.skuCode];
        this.productName = this._csvData[INDEX_NAME.productName];
        this.quantity = parseFloat(this._csvData[INDEX_NAME.quantity]);
        this.total = parseFloat(this._csvData[INDEX_NAME.total]);
        this.discount =parseFloat(this._csvData[INDEX_NAME.discount]);
    }

    /**
     * loyverse date to flow account date
     */
    l2fDate() {
        return `${this.billDate.getFullYear()}-${this.billDate.getMonth()+1}-${this.billDate.getDate()}`;
    }

}

module.exports = LoyverseData;