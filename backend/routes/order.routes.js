const express = require("express")

const router = express.Router()
const orderContoller = require("../controllers/order_controller")
router.route("/").get(orderContoller.getAllOrders)
                    .post(orderContoller.addOrder)

module.exports =router;

 