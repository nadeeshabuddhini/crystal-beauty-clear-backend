import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import userRouter from './routes/userRouter.js';
import productRouter from './routes/productRouter.js';
import jwtVerify from './middleware/auth.js';
import orderRouter from './routes/orderRouter.js';



const app = express();

mongoose.connect("mongodb+srv://helloUser:newSet@cluster0.gi0sj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(
    ()=>{
        console.log("connected to the database")
    } 
).catch(
    (error)=>{
        console.log("connection failed", error)
    }
)

app.use(bodyParser.json());
app.use(jwtVerify)

app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/order',orderRouter);

app.listen(3000,()=>{
    console.log("server is running on port 3000")
})