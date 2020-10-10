const puppeteer = require('puppeteer');
const fetch = require("node-fetch");
const request = require("request");
const foodStoryUrl = require("./foodstoryUrl");
const foodStoryData = require("./foodstoryData");

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
    
            // Get all cookies
            let currentCookies = await page._client.send('Network.getAllCookies');
            this._cookies = currentCookies.cookies;

            // await page.screenshot({ path: 'example.png'});

            // console.log(this._cookies);

            // concat all cookie value to session
            this._session = await this._cookies.reduce((init, item) => {
                if (init === "") {
                    return `${item.name}=${item.value}`;
                } else {
                    return `${init}; ${item.name}=${item.value}`;
                }
            }, this._session);

            // this._session = "_ga=GA1.1.2000713763.1600232445; selected_branch_cookie=eyJpdiI6IkxPNE5DNTZnczg5Nys1MDZVbmY1QVE9PSIsInZhbHVlIjoiNGJrNzlzdm9Sa0tnSFlxQnZUTWZHVDQxUnBkeFpadk9EZ1hTK25qd2hlVUNkRVU4MVwvdTRTZkFuQ0lFcVVBK3giLCJtYWMiOiJjNzZhMDRkYTUwYTI5ZDViZjk1MWExOWM1ODhhYWY5MDExZjZiMDQ3NDYyYWI3MDU4Nzg4Yzk0ZjMyNWNmZDIxIn0%3D; laravel_session=h3eY1KtU1svnXJWuAgyGp25hSarhIzNIflLkhlBj; _ga_WFKCKS8DSL=GS1.1.1602244117.8.1.1602255909.0; AWSALB=A7lDhP3ziLEa63yZWtb8YlB11FpJRto4+L7697PXpRgYln4XmbQ6Cm7UjSXsJ9lpbyAMn0ewX67WoDsWPRzTZBNSnxHTuGWawn+S5hqwAFU6yg1mzxAhBChYVuD8; AWSALBCORS=A7lDhP3ziLEa63yZWtb8YlB11FpJRto4+L7697PXpRgYln4XmbQ6Cm7UjSXsJ9lpbyAMn0ewX67WoDsWPRzTZBNSnxHTuGWawn+S5hqwAFU6yg1mzxAhBChYVuD8";

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

    async sendSetDate(startDate, endDate) {
        try {
            let headers = {
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": this.session
            };

            let form = {
                "start_date": startDate,
                "end_date": endDate
            };

            console.log(form);
            console.log(this.session);
            return new Promise((resolve, reject) => {
                request.post(
                    {
                        url: foodStoryUrl.getSetDateUrl(),
                        headers: headers,
                        form: form,
                    },
                    (err, resp, body) => {
                        if (err)    reject(err);
                        console.log(resp.statusCode);
                        // console.log(resp);
                        resolve(body);         
                    }
                );
            });
        } catch(error) {
            throw error;
        }
    }

    async sendSetBranch(branchId) {
        try {
            let headers = {
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": this.session,
            }

            let form = foodStoryData.FOODSTORY_BRANCHFORM;
            form.branch_set = [branchId];
            // form.branch_set = [6969, 7171];

            // console.log(form);
            return new Promise((resolve, reject) => {
                request.post(
                    {
                        url: foodStoryUrl.getSetBranchUrl(),
                        headers: headers,
                        form: form,
                    },
                    (err, resp, body) => {
                        if (err)    reject(err);
                        // console.log(resp);
                        resolve(body);         
                    }
                );
            });
        } catch(error) {
            throw error;
        }
    }

    async getBillByDate(branchId, startDate, endDate) {
        // TODO : For loop all bill
        try {
            let headers = {
                "Content-Type": "application/json",
                "Cookie": this.session,
            }

            return new Promise((resolve, reject) => {
                request.get(
                    {
                        url: foodStoryUrl.getSaleByBillSuccessUrl(1, 0),
                        headers: headers,
                    },
                    (err, resp, body) => {
                        if (err)    reject(err);
                         console.log(body);
                        resolve(body);         
                    }
                );
            });
        } catch(error) {
            throw error;
        }

    }

    async getBillDetailByPayment(paymentId) {
        try {
            let headers = {
                "Content-Type": "application/json",
                "Cookie": this.session,
            }

            return new Promise((resolve, reject) => {
                request.get(
                    {
                        url: foodStoryUrl.getBillDetailByPaymentUrl(paymentId),
                        headers: headers,
                    },
                    (err, resp, body) => {
                        if (err)    reject(err);
                        
                        resolve(body);         
                    }
                );
            });
        } catch(error) {
            throw error;
        }
    }
}

module.exports = FoodStory;