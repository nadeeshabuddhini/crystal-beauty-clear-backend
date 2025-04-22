import express from "express"
import { createProduct, deleteProducts, getProductById, getProducts, updateProducts } from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.post("/",createProduct);
productRouter.get("/",getProducts);
productRouter.get("/:id",getProductById);
productRouter.delete("/:productId",deleteProducts);
productRouter.put("/:productId", updateProducts)

export default productRouter;