exports.FOODSTORY_BRANCHID = {
    CHOMPON: 7171,
    THAPHAE: 6969,
};

/**
 * Use for set branch before request bill
 * branch_set : change to branch id when request
 * other is fix
 */
exports.FOODSTORY_BRANCHFORM = {
    branch_set: [],
    restuarant: {
        name: "ยักษ์กะโจน",
        restuarant_id: 5686
    }, 
    branch_all: [
        {
            name: "ยักษ์กะโจน@ท่าแพ",
            branch_id: this.FOODSTORY_BRANCHID.THAPHAE,
        },
        {   
            name: "ยักษ์กะโจน@ชุมพร คาบาน่า",
            branch_id: this.FOODSTORY_BRANCHID.CHOMPON,
        }
    ],
};