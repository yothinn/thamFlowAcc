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
        // this._session = "_page365_session=VWgrbmllT0d6Uy9QUWU3MWVLc0JEcnBTb0Q4ODJrMzhUYm5uK1VobzlqSFhuWUtOc1VjeGRFZlpXbTRudDREeVJ0ajNiM0ZBR0IyZmNnYXo1Q3JVb1RSUmJ5UFA5bUJmTFF4VXZVRjdweGZjUWpaMHFaekVJK09ZcW5wWDIzckJxblZPcDVzT2s2R25mV2ZjOTlvdVNxd1EwUDVldE5pRVlxWFRLL2p6b0tEaXczM0l1SVJwbWpldFRRdjNLdlhSdGx6NDZxQzZwcGE0VS91TGp0R2lmc1Ewd2RXaXM3VkxEZ3NVWTVLR2NSVT0tLTZScVpkR2YxanNWcXhrZ2VkUE1pUnc9PQ%3D%3D--1624f718f4df9b74720d2594d493b3ccbd2f1b72";
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
        // await page.goto('https://www.facebook.com/login.php?skip_api_login=1&api_key=237031236431724&kid_directed_site=0&app_id=237031236431724&signed_next=1&next=https%3A%2F%2Fwww.facebook.com%2Fv2.6%2Fdialog%2Foauth%3Fclient_id%3D237031236431724%26redirect_uri%3Dhttps%253A%252F%252Fpage365.net%252Fauth%252Ffacebook%252Fcallback%26response_type%3Dcode%26scope%3Demail%26state%3D6c4a8b866477e6f91824de3da06df317dfd1980c6627c506%26ret%3Dlogin%26fbapp_pres%3D0%26logger_id%3Df3163025-335f-4e3b-897e-19a86abd2f13%26shared_id%3DTODO_SHARED_ID%26tp%3Dunspecified&cancel_url=https%3A%2F%2Fpage365.net%2Fauth%2Ffacebook%2Fcallback%3Ferror%3Daccess_denied%26error_code%3D200%26error_description%3DPermissions%2Berror%26error_reason%3Duser_denied%26state%3D6c4a8b866477e6f91824de3da06df317dfd1980c6627c506%23_%3D_&display=page&locale=th_TH&pl_dbl=0', { waitUntil: 'networkidle2' });
    
        await page.type('[name="email"]', username);
        await page.type('[name="pass"]', password);

        const btnLogin = await page.$$('#loginbutton');
        await btnLogin[0].click();

        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await page.waitFor(4000);

        // await page.screenshot({ path: 'example.png'});

        //await page.click("#platformDialogForm > div._5lnf.uiOverlayFooter._5a8u > table > tbody > tr > td._51m-.prs.uiOverlayFooterMessage > table > tbody > tr > td._51m-.uiOverlayFooterButtons._51mw > button._42ft._4jy0.layerConfirm._51_n.autofocus._4jy5._4jy1.selected._51sy");
        // Select thamturakit shop
        await page.click("div.box > ul.account > li.page-list");
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        //await page.screenshot({ path: 'example.png'});
    
        await page.waitFor(4000);
    
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

                // console.log(result);
                // if it has filed status, that error
                if (result.status) {
                    throw `PAGE365 Error: ${result.status}`;
                }

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
