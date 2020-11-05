const { createBrowserFetcher } = require("puppeteer");
const accrevoInfo = require("./accrevoinfo");

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
     *  type: journal account type
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
    async uploadDoc(imgBody, docBody) {
        tmpImgBody = imgBody;
        tmpImgBody.code = this._componyInfo.company_code;
        tmpImgBody.year = this._componyInfo.company_year;
        tmpImgBody.img_type = 1;

        // Send to accrevo

        docRes = await new Promise((resolve, reject) => {

        })

        tmpDocBody = docBody;
        tmpDocBody.running_code = docRes.running_code;

        return new Promise((resolve, reject) => {

        });


    }
}