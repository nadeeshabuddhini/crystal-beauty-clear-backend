import express from "express"
import { createOrder, getorders, updateOrder } from "../controllers/orderController.js";


const orderRouter = express.Router();

orderRouter.post("/",createOrder);
orderRouter.get("/",getorders);
orderRouter.put("/:orderId", updateOrder)


export default orderRouter;