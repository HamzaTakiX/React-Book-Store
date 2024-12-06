const orderService =require('../services/order_Services');

async function getAllOrders(req,res){
    const orders = await orderService.getAllOrders();
    res.json(orders);
}

async function addOrder(req,res){
    const order = await orderService.addOrder(req.body);
    res.json(order);
}

module.exports={getAllOrders,addOrder}