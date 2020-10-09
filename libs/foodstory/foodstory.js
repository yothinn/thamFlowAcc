const puppeteer = require('puppeteer');
const fetch = require("node-fetch");
const foodStoryUrl = require("./foodstoryUrl");

class FoodStory {
    _session = "";
    _cookies;

    constructor() {
    }

    async connect(username , password) {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto('https://owner.foodstory.co', { waitUntil: 'networkidle2' });

            
            // console.log(`${username} ${password}`);
            await page.type('[name="email"]', username);
            await page.type('[name="password"]', password);
        
            const btnLogin = await page.$$('#btn_submit');
            await btnLogin[0].click();

            await page.waitForNavigation({ waitUntil: 'networkidle0' });
            await page.waitFor(3000);

            // await page.screenshot({ path: 'example.png'});   
                
            // Get all cookies
            let currentCookies = await page._client.send('Network.getAllCookies');
            this._cookies = currentCookies.cookies;

            // console.log(this._cookies);

            // concat all cookie value to session
            this._session = await this._cookies.reduce((init, item) => {
                if (init === "") {
                    return `${item.name}=${item.value}`;
                } else {
                    return `${init}; ${item.name}=${item.value}`;
                }
            }, this._session);

            // console.log(this._session);

            await browser.close();
        } catch (error) {
            throw error;
        }
    }

    get session() {
        return this._session;
    }

     /**
     * check : has session for request 
     * @returns boolean : TRUE has session
     */
    hasSession() {
        return this._session === "" ? false : true;
    }

    /**
     * Get menu data in each branch
     * @param {*} branchId 
     * @param {*} pageNo 
     * @param {*} pageSize : use 12, 24, 48
     * @param {*} active : 1 is menu active , 0 is menu not active
     */
    async getMenuPerPage(branchId, pageNo, pageSize, active) {
        let options = {
            method: "GET",
            // headers: {  
            //     cookie: this.session,
            // }
        };

        // console.log(this.hasSession());
        // if (!this.hasSession())  throw 'it has not session for request';

        let response;
        let result;

        try {
            response = await fetch(
                foodStoryUrl.getMenuUrl(branchId, pageNo, pageSize, active),
                options
            );
            result = await response.json();
            return result;

        } catch (error) {
            throw error;
        }
    }
}

module.exports = FoodStory;