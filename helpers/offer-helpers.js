var db = require("../config/connection")
var collection = require('../config/collections')
var objectId = require("mongodb").ObjectId

module.exports = {

    addProductOffer: (proId, details) => {
        return new Promise(async (resolve, reject) => {
            let x = parseInt(details.persent)
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) })
            let oldPrice = products.price
            let offer = products.price - (products.price * (x / 100))
            offer = Math.round(offer)

            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) }, {
                $set: { price: offer, oldPrice: oldPrice, offerPercentage: x }
            }).then(() => {

                resolve()
            })

        })
    },
    addCategoryOffer: (catId, details) => {
        return new Promise(async (resolve, reject) => {
            let x = parseInt(details.persent)
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ Category: objectId(catId) }).toArray()
            products.forEach(async (element) => {
                let oldPrice = element.price
                let offer = element.price - (element.price * (x / 100))
                offer = Math.round(offer)

                await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(element._id) }, {
                    $set: { price: offer, oldPrice: oldPrice }
                })
            });
            resolve()


        })
    },
    deleteProductOffer: (proId) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) })
            let proPrice = products.oldPrice
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) }, { $unset: { oldPrice: "", offerPercentage: "" }, $set: { price: proPrice } }).then(() => [
                resolve()
            ])

        })
    },
    deleteCategoryOffer: (catId) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ Category: objectId(catId) }).toArray()
            products.forEach(async (element) => {
                let proPrice = element.oldPrice
                await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(element._id) }, { $unset: { oldPrice: "" }, $set: { price: proPrice } })
            });
            resolve()
        })
    }

}
