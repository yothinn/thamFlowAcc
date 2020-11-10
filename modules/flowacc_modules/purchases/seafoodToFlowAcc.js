const SeaFoodData = require("../../../libs/purchase/seafood/seafoodData");
const FlowAccount = require("../../../libs/flowacc/flowacc");

const SALESNAME = "Seafood";


class SeaFoodToFlowAcc {
    _flowAccCredentail = null;
    _contactName;
    _productFile = null;
    _productMap = null;


    constructor(contactName, flowAccCredentail, productFile) {
        this._flowAccCredentail = flowAccCredentail;
        this._contactName = contactName;
        this._productFile = productFile;
    }

    async init() {
        try {
            // authorize flow account
            this._flowAcc = new FlowAccount();
            await this._flowAcc.authorize(
                this._flowAccCredentail.clientId,
                this._flowAccCredentail.clientSecret,
                this._flowAccCredentail.grantType,
                this._flowAccCredentail.scope
            );

            // load product map
            this._productMap = new ProductMap();
            await this._productMap.readProduct(this._productFile.fileName, this._productFile.sheetName);

        } catch(error) {
            throw error;
        }
    }

    async toPurchases(fileName, sheetName, startRow, endRow) {
        try {
            let purchasesList = [];
            let purchases = null;

            let seaFoodData = new SeaFoodData();
            await seaFoodData.readTransaction(fileName, sheetName);

            // console.log(seaFoodData._trans);

            for (let i=startRow; i<=endRow; i++) {

                // Find new invoice when current is null or change supplier        
                if (!purchases || (seaFoodData.getSupplier(i) !== purchases.projectName) ||
                        (seaFoodData.getDate(i) !== purchases.publishedOn)) {
                    purchases = await purchasesList.find((bill) => {
                        return (bill.projectName === seaFoodData.getSupplier(i)) &&
                                (bill.publishedOn === seaFoodData.getDate(i));
                    });
                }

                // Can't find bill then create new
                if (!purchases) {
                    purchases = {
                        recordId: 0,
                        // contactCode: "",
                        // contactAddress: "",
                        // contactTaxId: "",
                        //contactBranch: "",
                        // contactPerson: "",
                        // contactEmail: "",
                        // contactNumber: "",
                        // contactZipCode: "",
                        contactName: this._contactName,
                        contactGroup: 1,
                        publishedOn: seaFoodData.getDate(i),
                        creditType: 1,
                        creditDays: 0,
                        dueDate: seaFoodData.getDate(i),
                        salesName: SALESNAME,
                        projectName: seaFoodData.getSupplier(i),
                        reference: "",
                        // isVatInclusive: false,
                        // useReceiptDeduction: false,
                        subTotal: 0,
                        discountPercentage: 0,
                        discountAmount: 0,
                        totalAfterDiscount: 0,
                        isVat: false,
                        vatAmount: 0,
                        grandTotal: 0,
                        // documentShowWithholdingTax: false,
                        // documentWithholdingTaxPercentage: 0,
                        // documentWithholdingTaxAmount: 0,
                        // documentDeductionType: 0,
                        // documentDeductionAmount: 0,
                        // showSignatureOrStamp: true,
                        remarks: "",
                        internalNotes: "",
                        documentStructureType: "SimpleDocument",
                        // discountType: 3,
                        // useInlineDiscount: true,
                        // useInlineVat: true,
                        // exemptAmount: 0,
                        // vatableAmount: 0,
                        items: [],
                        documentReference: "",
                    };
                    purchasesList.push(purchases);
                }

                let flowProduct = this._productMap.findProduct(seaFoodData.getProductName(i), "");

                // Can't find product map !! terminate script
                if (!flowProduct) {
                    throw `Can't flow account product map name : ${seaFoodData.getProductName(i)}`;
                }

                let total = seaFoodData.getWeight(i) * seaFoodData.getUnitPrice(i); 
                purchases.items.push({
                    type: flowProduct.flowProductType,
                    name: flowProduct.flowProductName,
                    description: seaFoodData.getQuantity(i),
                    quantity: seaFoodData.getWeight(i),
                    unitName: flowProduct.flowUnitName,
                    pricePerUnit: seaFoodData.getUnitPrice(i),
                    total: total,
                    // sellChartOfAccountCode: "string",
                    // buyChartOfAccountCode: "string"
                });

                // console.log(purchases.subTotal);
                purchases.subTotal = Math.round((purchases.subTotal + total) * 100 ) / 100;
                purchases.totalAfterDiscount = purchases.subTotal;
                purchases.grandTotal = purchases.subTotal;
            }

            return purchasesList;
        } catch(error) {
            throw error;
        }
    }

    async createPurchasesByIndex(fileName, sheetName, startRow, endRow) {
        try {
            let purchasesList = await this.toPurchases(fileName, sheetName, startRow, endRow);

            for (let purchases of purchasesList) {
                let res = await this._flowAcc.createPurchases(purchases);
                if (res.status) {
                    console.log(`create purchases success ${purchases.reference}`);
                } else {
                    throw `!! Can't create purchases ${purchases.reference}, error : ${res.message}`;
                }
            }

        } catch(error) {
            throw error;
        }
    }
}

module.exports = SeaFoodToFlowAcc;