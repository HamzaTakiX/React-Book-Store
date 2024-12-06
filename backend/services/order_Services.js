const OrderModel = require("../models/Order")

async function getAllOrders(){
    return await OrderModel.find();
}

async function addOrder(order){
    return await OrderModel.create(order)
}

module.exports= {getAllOrders,addOrder};