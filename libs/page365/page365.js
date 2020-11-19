const puppeteer = require('puppeteer');
const fetch = require("node-fetch");

class Page365 {
    _session = "";
    _cookies;

    constructor() {
    }

    get session() {
        return this._session;
    }

    set session(value) {
        this._session = `_page365_session=${value}`;
    }

    /**
     * check : has session for request page365
     * @returns boolean : TRUE has session
     */
    hasSession() {

        if (this._session === '') return false;

        const s = this._session.split("=");
        // console.log(s[1]);

        return s[1] !== '';
    }

    /**
     * connect page365 for get session 
     * @param {*} username 
     * @param {*} password 
     */
    async connect(username, password) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://page365.net/session/new', { waitUntil: 'networkidle2' });
    
        await page.type('[name="email"]', username);
        await page.type('[name="pass"]', password);
    
        const btnLogin = await page.$$('#loginbutton');
        await btnLogin[0].click();
    
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
        await page.waitFor(3000);
        // await page.waitForTimeout(3000);
    
        //await page.screenshot({ path: 'example.png'});
        
        // Get all cookies
        let currentCookies = await page._client.send('Network.getAllCookies');
        this._cookies = currentCookies.cookies;

        // Find page365 session and set value
        const s = await this._cookies.find(item => {
            return item.name === "_page365_session";
        })

        if (s) {
            this.session = s.value;
        }

        await browser.close();
    }
   
    /**
     * Get Bills(only header not order detail) between startTime and endTime
     * @param {*} startTime : startTime in millisecond
     * @param {*} endTime : endTime in millisecond
     * @returns array of bills
     */
    async getBills(startTime, endTime) {
        let bills = [];
        let pageNo = 1;
        let options = {
            method: "GET",
            headers: {  
                cookie: this.session,
            }
        };

        // console.log(this.session);
        if (!this.hasSession())  throw 'it has not session for request';

        let response;
        let result;

        try {
            // ลูปขอบิลครบทุกใบ
            // 1 page มี 100 ใบ  ร้องขอจนกว่าจำนวนบิลจะเท่ากับ 0
            do {
                response = await fetch(
                    `https://page365.net/Thamturakit/orders.json?from=${startTime}&to=${endTime}&page=${pageNo}&sort=created_at_asc`,
                    options
                );
                result = await response.json();

                console.log(result);
                if (result.orders.length > 0) {
                    bills = bills.concat(result.orders);
                }
                
                pageNo++;
            } while (result.orders.length > 0);

            return bills;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get Bill by bill no (bill no)
     * @param {*} billNo
     * @returns bill json object
     */
    async getBillByBillNo(billNo) {
        let options = {
            method: "GET",
            headers: {  
                cookie: this.session,
            }
        };

        // console.log(this.hasSession());
        if (!this.hasSession())  throw 'it has not session for request';

        let response;
        let result;

        try {
            response = await fetch(
                `https://page365.net/Thamturakit/orders.json?search=${billNo}`,
                options
            );
            result = await response.json();
            return result.orders;

        } catch (error) {
            throw error;
        }
    }

    /**
     * Get Order detail between starttime and endtime
     * @param {Date} startTime : starttime timestamp
     * @param {Date} endTime : endtime timestamp
     * @returns array fo order detail
     */
    async getOrderDetailByDate(startTime, endTime) {
        try {
            let orders = [];
            const bills = await this.getBills(startTime, endTime);

            // console.log(bills);
            // Not bills in dateTime
            if (!bills || bills.length === 0)   return [];

            for (let bill of bills) {
                const order = await this.getOrderDetail(bill.id);
                orders.push(order);
            }

            return orders;
        }
        catch(error) {
            throw error;
        }
    }

    async getOrderDetailByBillNo(billNo) {
        try {
            const bill = await this.getBillByBillNo(billNo);

            // Not bills
            if (!bill || bill.length === 0)   return [];

            const order = await this.getOrderDetail(bill[0].id);          
            return order;
        }
        catch(error) {
            throw error;
        }
    }

    /**
     * Get order detail per id
     * @param {*} orderId 
     * @returns order json
     */
    async getOrderDetail(orderId) {
        try {
            let options = {
                method: "GET",
                headers: {
                    cookie: this.session,
                }
            };

            if (!this.hasSession())  throw "it hasn't session for request";

            const response = await fetch(`https://page365.net/thamturakit/orders/${orderId}.json`, options);
  
            const order = await response.json();
            // console.log(order);
            return order;

        } catch (error) { 
            throw error;
        }
    };
}

module.exports = Page365;
