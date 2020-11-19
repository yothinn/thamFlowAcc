/**
 * CyberAccDatabase class : for connect to cyberacc mssql , query and insert data
 * Company: THAMTURAKITE SOCIAL ENTERPRISE
 * Author: Yothin Setthachatanan
 * Created: 2 Nov 2020
 * Updated: 12 Nov 2020
 */

const sql = require("mssql");

class CyberAccDatabase {
    _pool;
    _bConnected = false;

    constructor() {

    }

    async connect(username, password, server, database, instance) {
        let config = {
            user: username,
            password: password,
            server: server,
            database: database,
            stream: false,
            options: {
                encrypt: false,
                instanceName: instance
            },
            // port: 1433,
        };

        try {

            this._pool = new sql.ConnectionPool(config);
            this._bConnected = true;
            return this._pool.connect(); 
        } catch(error) {
            this._bConnected = false;
            throw error;
        }
    }

    isConnect() {
        return this._bConnected;
    }

    /**
     * Find account id of customer from firstname and last name
     * @param {*} firstName 
     * @param {*} lastName 
     * @returns account id
     */
    async getAccountIDByCustomerName(firstName, lastName) {
        try {
            let request = this._pool.request();
            request.input("firstName", sql.NVarChar, firstName);
            request.input("lastName", sql.NVarChar, lastName);
            let result = await request.query(
                "SELECT accountID as result from accountM                                   \
                where accountName like (N'%' + @firstName + '%') and                        \
                accountName like (N'%' + @lastName + '%')"
            );
            // console.log(result);
            // return null if can't find
            return result.recordset[0].result;
        } catch(error) {
            throw error;
        }
    }

    async getAccountName(code) {
        try {
            let request = this._pool.request();
            request.input("code", sql.Int, code);
            let result = await request.query(
                "SELECT AccountName as result from accountM                                   \
                where accountID=@code"
            );
            // console.log(result);
            // return null if can't find
            return result.recordset[0].result;
        } catch(error) {
            throw error;
        }    
    }

    async getGLTableByDate(dateStr) {
        try {
            let request = this._pool.request();
            request.input("dateStr", sql.NVarChar, dateStr);
            let result = await request.query(
                " SELECT ta.addDate, ta.glmainid, ta.accountcode, ta.decription,    \
		                ta.debit, ta.credit, ac.AccountName                         \
                    FROM dbo.GLTableAll ta                                          \
                    INNER JOIN dbo.AccountM ac ON ta.accountcode = ac.AccountID     \
                    where convert(date, addDate)=@dateStr"
            );
            // console.log(result.recordset);
            return result.recordset;
        } catch(error) {
            throw error;
        }
    }

    async getGLTableByMainId(glMainId) {
        try {
            let request = this._pool.request();
            request.input("glMainId", sql.NVarChar, glMainId);
            let result = await request.query(
                " SELECT ta.addDate, ta.glmainid, ta.accountcode, ta.decription,    \
		                ta.debit, ta.credit, ac.AccountName                         \
                    FROM dbo.GLTableAll ta                                          \
                    INNER JOIN dbo.AccountM ac ON ta.accountcode = ac.AccountID     \
                    where GLMainId=@glMainId"
            );
            // console.log(result.recordset);
            return result.recordset;
        } catch(error) {
            throw error;
        }
    }

