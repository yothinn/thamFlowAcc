const request = require("request");
const fs = require("fs");

const ACCREVO_USER = "demoaccounting_thamturakit934@accrevo.com";
const ACCREVO_PASSWORD = "tkKvmKkMNSBbQz3b";
const ACCREVO_APIKEY = "16944aceeaf5927c1871";

(async() => {
    try {
            let token;
            let userInfo;
            let headers = {
                "Content-Type": "application/x-www-form-urlencoded",
            };
               
            // Request authen
            let form = {
                "email": ACCREVO_USER,
                "password": ACCREVO_PASSWORD,
            };

            let res = await new Promise((resolve, reject) => {
                request.post(
                {
                    url: "https://api.accrevo.com/api/v1/login",
                    headers: headers,
                    form: form,
                },
                (err, resp, body) => {
                    if (err) reject(err);
                    resolve(JSON.parse(body));
                });
            });

            token = res.token;
            console.log(res.token);

            // Request check user
            headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "apiKey": ACCREVO_APIKEY
            };

            // form = {
            //     "apiKey": ACCREVO_APIKEY,
            // };

            userInfo = await new Promise((resolve, reject) => {
                request.get(
                {
                    url: "https://api.accrevo.com/api/v1/integrate-user-info",
                    headers: headers,
                    // form: form,
                },
                (err, resp, body) => {
                    if (err) reject(err);
                    resolve(JSON.parse(body));
                });
            });

            console.log(userInfo); 

            // Upload image
            headers = {
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${token}`,
            };

            console.log(__dirname);
            formData = {
                code: userInfo.company_code,
                year: userInfo.company_year,
                file: {
                    value: fs.createReadStream("testbill12.jpg"),
                    options: {
                        filename: "testbill19.jpg"
                    }
                },
                month: 1,
                img_type: 1,
                type: 1
            };


            let billInfo = await new Promise((resolve, reject) => {
                request.post(
                {
                    url: "https://api.accrevo.com/api/v1/uploadtask-image",
                    headers: headers,
                    formData: formData,
                },
                (err, resp, body) => {
                    if (err) reject(err);
                    resolve(JSON.parse(body));
                });
            });

            console.log(billInfo);


            // Save document
            headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "apiKey": ACCREVO_APIKEY,
            };

            body = {
                "transaction_id": "AP0004/01-63",
                "reference":"ทดสอบ",
                "date": "2020-01-10",
                "duedate": "2020-01-10",
                "type":"2",
                "running_code": billInfo.running_code,
                "customer_name": "เบญจขันธ์ สารรัตน์ - 919",
                "customer_address" : "-",
                "customer_taxid": "-",
                "customer_branch": "สำนักงานใหญ่",
                "total": 714.02,
                "grandtotal": 750,
                "vat": 35.98,
                "wht": 0,
                "discount": 0,
                "list":[
                    {
                        "item":"รายได้ขายข้าว",
                        "price": 200,
                        "quantity": 1
                    },
                    {
                        "item": "รายได้ขายสินค้า",
                        "price": 514.01,
                        "quantity": 1
                    }
                ]
            };


            let resInfo = await new Promise((resolve, reject) => {
                request.post(
                {
                    url: "https://api.accrevo.com/api/v1/send-document",
                    headers: headers,
                    body: JSON.stringify(body),
                },
                (err, resp, body) => {
                    if (err) reject(err);
                    resolve(body);
                });
            });

            console.log(resInfo);

    } catch(error) {
        console.log(error);
    }
})();