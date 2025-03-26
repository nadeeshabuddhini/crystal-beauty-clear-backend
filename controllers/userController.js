import bcrypt from "bcrypt"
import User from "../models/user.js";
import jwt from "jsonwebtoken"

export function saveUser(req,res){

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const user = new User({
        email:req.body.email,
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        password:hashedPassword,
        role:req.body.role
    })

    if(req.body.role == "admin"){
        if(req.user == null){
            res.status(403).json({"message":"You have to login first as admin"})
            return
        }
        if(req.user.role != "admin"){
            res.status(403).json({"message":"You are not authorized to create an admin account"})
            return
        }

    }

    user.save().then(()=>{
        res.json({"message":"User saved successfully"})
    }).catch(
        ()=>{
        res.status(500).json({"message":"User not saved"})
        }
    )
}

export function loginUser(req,res){
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({
        email:email
    }).then((user)=>{
        console.log(user)
        if(user == null){
            res.status(404).json({"message":"Invalid email"})
        }
        else{
            const isPasswordCorrect = bcrypt.compareSync(password, user.password);
            if(isPasswordCorrect){
                const userData={
                    email:user.email,
                    firstName:user.firstName,
                    lastName:user.lastName,
                    role:user.role,
                    phone:user.phone,
                    isDisabled:user.isDisabled,
                    isEmailVerified:user.isEmailVerified
                }
                const token = jwt.sign(userData,"random678")
                res.json({
                    "message":"Login successful",
                    "token":token
                })
            }else{
                res.status(403).json({"message":"password is incorrect"})
            }
        }
    })
}