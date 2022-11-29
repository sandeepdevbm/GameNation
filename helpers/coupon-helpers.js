var db=require("../config/connection")
var collection=require('../config/collections')
var objectId = require("mongodb").ObjectId

module.exports={
    addCoupon:(details)=>{
        let percentage=parseInt(details.percentage)
        let detail={
            name:details.couponName,
            percentage:percentage,
            users:details.users=[]
        }
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.COUPON_COLLECTION).insertOne(detail).then(()=>{
                resolve()
            })
        })
    },
    getAllCoupon:(userId)=>{
        return new Promise(async(resolve,reject)=>{
           let coupon= await db.get().collection(collection.COUPON_COLLECTION).find({users:{$nin:[objectId(userId)]}}).toArray()
           resolve(coupon)
        })
    },
    getCouponDetails:(couponId)=>{
        return new Promise(async(resolve,reject)=>{
           let coupon= await db.get().collection(collection.COUPON_COLLECTION).findOne({_id:objectId(couponId)})
           resolve(coupon)
        })
    },
    pushUser:(cname,userId)=>{
        return new Promise(async(resolve, reject) => {
            await db.get().collection(collection.COUPON_COLLECTION).updateOne({name:cname},{
                $push:{
                    users:objectId(userId)
                }
            }).then(()=>{
                resolve()
            })
        })

    },
    getCoupons:()=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).find().toArray().then((data)=>{
                resolve(data)
            })
        })
    },
    deleteCoupon:(couponId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:objectId(couponId)}).then((response)=>{
                resolve()
            })
        })
    }
}

