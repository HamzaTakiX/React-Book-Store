const CustomerService = require("../services/customer_services");
async function addCustomer(req,res){
    const user = CustomerService.addUser(req.body)
    res.json(user)
}

async function login (req,res){
    const result = await CustomerService.login(req.body);
    if (result){
        res.json({message:"connected with success"})
    }else{
        res.json({messsage:"email or password not correct"})
    }
}

module.exports = {addCustomer,login}