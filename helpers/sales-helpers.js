var db = require("../config/connection")
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectId


module.exports = {

    dailySalesReport:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        status:{$ne:'Canceled'}
                    }
                },
                {
                    $group:{
                        _id:"$Date",
                        dailySaleAmount:{$sum:'$totalAmount'},
                        count:{$sum:1}
                    }
                },
                {
                    $sort:{
                        _id:-1
                    }
                }
            ]).toArray().then((dailySales)=>{
                let totalamount=0
                dailySales.forEach(element => {
                    totalamount += element.dailySaleAmount
                });
                dailySales.totalamount=totalamount
                resolve(dailySales)
            })
        })
    },
    yearlySalesReport:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        status:{$ne:'Canceled'}
                    }
                },
                {
                    $group:{
                        _id:"$Year",
                        yearlySaleAmount:{$sum:'$totalAmount'},
                        count:{$sum:1}
                    }
                },
                {
                    $sort:{
                        _id:-1
                    }
                }
            ]).toArray().then((yearlySales)=>{
                let totalamount=0
                yearlySales.forEach(element => {
                    totalamount += element.yearlySaleAmount
                });
                yearlySales.totalamount=totalamount
                resolve(yearlySales)
            })
        })
    },
    monthlySalesReport:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        status:{$ne:'Canceled'}
                    }
                },
                {
                    $group:{
                        _id:"$Month",
                        monthlySaleAmount:{$sum:'$totalAmount'},
                        count:{$sum:1}
                    }
                },
                {
                    $sort:{
                        _id:-1
                    }
                }
            ]).toArray().then((monthlySales)=>{
                let totalamount=0
                monthlySales.forEach(element => {
                    totalamount += element.monthlySaleAmount
                });
                monthlySales.totalamount=totalamount
                resolve(monthlySales)
            })
        })
    },
    recentsales:()=> {
        return new Promise((resolve, reject) => {
          db.get()
            .collection(collection.ORDER_COLLECTION)
            .aggregate([
              {
                $unwind: "$products",
              },
             
              {
                $unwind:"$deliveryDetails"
              },
              {
                $lookup: {
                  from: collection.PRODUCT_COLLECTION,
                  localField: "products.item",
                  foreignField: "_id",
                  as: "productDetail",
                }
              },
              {
                $unwind:"$productDetail"
              },{
                $sort:{time:-1}
              },{
                $limit:6
              }
             
    
            
            ])
            .toArray()
            .then((response) => {
              resolve(response);
            });
        });
      }
    
    

}