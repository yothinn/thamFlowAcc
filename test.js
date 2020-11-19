const glob = require("glob");

let path = "./image/*/AR0001-10-63*.jpg";

let allFile = glob.sync(path);

console.log(allFile);