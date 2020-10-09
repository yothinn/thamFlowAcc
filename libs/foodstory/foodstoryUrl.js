/**
     * Get menu url for request foodstory menu
     * @param {*} branchId 
     * @param {*} pageNo 
     * @param {*} pageSize use 12, 24, 48
     * @param {*} active : 1 is active , 0 is not active
*/
exports.getMenuUrl = function(branchId, pageNo, pageSize, active) {
    return `https://fs-api.foodstory.co/v1/master/branch/${branchId}/menu?` +
                `page=${pageNo}&pageSize=${pageSize}&cateActive=${active}&active=1&` +
                "view_type=LIST_VIEW";
};

/**
 * Get url for set date that download bill
 */
exports.getSetDateUrl = function() {
    return "https://owner.foodstory.co/api/setDate";
}

exports.getSetBranchUrl = function() {
    return "https://owner.foodstory.co/api/setMultiBranch";
}

/**
 * Get bill url
 * @param {*} draw : ถ้า request หลายครั้ง draw ต้องนับเพิ่มไปเรื่อยๆ  และเริ่มนับใหม่ เมื่อหยุด request 
 * @param {*} startIndex : start index is 0
 * @param {*} pageSize : Default is 25
 */
exports.getSaleByBillSuccessUrl = function(draw, startIndex, pageSize=25) {
    return "https://owner.foodstory.co/salebybill/getdata/bill_success?" +
            `draw=${draw}&` +
            "columns[0][data]=date&" +
            "columns[0][name]=date&" +
            "columns[0][searchable]=true&" +
            "columns[0][orderable]=true&" +
            "columns[0][search][value]=&" +
            "columns[0][search][regex]=false&" +
            "columns[1][data]=time&" +
            "columns[1][name]=time&" +
            "columns[1][searchable]=true&" +
            "columns[1][orderable]=true&" +
            "columns[1][search][value]=&" +
            "columns[1][search][regex]=false&" +
            "columns[2][data]=bill_time&" +
            "columns[2][name]=bill_time&" +
            "columns[2][searchable]=true&" +
            "columns[2][orderable]=true&" +
            "columns[2][search][value]=&" +
            "columns[2][search][regex]=false&" +
            "columns[3][data]=receipt_no&" +
            "columns[3][name]=receipt_no&" +
            "columns[3][searchable]=true&" +
            "columns[3][orderable]=true&" +
            "columns[3][search][value]=&" +
            "columns[3][search][regex]=false&" +
            "columns[4][data]=pos_id&" +
            "columns[4][name]=pos_id&" +
            "columns[4][searchable]=true&" +
            "columns[4][orderable]=true&" +
            "columns[4][search][value]=&" +
            "columns[4][search][regex]=false&" +
            "columns[5][data]=inv_no&" +
            "columns[5][name]=inv_no&" +
            "columns[5][searchable]=true&" +
            "columns[5][orderable]=true&" +
            "columns[5][search][value]=&" +
            "columns[5][search][regex]=false&" +
            "columns[6][data]=subtotal_before_discount&" +
            "columns[6][name]=subtotal_before_discount&" +
            "columns[6][searchable]=true&" +
            "columns[6][orderable]=true&" +
            "columns[6][search][value]=&" +
            "columns[6][search][regex]=false&" +
            "columns[7][data]=discount_amount&" +
            "columns[7][name]=discount_amount&" +
            "columns[7][searchable]=true&" +
            "columns[7][orderable]=true&" +
            "columns[7][search][value]=&" +
            "columns[7][search][regex]=false&" +
            "columns[8][data]=discount_sub_amount&" +
            "columns[8][name]=discount_sub_amount&" +
            "columns[8][searchable]=true&" +
            "columns[8][orderable]=true&" +
            "columns[8][search][value]=&" +
            "columns[8][search][regex]=false&" +
            "columns[9][data]=sub_amount&" +
            "columns[9][name]=sub_amount&" +
            "columns[9][searchable]=true&" +
            "columns[9][orderable]=true&" +
            "columns[9][search][value]=&" +
            "columns[9][search][regex]=false&" +
            "columns[10][data]=service&" +
            "columns[10][name]=service&" +
            "columns[10][searchable]=true&" +
            "columns[10][orderable]=true&" +
            "columns[10][search][value]=&" +
            "columns[10][search][regex]=false&" +
            "columns[11][data]=non_vat&" +
            "columns[11][name]=non_vat&" +
            "columns[11][searchable]=true&" +
            "columns[11][orderable]=true&" +
            "columns[11][search][value]=&" +
            "columns[11][search][regex]=false&" +
            "columns[12][data]=ex_vat&" +
            "columns[12][name]=ex_vat&" +
            "columns[12][searchable]=true&" +
            "columns[12][orderable]=true&" +
            "columns[12][search][value]=&" +
            "columns[12][search][regex]=false&" +
            "columns[13][data]=before_vat&" +
            "columns[13][name]=before_vat&" +
            "columns[13][searchable]=true&" +
            "columns[13][orderable]=true&" +
            "columns[13][search][value]=&" +
            "columns[13][search][regex]=false&" +
            "columns[14][data]=tax&" +
            "columns[14][name]=tax&" +
            "columns[14][searchable]=true&" +
            "columns[14][orderable]=true&" +
            "columns[14][search][value]=&" +
            "columns[14][search][regex]=false&" +
            "columns[15][data]=bill_discounted_price&" +
            "columns[15][name]=bill_discounted_price&" +
            "columns[15][searchable]=true&" +
            "columns[15][orderable]=true&" +
            "columns[15][search][value]=&" +
            "columns[15][search][regex]=false&" +
            "columns[16][data]=rounding_amount&" +
            "columns[16][name]=rounding_amount&" +
            "columns[16][searchable]=true&" +
            "columns[16][orderable]=true&" +
            "columns[16][search][value]=&" +
            "columns[16][search][regex]=false&" +
            "columns[17][data]=total_amount&" +
            "columns[17][name]=total_amount&" +
            "columns[17][searchable]=true&" +
            "columns[17][orderable]=true&" +
            "columns[17][search][value]=&" +
            "columns[17][search][regex]=false&" +
            "columns[18][data]=tips_amount&" +
            "columns[18][name]=tips_amount&" +
            "columns[18][searchable]=true&" +
            "columns[18][orderable]=true&" +
            "columns[18][search][value]=&" +
            "columns[18][search][regex]=false&" +
            "columns[19][data]=refund_amount&" +
            "columns[19][name]=refund_amount&" +
            "columns[19][searchable]=true&" +
            "columns[19][orderable]=true&" +
            "columns[19][search][value]=&" +
            "columns[19][search][regex]=false&" +
            "columns[20][data]=order_type&" +
            "columns[20][name]=order_type&" +
            "columns[20][searchable]=true&" +
            "columns[20][orderable]=true&" +
            "columns[20][search][value]=&" +
            "columns[20][search][regex]=false&" +
            "columns[21][data]=cash_drawer_code&" +
            "columns[21][name]=cash_drawer_code&" +
            "columns[21][searchable]=true&" +
            "columns[21][orderable]=true&" +
            "columns[21][search][value]=&" +
            "columns[21][search][regex]=false&" +
            "columns[22][data]=payment_type&" +
            "columns[22][name]=payment_type&" +
            "columns[22][searchable]=true&" +
            "columns[22][orderable]=true&" +
            "columns[22][search][value]=&" +
            "columns[22][search][regex]=false&" +
            "columns[23][data]=table_name&" +
            "columns[23][name]=table_name&" +
            "columns[23][searchable]=true&" +
            "columns[23][orderable]=true&" +
            "columns[23][search][value]=&" +
            "columns[23][search][regex]=false&" +
            "columns[24][data]=seat_amt&" +
            "columns[24][name]=seat_amt&" +
            "columns[24][searchable]=true&" +
            "columns[24][orderable]=true&" +
            "columns[24][search][value]=&" +
            "columns[24][search][regex]=false&" +
            "columns[25][data]=payment_customer_name&" +
            "columns[25][name]=payment_customer_name&" +
            "columns[25][searchable]=true&" +
            "columns[25][orderable]=true&" +
            "columns[25][search][value]=&" +
            "columns[25][search][regex]=false&" +
            "columns[26][data]=remark&" +
            "columns[26][name]=remark&" +
            "columns[26][searchable]=true&" +
            "columns[26][orderable]=false&" +
            "columns[26][search][value]=&" +
            "columns[26][search][regex]=false&" +
            "columns[27][data]=bill_open_by&" +
            "columns[27][name]=bill_open_by&" +
            "columns[27][searchable]=true&" +
            "columns[27][orderable]=true&" +
            "columns[27][search][value]=&" +
            "columns[27][search][regex]=false&" +
            "columns[28][data]=bill_close_by&" +
            "columns[28][name]=bill_close_by&" +
            "columns[28][searchable]=true&" +
            "columns[28][orderable]=true&" +
            "columns[28][search][value]=&" +
            "columns[28][search][regex]=false&" +
            "columns[29][data]=branch_name&" +
            "columns[29][name]=branch_name&" +
            "columns[29][searchable]=true&" +
            "columns[29][orderable]=true&" +
            "columns[29][search][value]=&" +
            "columns[29][search][regex]=false&" +
            "order[0][column]=0&" +
            "order[0][dir]=asc&" +
            `start=${startIndex}&` +
            `length=${pageSize}&` +
            "search[value]=&" +
            "search[regex]=false&" +
            `_=${Date.now()}`;
}

