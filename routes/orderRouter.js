import express from "express"
import { createOrder, getorders } from "../controllers/orderController.js";


const orderRouter = express.Router();

orderRouter.post("/",createOrder);
orderRouter.get("/",getorders)


export default orderRouter;