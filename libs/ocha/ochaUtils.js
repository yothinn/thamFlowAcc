const XLSX = require("xlsx");
const ProductMap = require("../../libs/product/productmap");

exports.writeOchaToXlsx = async (productMapFile, orderList, toFileName) => {
    try {
        let productMap = new ProductMap();

        await productMap.readProduct(productMapFile.fileName, productMapFile.sheetName);

        let bills = [];
        let itemList = [];
        let order;

        let orderLen = orderList.length;
        if (orderLen === 0) {
            return;
        }

        for (let i = orderLen - 1; i >=0; i--) {
            order = orderList[i];
            // console.log(order);
            let d = new Date(order.order.order_time * 1000);
            let dateStr = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;

            let discount = (order.discounts) ? parseFloat(order.discounts[0].discounted_value) : 0;

            let total = parseFloat(order.order.money_payable);

            let payMethodStr = (order.payments[0].type === 1) ? "cash" : "โอนเงิน";
            
            bills.push({
                date: dateStr,
                no: order.payments[0].receipt_number_v2,
                status: order.order.status,
                cashier: order.order.cashier_name,
                subtotal: total + discount,
                discount: discount,
                total: total,
                payment_method: payMethodStr,
            });

            for (let item of order.items) {

                let productName;
                let vatRate;

                let product = productMap.findProduct(item.item_name, item.item_price.price_name);
                if (product) {
                    productName = product.flowProductName;
                    vatRate =  product.vatRate;
                } else {
                    productName = item.item_name;
                    vatRate = 7;
                }

                
                let quantity = (item.item_type === 1) ? item.quantity : parseFloat(item.weight);
                
                let subTotal = parseFloat(item.money_nominal);
                // ต้องใช้แบบนี้ แทนการใช้การ item.item_price.unit_price เพราะมีกรณีของเมนูย่อยเข้ามา
                // unit_price จะไม่ตรง
                let unitPrice = subTotal / quantity;

                itemList.push({
                    date: dateStr,
                    no: order.payments[0].receipt_number_v2,
                    status: order.order.status,
                    productName: productName,
                    catogory: item.category_name,
                    quantity: quantity,
                    unitprice: unitPrice,
                    subtotal: subTotal,
                    vatRate: vatRate,
                });
            }
        }

        let wb = XLSX.utils.book_new();

        // Seperate bill list and item list
        let ws_bills = XLSX.utils.json_to_sheet(bills);
        let ws_itemList = XLSX.utils.json_to_sheet(itemList);

        XLSX.utils.book_append_sheet(wb, ws_bills, "bills");
        XLSX.utils.book_append_sheet(wb, ws_itemList, "items");

        await XLSX.writeFile(wb, toFileName);
    } catch(error) {
        throw error;
    }
}