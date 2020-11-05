const sql = require("mssql");

class CyberAccDatabase {
    _pool;

    constructor() {

    }

    async connect(username, password, server, database) {
        let config = {
            user: username,
            password: password,
            server: server,
            database: database,
            stream: false,
            options: {
                encrypt: false,
                instanceName: "SQLEXPRESS"
            },
            // port: 1433,
        };

        this._pool = new sql.ConnectionPool(config);

        return this._pool.connect(); 
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
            let result = await request.query(`select dbo.GetAccountIDByCustomerName('${firstName}', '${lastName}') as result`);
            // console.log(result);
            // return null if can't find
            return result.recordset[0].result;
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

            console.log(result);
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

            request.input("glMainId", sql.NVarChar, glMainId);
            request.input("id", sql.Int, id);
            request.input("accountCode", sql.Int, accountCode);
            request.input("desp", sql.NVarChar, desp);
            request.input("amount", sql.Float, amount);
            let result = await request.query(
                " INSERT INTO GLCredit                                              \
                    Values (@glMainId, @id, @accountCode, @desp, @amount, '')       \
                "
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

            request.input("glMainId", sql.NVarChar, glMainId);
            request.input("id", sql.Int, id);
            request.input("accountCode", sql.Int, accountCode);
            request.input("desp", sql.NVarChar, desp);
            request.input("amount", sql.Float, amount);
            let result = await request.query(
                " INSERT INTO GLDebit                                              \
                    Values (@glMainId, @id, @accountCode, @desp, @amount, '')      \
                "
            )
            // console.log(result);

            return result;
        } catch(error) {
            throw error;
        }
    }



    async close() {
        this._pool.close();
    }
};

module.exports = CyberAccDatabase;