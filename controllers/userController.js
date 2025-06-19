import bcrypt from "bcrypt"
import User from "../models/user.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv";
import axios from "axios";
import nodemailer from "nodemailer";
import { Otp } from "../models/otp.js";
dotenv.config()

const transport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})
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
                const token = jwt.sign(userData,process.env.JWT_KEY)
                res.json({
                    "message":"Login successful",
                    "token":token,
                    "user":userData
                })
            }else{
                res.status(403).json({"message":"password is incorrect"})
            }
        }
    })
}
export async function googleLogin(req,res){
    const accessToken = req.body.accessToken;

    try {
        const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo",{
            headers:{
                Authorization:"Bearer " + accessToken
            }
        })
        const user = await User.findOne({
            email:response.data.email
        })
        if(user ==null){
            const newUser = new User({
                email:response.data.email,
                firstName:response.data.given_name,
                lastName:response.data.family_name,
                isEmailVerified:true,
                password:accessToken
            })
            await newUser.save()

            const userData={
                email:response.data.email,
                firstName:response.data.given_name,
                lastName:response.data.family_name,
                role:"user",
                phone:"Not given",
                isDisabled:false,
                isEmailVerified:true
            }
            const token = jwt.sign(userData,process.env.JWT_KEY)
            res.json({
                "message":"Login successful",
                "token":token,
                "user":userData
            })  

        }else{
            const userData={
                email:user.email,
                firstName:user.firstName,
                lastName:user.lastName,
                role:user.role,
                phone:user.phone,
                isDisabled:user.isDisabled,
                isEmailVerified:user.isEmailVerified
            }
            const token = jwt.sign(userData,process.env.JWT_KEY)
            res.json({
                "message":"Login successful",
                "token":token,
                "user":userData
            })  
        }

    }catch(e){
        res.status(500).json({
            "message":"Google login failed"
        })
    }
}
export function getCurrentUser(req,res){
    if(req.user == null){
        res.status(403).json({
            "message":"Unauthorized to get user details"
        })
        return;
    }
    res.json({
        user:req.user
    })
}

export function sentOTP(req,res){
    const email = req.body.email;
    const otp = Math.floor(Math.random() * 9000)+1000;

    const message = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}`
    };
    
    const newOtp = new Otp({
        email: email,
        otp:otp,
    })
 
    newOtp.save().then(() => {
        console.log("OTP saved successfully");
    })

    transport.sendMail(message, (error, info) => {
        if (error) {
            return res.status(500).json({ message: "Failed to send OTP", error });
        }
        res.json({ message: "OTP sent successfully", otp });
    });
}
export async function changePassword(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const otp = req.body.otp;

    try{
        const lastOtp = await Otp.findOne({ email: email }).sort({ createdAt: -1 });

        if(lastOtp == null){
            res.status(404).json({"message":"No OTP found for this email"})
            return;
        }
        if(lastOtp.otp != otp){
            res.status(403).json({"message":"Invalid OTP"})
            return;
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        await User.updateOne({
            email: email
        }, {
            password: hashedPassword
        })
        await Otp.deleteMany({
            email: email
        })
        res.json({"message":"Password changed successfully"})

    }catch(e){
        res.status(500).json({"message":"Error while changing password"})
        return;
    }
}
    