var db = require("../config/connection")
var collection = require('../config/collections')
const { response } = require("../app")
var objectId = require("mongodb").ObjectId

module.exports = {
    updateStatus: (details) => {
        console.log(details);
        return new Promise(async (resolve, reject) => {
            let stat = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(details.orderId), 'products.item': objectId(details.proId) }, {
                $set:
                    { 'products.$.status': details.status }
            })
            resolve(stat)
        })
    },
    cancelOrder: (details) => {
        return new Promise(async(resolve, reject) => {
            let orderId = details.order
            let proId = details.product
            let userId = details.userId
            let total = parseInt(details.total) 
            let quantity = parseInt(details.quantity)
            referaldata = {
                amount: total,
                date: new Date().toDateString(),
                timestamp: new Date(),
                status: "credited",
                message: 'Canceled Amount'
            }

            await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId), 'products.item': objectId(proId) },
                {
                    $set:
                        { 'products.$.status': "canceled" }
                }).then(async(response) => {
                    await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) },
                {
                    $inc: { stock: quantity }
                })
                await db.get().collection(collection.WALLET_COLLECTION).updateOne({userId:objectId(userId)},{
                    $inc: {
                        balance: total
                    },
                    $push: {
                        transaction: referaldata
                    }
                })
                    resolve(response)
                })

            

            // db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId), 'products.item': objectId(proId) },
            //  { $set: 
            //     { 'products.$.status': "canceled" } }).then((response)=>{
            //         resolve(response)
            //     })

        })
    },

    getOrderCount:()=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).find().count().then((response)=>{
                resolve(response)
            })
        })
    }
}



 // if (ofrP) {
    //     await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(element._id) }, { $unset: { oldPrice: "", offerPercentage: "" }, $set: { price: ofrP } }).then(async () => {
    //         await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(element._id) }, {
    //             $set: { price: offer, oldPrice: oldP, offerPercentage: x, catoffer: "added" }
    //         })
    //     })
    // } else {
    //     await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(element._id) }, {
    //         $set: { price: offer, oldPrice: oldP, offerPercentage: x, catoffer: "added" }
    //     })

    // }