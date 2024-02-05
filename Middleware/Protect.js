const jwt=require('jsonwebtoken');
const AppUtils=require('../AppUtils');
const Constants = require('../Constants');

function Protect(req,res,next){
    let token=req.headers['authorization'];
    if(token){
        token=token.split(' ')[1];
        jwt.verify(token,Constants.SECRET_KEY,(err,success)=>{
            if(err){
                res.status(400).json(AppUtils.generateError('UNAUTHORISED','Token is not valid'));
            }
            else{
                next();
                
            }
        })
    }
    else{
        res.status(403).json(AppUtils.generateError('TOKEN MISSING','Token is missing'));
    }
  }
 module.exports=Protect;