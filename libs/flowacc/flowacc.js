const request = require("request");

// Request FlowAccount url
const FLOWACC_URL = {
    GETTOKEN: "https://openapi.flowaccount.com/v1/token",
    TAXINVOICE_INLINE: "https://openapi.flowaccount.com/v1/tax-invoices/inline",
    TAXINVOICE: "https://api-core.flowaccount.com/th/tax-invoices",
    TAXINVOICE_INLINE_WITHPAYMENT: "https://openapi.flowaccount.com/v1/tax-invoices/inline/with-payment",
    // PRODUCT: "https://openapi.flowaccount.com/v1/products",           // Not use this because can't input account chart
    PRODUCT: "https://api-core.flowaccount.com/th/products",
    PURCHASES_INLINE: "https://openapi.flowaccount.com/v1/purchases/inline",
    PURCHASES: "https://openapi.flowaccount.com/v1/purchases/inline",
    BANKACC : "https://openapi.flowaccount.com/v1/bank-accounts",
    RECEIPTS_INLINE_WITHPAYMENT: "https://openapi.flowaccount.com/v1/receipts/inline/with-payment",
}

class FlowAccount {
    _token;
    _tokenExpire;

    constructor() {
        this._token = null;
        this._tokenExpire = null;
    }

    /**
     * Authorize flowaccount and receive token
     * @param {string} clientID 
     * @param {string} clientSecret 
     * @param {string} grantType 
     * @param {string} scope 
     */
    authorize(clientID, clientSecret, grantType, scope) {
        try {
            let headers = {
                "Content-Type": "application/x-www-form-urlencoded",
            }

            let form = {
                "client_id": clientID,
                "client_secret": clientSecret,
                "grant_type": grantType,
                "scope": scope
            }
            // console.log(form);
            return new Promise((resolve, reject) => {
                request.post(
                    {
                        url: FLOWACC_URL.GETTOKEN,
                        headers: headers,
                        form: form,
                    },
                    (err, resp, body) => {
                        if (err)    reject(err);
                        
                        let b = JSON.parse(body);
                        if (b.error) reject(b.error);

                        this._token = `${b.token_type} ${b.access_token}`;
                        this._tokenExpire = b.expires_in;
                        // console.log(b);

                        resolve(this._token);         
                    }
                );
            });
        } catch(error) {
            throw error;
        }
    }

    /**
     * Check already authorization
     */
    isAuthorize() {
         return (this._token !== null);
    }

