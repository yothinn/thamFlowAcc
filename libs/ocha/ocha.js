// Author: Theerasak tublit

const puppeteer = require('puppeteer');
const fetch = require("node-fetch");

class Ocha {
    _cookie;

    constructor() {
        this._cookie = null;
    }

    isConnect() {
        return (this._cookie !== null);
    }
    
    /**
     * Connect to ocha for cookie
     * @param {*} mobile_number 
     * @param {*} username 
     * @param {*} password 
     */
    async connect(mobile_number, username, password) {

        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto('https://manager.ocha.in.th/login', { waitUntil: 'networkidle2' });

            // await page.screenshot({ path: "./example.png" });
            
            const tabs = await page.$$(".tab");
    
            await tabs[1].click();
    
            await page.type('[name="mobile_number"]', mobile_number);
            await page.type('[name="username"]', username);
            await page.type('[name="password"]', password);
    
            const btnLogin = await page.$$(".btn-rev");
    
            await btnLogin[0].click();
    
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
            await page.waitFor(3000);
    
            let currentCookies = await page._client.send('Network.getAllCookies')
    
            await browser.close();
    
            this._cookie = "";
            const promise = currentCookies.cookies.map(async (ckies, idx) => {
                this._cookie = `${this._cookie} ${ckies.name}=${ckies.value};`
            });
    
            await Promise.all(promise);
        } catch (error) {
            throw error;
        }      
    };
 
    /**
     * 1. อ่านข้อมูลหน้าร้านทั้งหมดจาก ocha owner account
     * @returns json object shopping list
     */
    async getOchaShopList() {
        if (!this.isConnect()) {
            throw "You must call connect before this";
        }

        let options = {
            method: "POST",
            headers: {
                cookie: this._cookie
            },
            body: JSON.stringify({ branch_list_info_version: 0 }),
            json: true
        };

        try {
            const response = await fetch(
                "https://live.ocha.in.th/api/shop/branch/get/",
                options
            );

            const result = await response.json();
            return result;
        } catch (error) {
            throw "error_code: 99, reason: cookie is expired, display_text: cookie is expired !!";
            // return { error_code: 99, reason: 'cookie is expired', display_text: 'cookie is expired !!' }
        }
    };

    async getOchaShopIdByName(shopName) {
        try {
            if (!this.isConnect()) {
                throw "You must call connect before this";
            }

            let shopList = await this.getOchaShopList();
            if (shopList.error_code === 0) {
                return shopList.shops.find((value) => {
                    return value.profile.shop_name === shopName; 
                })
            } else {
                throw `Ocha error : ${shopList.reason}`;
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get cookie posocha for each branch
     * @param {*} shopId 
     */
    async getCookieBranch(shopId) {
        let options = {
            method: "POST",
            headers: {
                cookie: this._cookie
            },
            body: JSON.stringify({
                branch_shop_id: shopId
            }),
            json: true
        };

        try {
            const response = await fetch(
                "https://live.ocha.in.th/api/auth/branch/",
                options
            );

            const result = await response.json();
            let posocha = response.headers.get("set-cookie");

            // Get branch info for posocha cookie
            if (posocha) {
                posocha = posocha.split(";")[0];
                return posocha;
            } else {
                throw "can't get cookie (posocha)";
            }
        } catch(error) {
            throw error;
        }
    }

    
    /**
     * get all  order per shop between startTime and endTime
     * @param {*} shopId 
     * @param {*} startTime 
     * @param {*} endTime 
     */
    async getDailyOrdersByShop (shopId, startTime, endTime) {
        if (!this.isConnect()) {
            throw "You must call connect before this";
        }

        try {
            // Get cookie branch 
            let posocha = await this.getCookieBranch(shopId)
            if (posocha) {
                const orders = await this.interfaceOchaByDate(posocha, startTime, endTime);
                return orders;
            } 
        } catch(error) {
            throw error;
        }
    };

    /**
     * get each bill order of shop id
     * @param {*} shopId 
     * @param {*} billNo 
     */
    async getBillOrderByShop(shopId, billNo) {
        if (!this.isConnect()) {
            throw "You must call connect before this";
        }

        try {
            // Get cookie branch 
            let posocha = await this.getCookieBranch(shopId)
            if (posocha) {
                const order = await this.interfaceOchaByBillNo(posocha, billNo);
                return order;
            } 
        } catch(error) {
            throw error;
        }
    }

    async interfaceOchaByBillNo(posocha, billNo) {
        let orders = [];
        const url = "https://live.ocha.in.th/api/transaction/history/search";
        const cookie = ` ${posocha}`;
    
        let body = {
            column_filter: {
                uid_list: null,
                payment_type_list: null,
                status_list: [0, 1, 4, 64],
                dine_type_list: [1, 2],
                include_e_payment: true,
                payment_status_list: [0, 2, 6, 7]
            },
            filter: {},
            //filter: { start_time: startTime, end_time: endTime },
            pagination: {
                page_size: 15,
                pagination_result_count: 100,
                page_begin: null
            },
            search_data: {
                type: 1,
                value: billNo
            }
        };
    
        const options = {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                // Authorization: authKey,
                cookie: cookie
            }
        };
    
        try {
            const response = await fetch(url, options);
            const result = await response.json();

            if (result.error_code !== 0) {
                throw `!! Get ocha bill error : ${result.reason}`;
            }
            return result.orders;
            
        } catch (error) {
            throw error;
        }
    }

    /**
     * 
     * @param {*} posocha 
     * @param {*} startTime 
     * @param {*} endTime 
     */
    async interfaceOchaByDate(posocha, startTime, endTime) {
        let orders = [];
        const url = "https://live.ocha.in.th/api/transaction/history/";
        const cookie = ` ${posocha}`;
    
        let body = {
            column_filter: {
                uid_list: null,
                payment_type_list: null,
                status_list: [0, 1, 4, 64],
                dine_type_list: [1, 2],
                include_e_payment: true,
                payment_status_list: [0, 2, 6, 7]
            },
            filter: { start_time: startTime, end_time: endTime },
            pagination: {
                page_size: 15,
                pagination_result_count: 100,
                page_begin: null
            }
        };
    
        const options = {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                // Authorization: authKey,
                cookie: cookie
            }
        };
    
        try {
            const response = await fetch(url, options);
    
            // 3.1. อ่านข้อมูลหน้าแรกเพื่อให้ได้ข้มูลเพจทั้งหมด json.pagination.page_begins
            const json1 = await response.json();
            // ไม่มีข้อมูล
            if (!json1.pagination) {
                return orders;
            } 
            
            const promise = json1.pagination.page_begins.map(async (pbg, idx) => {
                // 3.2. อ่านข้อมูล Orders แต่ละเพจ
                body.pagination.page_begin = pbg;
                const options = {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: {
                        // Authorization: authKey,
                        cookie: cookie
                    }
                };
                const response = await fetch(url, options);
                const json = await response.json();
                // console.log(json.orders.length);
    
                // 3.3. Map ข้อมูล Orders ตามโครงสร้างของเรา
                const promiseOrd = json.orders.map(async (od, idx) => {
                    if (od.order.status === 0) {
                        orders.push(od);
                    }
                });
                await Promise.all(promiseOrd);
            });
    
            // 3.4.  รอ loop อ่านข้อมูลจนครบตามสัญญา (promise)
            await Promise.all(promise);
            // console.log(JSON.stringify(orders));
            return orders;
        } catch (error) {
            throw error;
        }
    };
}

module.exports = Ocha;



