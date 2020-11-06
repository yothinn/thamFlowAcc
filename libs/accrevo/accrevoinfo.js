// id สมุดรายวัน
exports.JOURNAL_ACCOUNTID = {
    SALES: 1,                               // สมุดรายวันขาย
    RECEIPT: 2,                             // สมุดรายวันรับ
    PURCHASE: 4,                            // สมุดรายวันซื้อ
    PAYMENT: 3,                             // สมุดรายวันจ่าย
    GENERAL: 5,                             // สมุดรายวันทั่วไป
};

exports.ACCREVO_URL = {
    LOGIN: "https://api.accrevo.com/api/v1/login",
    INTERGRATE_USER_INFO: "https://api.accrevo.com/api/v1/integrate-user-info",
    UPLOADTASK_IMG: "https://api.accrevo.com/api/v1/uploadtask-image",
    SEND_DOC: "https://api.accrevo.com/api/v1/send-document",
};