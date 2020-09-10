const ProductMap = require("../productmap");

const SALESNAME = "page365";
const PRODUCTNAME_DELIVERY = "ค่าขนส่ง";

/**
 * convert data from Page365 to flowaccount
 */
class Page365ToFlowAcc {
    _productMap = null;

    constructor() {

    }

    
    init(productMapFile, productMapSheet) {
        try {
            this._productMap = new ProductMap();
            this._productMap.readProduct(productMapFile, productMapSheet);
        } catch(error) {
            throw error;
        }
    }

    /**
     * convert page365 order detail data to tax invoice inline of flowaccount data
     * @param {string} contactName
     * @param {json} orderDetail : page365 format 
     * @returns flowaccount data
     */
    toTaxInvoiceInline(orderDetail) {
        if (!this._productMap) {
            throw "You must first initial before call this";
        }

        let billDate = this.p2fDate(orderDetail.created_at);
        let shipCost = orderDetail.shipping_cost ? orderDetail.shipping_cost : 0;
        // Subtotal ของ Flowaccount ต้องรวม รายการสินค้าทั้งหมด + ค่าขนส่ง  ของ page365
        let subTotal = orderDetail.subtotal + shipCost;
        // orderDetail.discount ตอนใส่ 0 จะส่งเป็น null มาบ้างหรือ 0 บ้าง
        let discount = orderDetail.discount ? orderDetail.discount : 0;      

        let inv = {
            recordId: 0,
            // -- Not use ---
            // contactCode: "",
            // contactTaxId: "",
            // contactPerson: "",
            // contactZipCode: "",
            //contactBranch: "สำนักงาน",
            contactName: orderDetail.customer_name,
            contactAddress: orderDetail.customer_address,
            contactEmail: orderDetail.email,
            contactNumber: orderDetail.customer_phone,
            contactGroup: 1,                                            // 1 = บุคคลธรรมดา
            publishedOn: billDate,
            creditType: 1,                                              // 1 = เครดิต(วัน)
            creditDays: 0,                                              // จำนวนวันเครดิต
            dueDate: billDate,
            salesName: SALESNAME,                                       // Fix from page365
            // projectName:,
            reference: orderDetail.no,                                  // page365 bill no.
            isVatInclusive: true,
            useReceiptDeduction: true,            
            subTotal: subTotal, 
            // discountPercentage: ,
            discountAmount: discount,
            totalAfterDiscount: orderDetail.total,
            isVat: true,                     
            vatAmount: 0,                 
            grandTotal: orderDetail.total,

            remarks: orderDetail.note,
            internalNotes: "",
            documentStructureType: "InlineDocument",
            discountType: 3,
            useInlineDiscount: true,
            useInlineVat: true,
            exemptAmount: 0,               
            vatableAmount: 0,              
            items: [],

            // -- Not use --
            // documentShowWithholdingTax:,
            // documentWithholdingTaxPercentage:,
            // documentWithholdingTaxAmount:,
            // documentDeductionType:,
            // documentDeductionAmount:,
            // showSignatureOrStamp:,
            // documentReference:,

        };

        let vatAmount = 0.00;
        let exemptAmount = 0;
        let vatableAmount = 0;
        let flowProduct;
        for (let item of orderDetail.items) {
            // Find product map to flow account product
            flowProduct = this._productMap.findProduct(item.name, item.variant.selected);

            if (!flowProduct) {
                throw `can't find product map : ${item.name}, option: ${item.variant.selected}`;
            }

            // console.log(flowProduct);
            // รวมยอดขายที่คำนวณภาษี และ ที่ไม่รวมภาษี
            let total = item.quantity * item.price;
            if (flowProduct.vatRate === 7) {
                vatableAmount += total;
                // (price * 7)/107 = ถอด vat 7%
                vatAmount += ((total * flowProduct.vatRate ) / (100 + flowProduct.vatRate)).toFixed(2);
            } else {
                exemptAmount += total;
            }

            inv.items.push({
                type: flowProduct.flowProductType,
                name: flowProduct.flowProductName,
                description: item.note,
                quantity: item.quantity,
                unitName: flowProduct.flowUnitName,
                pricePerUnit: item.price,
                total: total,
                discountAmount: 0,
                vatRate: flowProduct.vatRate,
            });
        }

        // push shipping cost
        if (orderDetail.shipping_cost !== 0) {
            flowProduct = this._productMap.findProduct(PRODUCTNAME_DELIVERY);

            if (!flowProduct) {
                throw `Can't find product : ${PRODUCTNAME_DELIVERY}`;
            }

            exemptAmount += orderDetail.shipping_cost;

            inv.items.push({
                type: flowProduct.type,
                name: flowProduct.flowProductName,
                description: "",
                quantity: 1,
                unitName: flowProduct.flowUnitName,
                pricePerUnit: orderDetail.shipping_cost,
                total: orderDetail.shipping_cost,
                discountAmount: 0,
                vatRate: flowProduct.vatRate,
            });
        }
    
        inv.vatAmount = vatAmount.toFixed(2);
        inv.exemptAmount = exemptAmount;
        inv.vatableAmount = vatableAmount;

        return inv;
    }

    /**
     * convert page365 date to flow account date
     * Page365 date : date format : yyyy-mm-ddTHH:MM:SS.sss+07.00
     * Flow account date : yyyy-mm-dd
     * @param {string} pDate : page365 date string 
     */
    p2fDate(pDate) {
        let d = new Date(pDate);
        return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
    }
}

module.exports = Page365ToFlowAcc;