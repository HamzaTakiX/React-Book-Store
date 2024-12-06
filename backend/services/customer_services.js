const CustomerModel = require("../models/Customer");
const bcrypt = require("bcrypt");

async function addUser(user){
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password,salt);
    return await CustomerModel.create(user);
}

async function login(user){
    const customer =await  CustomerModel.findOne({"email": user.email});
    if(customer){
       const result =await bcrypt.compare(user.password,customer.password);
       if(result){
        return true ;
       }
    
    }
    return false ;
}

module.exports = {addUser,login}