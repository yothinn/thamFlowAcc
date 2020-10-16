const XLSX = require('xlsx');

/**
 * Convert product from ocha,page365,loyverse to flowaccount
 * by read in xlsx file
 * Format column:
 * productName :  product name from ocha, page365, loyverse
 * productOption: sub product 
 * flowProductCode: flow account product code
 * flowProductName: flow account product name
 * flowProductType: flow account product type
 *      1 : Service
 *      3 : non inventory
 *      5 : inventory
 * vatRate : product vat rate
 *      7 : vat 7%
 *      0 : vat 0%
 *      -1 : except vat (ยกเว้น)
 */

class ProductMap {
    _fileName;
    _sheetName;
    _product;
    _workbook;
    _worksheet;
    
    constructor() {
        this._fileName = "";
        this._sheetName = "";
        this._product = null;
        this._workbook = null;
        this._worksheet = null;
    }

    /**
     * read file xlsx product in sheetname
     * @param {*} fileName 
     * @param {*} sheetName 
     */
    readProduct(fileName, sheetName) {
        this._fileName = fileName;
        this._sheetName = sheetName;

        try {
            this._workbook = XLSX.readFile(fileName);
            this._worksheet = this._workbook.Sheets[sheetName];
            this._product = XLSX.utils.sheet_to_json(this._worksheet);

        } catch(error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Find product name and option from ocha, page365, loyverse
     * @param {} name : product name from ocha, page365, loyverse
     * @param {*} option : product option name 
     * @returns product mapping data of flow account
     */
    findProduct(name, option = "") {
        if (!this._product)  return "";

        return this._product.find((value) => {
            value.productOption = value.productOption || "";
            value.productOption = value.productOption.trim();
            value.productName = value.productName.trim();

            // if (value.productName === name.trim()) {
            //     console.log(value.productName)
            // }
            return (value.productName === name.trim()) && (value.productOption === option.trim());
        });
    }

}

module.exports = ProductMap