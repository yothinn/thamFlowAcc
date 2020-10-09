const ProductMap = require("../productmap");
const FlowAccount = require("../flowacc");
const FoodStory = require("./foodstory");


class FoodStoryToFlowAcc {
    _foodStoryUser = null;
    _flowAccCredentail = null;
    _productFile = null;
    _productMap = null;
    
    constructor(shopName, foodStoryUser, flowAccCredentail) {
        this._flowAccCredentail = flowAccCredentail;
        this._foodStoryUser = foodStoryUser;
    }

    async init() {
        
    }
}

module.exports = FoodStoryToFlowAcc;