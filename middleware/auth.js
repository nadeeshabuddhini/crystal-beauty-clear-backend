import jwt from "jsonwebtoken"

export default function jwtVerify(req,res,next){
    const header = req.header("Authorization");
    if(header != null){
        const token = header.replace("Bearer ","");
        jwt.verify(token,"random678",(err,decoded)=>{
            console.log(decoded)
            if(decoded != null){
                 req.user = decoded
            }
           
        })
    }
    
    next()
}