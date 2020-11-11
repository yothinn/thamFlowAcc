/**
 * // remove non-printable, space, \n, \t
 * @param {*} str 
 */
exports.cleanString = (str) => {
    if (str) {
        
        newStr = str.replace(/[\u0000-\u0019]+/g,"")
                    .replace(/(\u200b|\r\n|\n|\t)/g, "");
        return newStr.trim();
    }
    return str;
}