    /**
     * ให้ค่าเลขที่เอกสารใหม่
     * @param {*} journaltype : use JOURNALTYPE_ABBR
     * @param {*} month 
     * @param {*} year ในรูปแบบ พ.ศ.
     * @returns new GLMainId that journalType
     */
    async getNewGLMainId(journalType, month, year) {
        try {
            let request = this._pool.request();

            // check from GLMain table
            request.input("journaltype", sql.NVarChar, journalType);
            request.input("mon", sql.NVarChar, month.padStart(2, "0"));
            request.input("year", sql.NVarChar, year);
            let result = await request.query(
                "SELECT max(num) as result from                             \
                (                                                           \
                    select GLMainId, SubString(GLMainId, 3, 4) as num       \
                    from GLMain                                             \
                    where SubString(GLMainId, 1, 2)=@journalType and        \
                            SubString(GLMainId, 8, 2)=@mon and              \
                            right(addDate, 4)=@year                         \
                ) gl"
            );

            // console.log(result);

            // running new document , if no is null then no is 1;
            let no = result.recordset[0].result;
            no = no ? parseInt(no) + 1 : 1;
            let noStr = no.toString().padStart(4, "0");
            let monStr = month.padStart(2, "0");
            let yearStr = year.slice(year.length - 2)

            // let no = parseInt(result.recordset[0].result) + 1;
            
            return `${journalType}${noStr}/${monStr}-${yearStr}`;
        } catch(error) {
            throw error;
        }
    }

    async getNewIdGLCredit() {
        try {
            let request = this._pool.request();

            let result = await request.query("SELECT max(id) as result from GLCredit");
            // console.log(result);

            let id = result.recordset[0].result;
            id = id ? parseInt(id) + 1 : null;
            return id;
        } catch (error) {
            throw error;
        }
    }    

    async getNewIdGLDebit() {
        try {
            let request = this._pool.request();

            let result = await request.query("SELECT max(id) as result from GLDebit");
            // console.log(result);

            let id = result.recordset[0].result;
            id = id ? parseInt(id) + 1 : null;
            return id;
        } catch (error) {
            throw error;
        }

    }

    /**
     * Insert data to GLMain
     * @param {*} docNo 
     * @param {*} dateStr Format: dd/mm/YYYY (พ.ศ.)
     * @param {*} desp 
     */
    async insertToGLMain(docNo, dateStr, desp="") {
        try {
            let request = this._pool.request();

            request.input("docNo", sql.NVarChar, docNo);
            request.input("dateStr", sql.NVarChar, dateStr);
            request.input("desp", sql.NVarChar, desp);
            let result = await request.query("INSERT INTO GLMain values (@docNo, @dateStr, @desp)");

            // console.log(result);
        } catch(error) {
            throw error;
        }
    }

    /**
     * insert data to GLCredit table
     * @param {string} glMainId 
     * @param {int} id 
     * @param {int} accountCode 
     * @param {string} desp 
     * @param {float} amount 
     */
    async insertToGLCredit(glMainId, id, accountCode, desp, amount) {
        try {
            let request = this._pool.request();

            amount = Math.round(amount * 100) / 100;

            request.input("glMainId", sql.NVarChar, glMainId);
            request.input("id", sql.Int, id);
            request.input("accountCode", sql.Int, accountCode);
            request.input("desp", sql.NVarChar, desp);
            request.input("amount", sql.Float, amount);
            let result = await request.query(
                " INSERT INTO GLCredit                                              \
                    Values (@glMainId, @id, @accountCode, @desp, @amount, '')"
            )
            // console.log(result);

            return result;
        } catch(error) {
            throw error;
        }
    }

        /**
     * insert data to GLDebit table
     * @param {string} glMainId 
     * @param {int} id 
     * @param {int} accountCode 
     * @param {string} desp 
     * @param {float} amount 
     */
    async insertToGLDebit(glMainId, id, accountCode, desp, amount) {
        try {
            let request = this._pool.request();

            amount = Math.round(amount * 100) / 100;

            request.input("glMainId", sql.NVarChar, glMainId);
            request.input("id", sql.Int, id);
            request.input("accountCode", sql.Int, accountCode);
            request.input("desp", sql.NVarChar, desp);
            request.input("amount", sql.Float, amount);
            let result = await request.query(
                " INSERT INTO GLDebit                                              \
                    Values (@glMainId, @id, @accountCode, @desp, @amount, '')"
            )
            // console.log(result);

            return result;
        } catch(error) {
            throw error;
        }
    }



    async close() {
        this._pool.close();
        this._bConnected = false;
    }
};

module.exports = CyberAccDatabase;