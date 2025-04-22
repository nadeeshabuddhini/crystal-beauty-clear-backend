import Product from "../models/product.js"

export async function createProduct(req,res){
    if(req.user == null){
        res.status(403).json({
            "message":"First you need to login"
        })
        return
    }
    if(req.user.role != "admin"){
        res.status(403).json({
            "message":"You cannot create the product"
        })
        return
    }
    const product = new Product(req.body);

    try{
        await product.save()
        res.json({
            "message":"Successfully saved the product"
        })
    }catch(err){
        res.status(500).json({
            "message":"product not saved"
        })
    }
}

export async function getProducts(req,res){
    try{
       const products = await Product.find();
       res.json(products);
    }catch(err){
        res.status(500).json({
            "message":"Products not found"
        })
    }

}
export async function getProductById(req,res){
    const productId = req.params.id;
    const product = await Product.findOne({productId:productId});

    if(product == null){
        res.status(404).json({
            "message":"Product not found"
        })
        return
    }
    res.json({
        product:product
    })
}
export async function deleteProducts(req,res){
    if(req.user == null){
        res.status(403).json({
            "message":"First you need to login"
        })
        return
    }
    if(req.user.role != "admin"){
        res.status(403).json({
             "message":"You cannot delete the product"
         })
        return
    }
    try{
       await Product.findOneAndDelete({
        productId:req.params.productId}) 
        res.json({
            "message":"successfully delete the product"
        })
    }catch(err){
        res.status(500).json({
            "message":"not delete the product"
        })
    }
}

export async function updateProducts(req,res){
    if(req.user == null){
        res.status(403).json({
            "message":"First you need to login"
        })
        return
    }
    if(req.user.role != "admin"){
        res.status(403).json({
             "message":"You cannot update the product"
         })
        return
    }
    try{
       await Product.findOneAndUpdate({
        productId:req.params.productId
    },req.body) 
        res.json({
            "message":"successfully update the product"
        })
    }catch(err){
        res.status(500).json({
            "message":"not update the product"
        })  
    }
}




