const CustomerController = require("../controllers/customer_contoller");
const express = require("express");
const router = express.Router();

router.route("/").post(CustomerController.addCustomer)
router.route("/login").post(CustomerController.login)

module.exports =router
