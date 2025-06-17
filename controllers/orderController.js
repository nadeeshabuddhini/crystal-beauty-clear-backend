import Order from "../models/order.js";
import Product from "../models/product.js";

export async function createOrder(req,res){
    if(req.user == null){
        res.status(403).json({
            "message":"Unauthorized to order"
        })
        return;
    }

    const body = req.body;
    const orderData = {
        orderId:"",
        email:req.user.email,
        name:body.name,
        address:body.address,
        phoneNum:body.phoneNum,
        billItems:[],
        total:0
    }
    Order.find().sort({
        date:-1
    }).limit(1).then(async (lastBill)=>{
        if(lastBill.length == 0){
            orderData.orderId = "ORD0001";
        }else{
            const lastOrderId = lastBill[0].orderId;//"ORD0064"
            const lastOrderStr = lastOrderId.replace("ORD","");//"0064"
            const lastOrderNum = parseInt(lastOrderStr);//64
            const newOrderNum = lastOrderNum +1//65
            const newOrderStr = newOrderNum.toString().padStart(4,'0');//"0065"
    
            orderData.orderId = "ORD" + newOrderStr;
        }
        for(let i=0;i<body.billItems.length;i++){
            const product = await Product.findOne({productId:body.billItems[i].productId});
            if(product == null){
                res.status(404).json({
                    "message":"Product not found for productId: " + body.billItems[i].productId
                })
                return;
            }
            orderData.billItems[i]={
                productId:product.productId,
                productName:product.name,
                image:product.images[0],
                price:product.price,
                quantity:body.billItems[i].quantity
            };
            orderData.total = orderData.total + product.price * body.billItems[i].quantity;
        }

        const order = new Order(orderData);
    
        order.save().then(
            ()=>{
                res.json({
                    "message":"Successfully saved the order"
                })
            }
        ).catch(
            ()=>{
            res.status(500).json({
                "message":"order not saved"
            })
        }
        )
    })
  
}
export function getorders(req,res){
    if(req.user == null){
        res.status(403).json({
            "message":"Unauthorized to get orders"
        })
        return;
    }
    if(req.user.role == "admin"){
        Order.find().then(
            (orders)=>{
                res.json(orders)
            }
        ).catch(
            ()=>{
                res.status(500).json({
                    "message":"Order not found"
            })
            }
        )
    }else{
        Order.find(
            {email:req.user.email}
        ).then(
            (orders)=>{
                res.json(orders)
            }
        ).catch(
            ()=>{
                res.status(500).json(
                    {"message":"Order not found"}
                )
            }
        )
    }

}
export async function updateOrder(req,res){
    try{
        if(req.user == null){
            res.status(403).json({
                "message":"Unauthorized to update order"
            })
            return;
        }
        if(req.user.role != "admin"){
            res.status(403).json({
                "message":"You cannot update the order"
            })
            return;
        }
        const orderId = req.params.orderId;
        const order = await Order.findOneAndUpdate({orderId:orderId},req.body)

        res.json({
            "message":"Successfully updated the order"
        })

    }catch(err){
        res.status(500).json({
            "message":"Order not updated"
        })
    }
}