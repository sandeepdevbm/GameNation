var db = require("../config/connection")
var collection = require('../config/collections')
const collections = require("../config/collections")
const { response } = require("../app")
const { getRounds } = require("bcrypt")
var objectId = require("mongodb").ObjectId

module.exports = {
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let userss = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(userss)
        })
    },
    addProduct: (product) => {
        product.stock = parseInt(product.stock)
        product.Category = objectId(product.Category)
        product.price = parseInt(product.price)
        product.date = new Date()
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
                resolve(data.insertedId)
            })
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $lookup: {
                        from: 'category',
                        localField: 'Category',
                        foreignField: '_id',
                        as: 'CategoryName'

                    }
                },
                {
                    $project: {
                        productTitle: 1,
                        price: 1,
                        img: 1,
                        oldPrice: 1,
                        offerPercentage: 1,
                        Category: { $arrayElemAt: ['$CategoryName', 0] },
                        stock: 1
                    }
                }
            ]).toArray()
            resolve(products);
        })
    },
    deleteProducts: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(proId) }).then((response) => {
                resolve(response)
            })
        })
    },
    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) }).then((product) => {
                resolve(product)
            })
        })
    },

    getDetailedProduct: (proId) => {
        return new Promise(async (resolve, reject) => {

            let details = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(proId) }
                },
                {
                    $lookup: {
                        from: collection.CATEGORY_COLLECTION,
                        foreignField: '_id',
                        localField: 'Category',
                        as: 'categoryDetails'

                    }
                },
                {
                    $project: {
                        productTitle: 1,
                        price: 1,
                        img: 1,
                        oldPrice: 1,
                        offerPercentage: 1,
                        Category: 1,
                        stock: 1,
                        categoryDetails: 1,
                        categoryDetails: { $arrayElemAt: ['$categoryDetails', 0] },
                    }
                }
            ]).toArray()
            resolve(details);
        })
    },

    getUserDetails: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((user) => {
                resolve(user)
            })
        })
    },

    updateProduct: (proId, proDetails) => {
        proDetails.Category = objectId(proDetails.Category)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) }, {
                $set: {
                    productTitle: proDetails.productTitle,
                    Category: proDetails.Category,
                    price: parseInt(proDetails.price),
                    img: proDetails.img,
                    stock: parseInt(proDetails.stock)
                }
            }).then((response) => {
                resolve()
            })
        })
    },
    categoryProducts: (catId) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $match: { Category: objectId(catId) }
                },
                {
                    $lookup: {
                        from: 'category',
                        localField: 'Category',
                        foreignField: '_id',
                        as: 'CategoryName'

                    }
                },
                {
                    $project: {
                        productTitle: 1,
                        price: 1,
                        img: 1,
                        Category: { $arrayElemAt: ['$CategoryName', 0] },
                    }
                }
            ]).toArray()
            resolve(products);
        })
    },
    getProduct: (proId) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(proId) }
                },
                {
                    $lookup: {
                        from: 'category',
                        localField: 'Category',
                        foreignField: '_id',
                        as: 'CategoryName'

                    }
                },
                {
                    $project: {
                        productTitle: 1,
                        price: 1,
                        img: 1,
                        Category: { $arrayElemAt: ['$CategoryName', 0] },
                        quantity: 1,
                        stock: 1
                    }
                }
            ]).toArray()
            resolve(products);
        })
    },

    searchProducts: (details) => {
        return new Promise(async (resolve, reject) => {
            let x = details.searchItem
            let pro = await db.get().collection(collection.PRODUCT_COLLECTION).find({ productTitle: { $regex: '.*' + x + '.*', $options: 'i' } }).toArray()
            resolve(pro)
        })
    },
    topSellingProducts: () => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $unwind: "$products",
                    },
                    {
                        $group: {
                            _id: "$products.item",
                            count: { $sum: "$products.quantity" },
                        },
                    },
                    {
                        $sort: { count: -1 },
                    },
                    {
                        $limit: 5,
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: "_id",
                            foreignField: "_id",
                            as: "productDetails",
                        },
                    }, {
                        $unwind: '$productDetails'
                    },
                ])
                .toArray()
                .then((response) => {
                    resolve(response);
                });
        });
    }
}