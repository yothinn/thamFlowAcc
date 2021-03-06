const request = require("request");
const accrevoInfo = require("./accrevoUtils");
const accRevoRunningCodeLog = require("./accrevoRunningcode");

class AccRevo {
    _token = null;
    _apiKey = null;
    _componyInfo = null;

    constructor() {

    }

    async authorize(username, password, apiKey) {
        this._apiKey = apiKey;

        try {
        
            let headers = {
                "Content-Type": "application/x-www-form-urlencoded",
            };
           
            // 1. Request authen and token
            let form = {
                "email": username,
                "password": password,
            };

            this._token = await new Promise((resolve, reject) => {
                request.post(
                    {
                        url: accrevoInfo.ACCREVO_URL.LOGIN,
                        headers: headers,
                        form: form,
                    },
                    (err, resp, body) => {
                        if (err) reject(err);

                        let b = JSON.parse(body);
                        if(b.error) {
                            reject(b.error)
                        } else {
                            resolve(b.token);
                        }
                    });
            });

            // 2. Request check user for company info
            headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this._token}`,
                "apiKey": this._apiKey
            };

            return new Promise((resolve, reject) => {
                request.get(
                    {
                        url: accrevoInfo.ACCREVO_URL.INTERGRATE_USER_INFO,
                        headers: headers,
                    },
                    (err, resp, body) => {
                        if (err) reject(err);

                        let b = JSON.parse(body);

                        if (b.error) {
                            reject(b.error);
                        } else {
                            this._componyInfo = b;
                            resolve(b);
                        }
                });
            });

        } catch(error) {
            throw error;
        }
    }

    /**
     * Upload image bill and save document
     * @param {*} imgBody
     * {
     *  file: use fs.createReadStream(pathFile)
     *  month : month doc
     *  type: use journal account type
     * } 
     * @param {*} docBody 
     * {
     *  transaction_id: "AP0004/01-63",
     *  reference:"ทดสอบ",
        date: "2020-01-10",
        duedate: "2020-01-10",
        type: "2",                  // Journal account type
        customer_name: "เบญจขันธ์ สารรัตน์ - 919",
        customer_address : "-",
        customer_taxid: "-",
        customer_branch: "สำนักงานใหญ่",
        total: 714.02,              // ราคาไม่รวมภาษี 
        grandtotal: 750,            // ราคารวมภาษี
        vat: 35.98,
        wht: 0,                     // หัก ณ ที่ จ่าย
        discount: 0,
        list:[
            {
                item:"รายได้ขายข้าว",     // ชื่อสินค้า
                price: 200,             // ราคาไม่รวมภาษี
                quantity: 1             // จำนวน
            },
            {
                item: "รายได้ขายสินค้า",
                price: 514.01,
                quantity: 1
            }
        ]
     * }
     */
    async uploadDocPerImage(imgBody, docBody) {
        try {
            let headers = {
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${this._token}`,
            };

            // Add another field
            imgBody.code = this._componyInfo.company_code;
            imgBody.year = this._componyInfo.company_year;
            imgBody.img_type = 1;

            // console.log(imgBody);
            // Send to accrevo
            let docRes = await new Promise((resolve, reject) => {
                request.post(
                    {
                        url: accrevoInfo.ACCREVO_URL.UPLOADTASK_IMG,
                        headers: headers,
                        formData: imgBody,
                    },
                    (err, resp, body) => {
                        if (err) reject(err);
                        try {
                            let b = JSON.parse(body);
                            if (b.error) {
                                reject(b.error);
                            } else {
                                resolve(b);
                            }
                        } catch(error) {
                            reject(error);
                        }
                        
                    });
            })
            // console.log(docRes);

            // Save document
            headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this._token}`,
                "apiKey": this._apiKey,
            };

            docBody.running_code = docRes.running_code;
            accRevoRunningCodeLog.info(`transaction_id: ${docBody.transction_id}, running_code: ${running_code}`);

            // console.log(docBody);
            
            return new Promise((resolve, reject) => {
                request.post(
                    {
                        url: accrevoInfo.ACCREVO_URL.SEND_DOC,
                        headers: headers,
                        body: JSON.stringify(docBody),
                    },
                    (err, resp, body) => {
                        if (err) reject(err);

                        // console.log(body);
                        // resolve(body); 
                        let b = JSON.parse(body);
                        if (b.error) {
                            reject(b.error.message);
                        } else {
                            resolve(b);
                        }
                    });
            });
        } catch(error) {
            throw error;
        }

    }

    async uploadDocNImage(imgBodyList, docBody) {
        try {
            let headers = {
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${this._token}`,
            };

            let running_code;
            for (let [i, imgBody] of imgBodyList.entries()) {
                // Add another field to upload image
                imgBody.code = this._componyInfo.company_code;
                // imgBody.year = this._componyInfo.company_year;

                if (i === 0) {          // เอกสารหลัก
                    imgBody.img_type = 1;
                } else {                // เอกสารแนบ
                    imgBody.img_type = 2;
                    imgBody.running_code = running_code;
                }

                // console.log(imgBody);
                // Send to accrevo
                let docRes = await new Promise((resolve, reject) => {
                    request.post(
                        {
                            url: accrevoInfo.ACCREVO_URL.UPLOADTASK_IMG,
                            headers: headers,
                            formData: imgBody,
                        },
                        (err, resp, body) => {
                            if (err) reject(err);
                            try {
                                let b = JSON.parse(body);
                                if (b.error) {
                                    console.log(b);
                                    console.log("image body error");
                                    reject(b.error);
                                } else {
                                    resolve(b);
                                }
                            } catch(error) {
                                reject(error);
                            }
                            
                        });
                })
                // console.log(docRes);
                running_code = docRes.running_code;
            }

            // Save document
            headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this._token}`,
                "apiKey": this._apiKey,
            };

            docBody.running_code = running_code;
            accRevoRunningCodeLog.info(`transaction_id: ${docBody.transction_id}, running_code: ${running_code}`);

            // console.log(docBody);
            
            return new Promise((resolve, reject) => {
                request.post(
                    {
                        url: accrevoInfo.ACCREVO_URL.SEND_DOC,
                        headers: headers,
                        body: JSON.stringify(docBody),
                    },
                    (err, resp, body) => {
                        if (err) reject(err);

                        // console.log(body);
                        // resolve(body); 
                        let b = JSON.parse(body);
                        if (b.error) {
                            // console.log("save doc errro");
                            reject(b.error.message);
                        } else {
                            resolve(b);
                        }
                    });
            });
        } catch(error) {
            throw error;
        }
    }
}

module.exports = AccRevo;