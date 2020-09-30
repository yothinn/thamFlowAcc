const SeaFoodData = require("./seafoodData");
const FlowAccount = require("../flowacc");

const SALESNAME = "Seafood";


class PurchasesSeaFoodToFlowAcc {
    _flowAccCredentail = null;
    _contactName;

    constructor(contactName, flowAccCredentail) {
        this._flowAccCredentail = flowAccCredentail;
        this._contactName = contactName;
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

                // Find new invoice when current is null or change no        
                if (!purchases || seaFoodData.getBillNo(i) !== purchases.reference) {
                    purchases = await purchasesList.find((bill) => {
                        return bill.reference === seaFoodData.getBillNo(i);
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
                        // projectName: "",
                        reference: seaFoodData.getBillNo(i),
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

                let total = seaFoodData.getWeight(i) * seaFoodData.getUnitPrice(i); 
                purchases.items.push({
                    type: seaFoodData.getProductType(i),
                    name: seaFoodData.getProductName(i),
                    description: seaFoodData.getProcessCode(i),
                    quantity: seaFoodData.getWeight(i),
                    unitName: seaFoodData.getUnitName(i),
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

    async createPurchases(fileName, sheetName, startRow, endRow) {
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

module.exports = PurchasesSeaFoodToFlowAcc;