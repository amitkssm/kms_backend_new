const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
// let url = "mongodb+srv://tolet:tolet@cluster0.nlbdxil.mongodb.net/kms_db?retryWrites=true&w=majority"
// let url = "mongodb+srv://akssmbr91:CqGu8uIfp2Hhs4hC@cluster0.mtbcggb.mongodb.net/kms_db?retryWrites=true&w=majority"
let url = "mongodb+srv://amitkssm91:EQyEkdMq2UmkLSgI@cluster0.zkm5wey.mongodb.net/kms_demo"
// let url = "mongodb://localhost:27017/kms_db"
// let url = "mongodb://kms:kms1234@15.207.181.138:27017/kms?authSource=kms"
mongoose.connect(url,
{useNewUrlParser : true},(err,result)=>{
    if(err){
        console.log("not Connected",err)
    }else{
    console.log("db Connected")
    }

});