    /**
     * create tax invoice inline
     * @param {*} body 
     */
    createTaxInvoiceInline(body) {
        try {
            let headers = {
                "Content-Type": "application/json",
                "Authorization": this._token,
            }

            return new Promise((resolve, reject) => {
                request.post(
                {
                    url: FLOWACC_URL.TAXINVOICE_INLINE,
                    headers: headers,
                    body: JSON.stringify(body),
                },
                (err, resp, body) => {
                    if (err) reject(err);

                    body = body.replace(/\\n/g, "\\n")  
                                .replace(/\\'/g, "\\'")
                                .replace(/\\"/g, '\\"')
                                .replace(/\\&/g, "\\&")
                                .replace(/\\r/g, "\\r")
                                .replace(/\\t/g, "\\t")
                                .replace(/\\b/g, "\\b")
                                .replace(/\\f/g, "\\f");
                    // remove non-printable and other non-valid JSON chars
                    body = body.replace(/[\u0000-\u0019]+/g,""); 
                    // console.log(body);
                    // console.log(body.status)
                    // resolve(body);
                    let b = JSON.parse(body);
                    // Error if status = false
                    if (!b.status)  reject(`Can't create tax invoice inline : ${b.message}`);

                    resolve(b);
                }
                );
            });
        } catch(error) {
            throw error;
        }
    }

    /**
     * create tax invoice inline with payment
     * @param {*} body 
     */
    createTaxInvoiceInlineWithPayment(body) {
        try {
            let headers = {
                "Content-Type": "application/json",
                "Authorization": this._token,
            }

            return new Promise((resolve, reject) => {
                request.post(
                {
                    url: FLOWACC_URL.TAXINVOICE_INLINE_WITHPAYMENT,
                    headers: headers,
                    body: JSON.stringify(body),
                },
                (err, resp, body) => {
                    if (err) reject(err);

                    // console.log(body);
                    // resolve(body);
                    let b = JSON.parse(body);
                    // Error if status = false
                    if (!b.status)  reject(`Can't create tax invoice inline with payment : ${b.message}`);

                    resolve(b);
                }
                );
            });
        } catch(error) {
            throw error;
        }
    }

 
    /**
     * create flow account product
     * @param {*} body : flow account format
     */
    createProduct(body) {
        try {
            let headers = {
                "Content-Type": "application/json",
                "Authorization": this._token,
            }

            return new Promise((resolve, reject) => {
                request.post(
                {
                    url: FLOWACC_URL.PRODUCT,
                    headers: headers,
                    body: JSON.stringify(body),
                },
                (err, resp, body) => {
                    if (err) reject(err);

                    // console.log(body);
                    try {
                        let b = JSON.parse(body);
                        // Error if status = false
                        if (!b.status)  reject(`Can't create product : ${b.message}`);

                        resolve(b);
                    } catch (error) {
                        reject(error);
                    }
                }
                );
            });
        } catch(error) {
            throw error;
        }
    }

    /**
     * get product by product id
     * @param {*} id 
     */
    getProductById(id) {
        try {
            let headers = {
                "Content-Type": "application/json",
                "Authorization": this._token,
            }

            return new Promise((resolve, reject) => {
                request.get(
                {
                    url: `${FLOWACC_URL.PRODUCT}/${id}`,
                    headers: headers,
                },
                (err, resp, body) => {
                    if (err) reject(err);

                    // console.log(body);
                    let b = JSON.parse(body);
                    // Error if status = false
                    if (!b.status)  reject(`Can't get product : ${b.message}`);

                    resolve(b);
                }
                );
            });
        } catch(error) {
            throw error;
        }
    }

    /**
     * get product by product name
     * @param {string} name : name can exact or part of product name 
     */
    getProductByName(name) {
        try {
            let headers = {
                "Content-Type": "application/json",
                "Authorization": this._token,
            }

            let filter = [{
                columnName: 'name',
                columnValue: name,
                columnPredicateOperator:'And'
            }];

            let url = `${FLOWACC_URL.PRODUCT}?currentPage=1&filter=${JSON.stringify(filter)}`;

            // console.log(url);
            return new Promise((resolve, reject) => {
                request.get(
                {
                    // MARK : I don't know why encodeURI ??
                    url: encodeURI(url),
                    headers: headers,
                },
                (err, resp, body) => {
                    if (err) reject(err);

                    // console.log(body);
                    // resolve(body);
                    let b = JSON.parse(body);
                    // Error if status = false
                    if (!b.status)  reject(`Can't get product : ${b.message}`);

                    resolve(b);
                    
                }
                );
            });
        } catch(error) {
            throw error;
        }
    }

    /**
     * get product by product code
     * @param {*} code 
     */
    getProductByCode(code) {
        try {
            let headers = {
                "Content-Type": "application/json",
                "Authorization": this._token,
            }

            let filter = [{
                columnName: 'productCode',
                columnValue: code,
                columnPredicateOperator:'And'
            }];

            let url = `${FLOWACC_URL.PRODUCT}?currentPage=1&filter=${JSON.stringify(filter)}`;

            // console.log(url);
            return new Promise((resolve, reject) => {
                request.get(
                {
                    // MARK : I don't know why encodeURI ??
                    url: encodeURI(url),
                    headers: headers,
                },
                (err, resp, body) => {
                    if (err) reject(err);

                    // console.log(body);
                    // resolve(body);
                    let b = JSON.parse(body);
                    // Error if status = false
                    if (!b.status)  reject(`Can't get product : ${b.message}`);

                    resolve(b);
                }
                );
            });
        } catch(error) {
            throw error;
        }
    }

    /**
     * Ge all product
     * @returns product list
     */
    async getAllProduct() {
        try {
            let pageSize = 100;
            let productList = [];
            // First : Get currentPage 1 
            let result = await this.getProductByPage(1, pageSize);
            let totalProduct;
            let totalPage;
            
            if (result.status) {
                // Calculate page
                totalProduct = result.data.total;
                totalPage = Math.ceil(totalProduct / pageSize);

                productList = productList.concat(result.data.list);

                let promiseList = [];
                for (let i =2; i<= totalPage; i++) {
                    let promise = this.getProductByPage(i, pageSize);
                    promiseList.push(promise);
                }

                let res = await Promise.all(promiseList);
                await res.map((value) => {
                    // console.log(value);
                    if (value.status) {
                        productList = productList.concat(value.data.list);
                    }
                });

                return productList;
            } else {
                throw result.message;
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * get product per page
     * @param {*} page 
     * @param {*} size 
     */
    getProductByPage(page = 1, size = 20) {
        try {
            let headers = {
                "Content-Type": "application/json",
                "Authorization": this._token,
            }

            let url = `${FLOWACC_URL.PRODUCT}?currentPage=${page}&pageSize=${size}`;

            // console.log(url);
            return new Promise((resolve, reject) => {
                request.get(
                {
                    url: url,
                    headers: headers,
                },
                (err, resp, body) => {
                    if (err) reject(err);

                    // console.log(body);
                    // resolve(body);
                    let b = JSON.parse(body);
                    // Error if status = false
                    if (!b.status)  reject(`Can't get product : ${b.message}`);

                    resolve(b);
                }
                );
            });
        } catch(error) {
            throw error;
        }
    }

    /**
     * Delete product by id
     * @param {*} id 
     */
    deleteProductById(id) {
        try {
            let headers = {
                "Content-Type": "application/json",
                "Authorization": this._token,
            }

            return new Promise((resolve, reject) => {
                request.delete(
                {
                    url: `${FLOWACC_URL.PRODUCT}/${id}`,
                    headers: headers,
                },
                (err, resp, body) => {
                    if (err) reject(err);

                    // console.log(body);
                    let b = JSON.parse(body);
                    // Error if status = false
                    if (!b.status)  reject(`Can't delete product : ${b.message}`);

                    resolve(b);
                }
                );
            });
        } catch(error) {
            throw error;
        }
    }

    /**
     * create purchasese inline
     * @param {*} body 
     */
    createPurchasesInline(body) {
        try {
            let headers = {
                "Content-Type": "application/json",
                "Authorization": this._token,
            }

            return new Promise((resolve, reject) => {
                request.post(
                {
                    url: FLOWACC_URL.PURCHASES_INLINE,
                    headers: headers,
                    body: JSON.stringify(body),
                },
                (err, resp, body) => {
                    if (err) reject(err);

                    // console.log(body);
                    // resolve(body);
                    let b = JSON.parse(body);
                    // Error if status = false
                    if (!b.status)  reject(`Can't create purchases inline : ${b.message}`);

                    resolve(b);
                }
                );
            });
        } catch(error) {
            throw error;
        }
    }

       /**
     * create purchasese
     * @param {*} body 
     */
    createPurchases(body) {
        try {
            let headers = {
                "Content-Type": "application/json",
                "Authorization": this._token,
            }

            return new Promise((resolve, reject) => {
                request.post(
                {
                    url: FLOWACC_URL.PURCHASES,
                    headers: headers,
                    body: JSON.stringify(body),
                },
                (err, resp, body) => {
                    if (err) reject(err);

                    // console.log(body);
                    // resolve(body);
                    let b = JSON.parse(body);
                    // Error if status = false
                    if (!b.status)  reject(`Can't create purchases inline : ${b.message}`);

                    resolve(b);
                }
                );
            });
        } catch(error) {
            throw error;
        }
    }

    getAllBankAccount() {
        try {
            let headers = {
                "Content-Type": "application/json",
                "Authorization": this._token,
            }

            return new Promise((resolve, reject) => {
                request.get(
                {
                    url: FLOWACC_URL.BANKACC,
                    headers: headers,
                },
                (err, resp, body) => {
                    if (err) reject(err);

                    // console.log(body);
                    // resolve(body);
                    let b = JSON.parse(body);
                    // Error if status = false
                    if (!b.status)  reject(`Can't get bank account : ${b.message}`);

                    resolve(b);
                }
                );
            });
        } catch(error) {
            throw error;
        }
    }
}

module.exports = FlowAccount;