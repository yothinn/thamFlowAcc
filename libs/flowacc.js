const request = require("request");

// Request FlowAccount url
const FLOWACC_URL = {
    GETTOKEN: "https://openapi.flowaccount.com/v1/token",
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
    }

    /**
     * Check already authorization
     */
    isAuthorize() {
         return (this._token !== null);
    }
}

module.exports = FlowAccount;