exports.getBillDetailUrl = function(billId) {
    return `https://owner.foodstory.co/sale/getItemData/${billId}?` +
            "draw=1&" +
            "columns[0][data]=payment_item_id&" +
            "columns[0][name]=payment_item_id&" +
            "columns[0][searchable]=true&" +
            "columns[0][orderable]=true&" +
            "columns[0][search][value]=&" +
            "columns[0][search][regex]=false&" +
            "columns[1][data]=menu_name&" +
            "columns[1][name]=menu_name&" +
            "columns[1][searchable]=true&" +
            "columns[1][orderable]=true&" +
            "columns[1][search][value]=&" +
            "columns[1][search][regex]=false&" +
            "columns[2][data]=quantity&" +
            "columns[2][name]=quantity&" +
            "columns[2][searchable]=true&" +
            "columns[2][orderable]=true&" +
            "columns[2][search][value]=&" +
            "columns[2][search][regex]=false&" +
            "columns[3][data]=price&" +
            "columns[3][name]=price&" +
            "columns[3][searchable]=true&" +
            "columns[3][orderable]=true&" +
            "columns[3][search][value]=&" +
            "columns[3][search][regex]=false&" +
            "columns[4][data]=total_price&" +
            "columns[4][name]=total_price&" +
            "columns[4][searchable]=true&" +
            "columns[4][orderable]=true&" +
            "columns[4][search][value]=&" +
            "columns[4][search][regex]=false&" +
            "columns[5][data]=discount_value&" +
            "columns[5][name]=discount_value&" +
            "columns[5][searchable]=true&" +
            "columns[5][orderable]=true&" +
            "columns[5][search][value]=&" +
            "columns[5][search][regex]=false&" +
            "columns[6][data]=discounted_percent&" +
            "columns[6][name]=discounted_percent&" +
            "columns[6][searchable]=true&" +
            "columns[6][orderable]=true&" +
            "columns[6][search][value]=&" +
            "columns[6][search][regex]=false&" +
            "columns[7][data]=discounted_price&" +
            "columns[7][name]=discounted_price&" +
            "columns[7][searchable]=true&" +
            "columns[7][orderable]=true&" +
            "columns[7][search][value]=&" +
            "columns[7][search][regex]=false&" +
            "columns[8][data]=remark&" +
            "columns[8][name]=remark&" +
            "columns[8][searchable]=true&" +
            "columns[8][orderable]=false&" +
            "columns[8][search][value]=&" +
            "columns[8][search][regex]=false&" +
            "order[0][column]=0&" +
            "order[0][dir]=asc&" +
            "start=0&" +
            "length=-1&" +
            "search[value]=&" +
            "search[regex]=false&" +
            `_=${Date.now()}`;
}
