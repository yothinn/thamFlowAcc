const { cyberAccServer } = require("../thaminfo_credential.json");
const inquirer = require("inquirer");
const sql = require("mssql");


module.exports = async() => {

    // const allServerInfo = thamInfo_cred.cyberAccServer;

    try {
        console.log(cyberAccServer);

        const questions = [
            {
                type: "list",
                name: "server",
                message: "What server do you want to test connect ?",
                choices: function(answers) {
                    return Object.values(Object.keys(cyberAccServer));
                }
            },
        ];

        let answers = await inquirer.prompt(questions);
        console.log(answers);

        let server = cyberAccServer[answers.server];

        let config = {
            user: server.username,
            password: server.password,
            server: server.server,
            database: server.database,
            stream: false,
            options: {
                encrypt: false,
                instanceName: server.instance
            },
            // port: 1433,
        };

        console.log(config);

        const pool = new sql.ConnectionPool(config);

        pool.connect(err => {
            if (!err) {
                console.log("Success connection");
                pool.close();
            } else {
                console.log(err);
            }
        });
    } catch(error) {
        console.log(error);
    }
 
}