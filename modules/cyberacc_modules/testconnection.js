const { cyberAccServer } = require("../thaminfo_credential.json");
const inquirer = require("inquirer");
const CyberaccDatabase = require("../../libs/cyberacc/cyberaccDatabase");

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

          const db = new CyberaccDatabase();

        db.connect(server.username, 
            server.password, 
            server.server, 
            server.database, 
            server.instance).then(value => {
            
            console.log(value);
            console.log("Success connection");
            db.close();
        })
        .catch(error => {
            console.log(error);
            console.log("!!!! Error connection");
            db.close();
        });

    } catch(error) {
        console.log(error);
    }
 
}