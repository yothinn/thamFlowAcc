const fs = require("fs");
const canvas = require("canvas");


(async() => {
    try {
        const width = 595;
        const height = 842;
        const cv = canvas.createCanvas(width, height);
        const ctx = cv.getContext("2d");

        canvas.registerFont("C:\\windows\\Fonts\\browalia.ttc", { family: "BrowalliaUPC"});

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#000";
        ctx.font = "18px BrowalliaUPC";
        let a = "ทดสอบตัวอักษร 123456";
        ctx.fillText(a, 200, 200);

        // ctx.font = "16px bold Angsana";
        // ctx.fillText("ทดสอบตัวอักษรภาษาไทย123456", 200, 300);

        const buffer = cv.toBuffer("image/jpeg");
        fs.writeFileSync("invtest.jpg", buffer);

    } catch(error) {
        console.log(error);
    }
})();