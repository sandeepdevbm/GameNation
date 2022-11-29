var db=require("../config/connection")
var collection=require('../config/collections')
var objectId = require("mongodb").ObjectId

module.exports={
    addCategory:(ctgry)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(ctgry).then((data)=>{
                resolve(data)
            })
        })
    },
    categoryList:()=>{
        return new Promise(async(resolve,reject)=>{
            let category= await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(category)
        })
    },
    deleteCategory:(catId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(catId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    getCategoryDetails:(catId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(catId)}).then((category)=>{
                resolve(category)
            })
        })
    },
    updateCategory:(catId,catDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(catId)},{
                $set:{
                    categoryName:catDetails.categoryName
                }
            }).then((response)=>{
                resolve()
            })
        })
    },
    getCategoryProducts:()=>{
        return new Promise(async(resolve,reject)=>{
           let products=await db.get().collection(collection.CATEGORY_COLLECTION).aggregate([
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: '_id',
                        foreignField: 'Category',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        categoryName:1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                },
            ]).toArray()
            resolve(products)
        })
    },
    getCatProducts:(details)=>{
        return new Promise(async(resolve,reject)=>{
            let products= await db.get().collection(collection.PRODUCT_COLLECTION).find({Category:objectId(details._id)}).toArray()
            resolve(products)
        })
    },
    getOneCategory:(catId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(catId)}).then((response)=>{
                resolve(response)
            })
        })
    }

}