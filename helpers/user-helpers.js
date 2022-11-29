var db = require("../config/connection")
var collection = require('../config/collections')
const bcrypt = require('bcrypt');
const { UserInstance } = require("twilio/lib/rest/conversations/v1/user");
const { response, render } = require("../app");
var objectId = require('mongodb').ObjectId
const saltRounds = 10;
var voucher_codes = require('voucher-code-generator');
const dotenv = require('dotenv').config()


const Razorpay = require('razorpay');
const { resolve } = require("node:path");
const paypal = require('paypal-rest-sdk');
const referalHelpers = require("./referal-helpers");

var instance = new Razorpay({
    key_id: process.env.RazorPayKeyId,
    key_secret: process.env.RazorPaySecretKey,
});


paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.PaypalClientId,
    'client_secret': process.env.PaypalClientSecret
});

// 'mode': 'sandbox', //sandbox or live
//     'client_id': 'Afs0mPj-7S9qVSUNG9QiiAmSYeEtuik0_Xnsdbad_0m1RSPP2s-DdGh_Fqr8hGkAIR-auCc47RJT9pTb',
//     'client_secret': 'EKe62nBkLWW97MC02jXJc3BoPGamceuQg7o7C_AY3vykcFJNsEwYd-yFjOsa3mHcV1uL5cKAipNAfzhU'


module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {

            let response = {}
            let count = await db.get().collection(collection.USER_COLLECTION).count({ email: userData.email })

            if (count != 0) {
                response.status = false
                response.message = 'Email Already Exists'
                resolve(response)
            } else {

                if (userData.Referal) {
                    referedPerson = await db.get().collection(collection.USER_COLLECTION).findOne({ referals: userData.Referal })
                    if (referedPerson) {
                         let amt = parseInt(100)
                         await referalHelpers.referalCredit(referedPerson, amt)
 
                         referal = voucher_codes.generate({
                             prefix: "gamenation-",
                             postfix: "-2022"
                         });
                         console.log(referal);
                         console.log(userData);
                         console.log('..............');
                         userData.password = await bcrypt.hash(userData.password, saltRounds)
                         userData.referals = referal[0]
                         console.log(userData);
                         db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(async (response) => {
                             console.log('zzzzzzzzzzzzzzzzzzzzzzzz');
                             console.log(response);
                             await referalHelpers.addWallet(response.insertedId)
                             console.log("111111111111111111111111");
                             await referalHelpers.addCredit(response.insertedId)
                             console.log("0000000000000000000000");
                             response.status = true
                             response.message = ""
                             resolve(response)
                         })

                    } else {
                        response.status = false
                        response.message = 'referal Code Does not exists'
                        resolve(response)
                    }
                }else{

           

                referal = voucher_codes.generate({
                    prefix: "gamenation-",
                    postfix: "-2022"
                });

                userData.password = await bcrypt.hash(userData.password, saltRounds)
                userData.referals = referal[0]
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(function (hash) {
                    response.status = true
                    response.message = ""
                    resolve(response)
                })
            }
                
            }
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            console.log(user);
            console.log("aaaaaaaaaaaaaaaaaaaaaaaaa");
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log("login sucess");
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('login failed');
                        resolve({ status: false })
                    }
                })
            } else {
                console.log('login failed');
                resolve({ status: false })
            }
        })
    },
    getOtp: (phoneData) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ phone: phoneData })
            if (user) {
                response = {
                    message: "user found",
                    user: user
                }
                resolve(response)
            } else {
                response = {
                    message: "user not found"
                }
                resolve(response)
            }
        })
    },
    getPhoneNumber: (phonenumber) => {
        return new Promise(async (resolve, reject) => {
            let count = await db.get().collection(collection.USER_COLLECTION).count({ phone: phonenumber })
            console.log(count);
            if (count != 0) {
                db.get().collection(collection.USER_COLLECTION).findOne({ phone: phonenumber }).then((user) => {
                    let response = {
                        message: "User Identified",
                        status: true,
                        user: user
                    }
                    resolve(response)
                })

            }
            else {
                let response = {
                    message: "Invalid Mobile Number",
                    status: false
                }
                resolve(response);
            }
        });
    },
    blockUser: (user) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(user) }, {
                $set: {
                    status: false
                }
            }).then((response) => {
                resolve(response)
            })

        })
    },
    unblockUser: (user) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(user) }, {
                $set: {
                    status: true
                }
            }).then((response) => {
                resolve(response)
            })

        })
    },
    // addToCart:(proId,userId)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
    //         if(userCart){

    //         }else{
    //             let cartObj={
    //                 user:objectId(userId),
    //                 products:[objectId(proId)]
    //             }
    //             db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
    //                 resolve
    //             })
    //         }
    //     })
    // }

    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                console.log("+++++++++++");
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }).then(() => {
                            resolve()
                        })
                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) },
                        {
                            $push: { products: proObj }
                        }
                    ).then((response) => {
                        resolve()
                    })
                }
            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            resolve(cartItems)
        })

    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
    changeProductQuantity: (details) => {
        console.log("-------------------------------");
        console.log(details);
        count = parseInt(details.count)
        quantity = parseInt(details.quantity)
        return new Promise((resolve, reject) => {
            if (count == -1 && quantity == 1) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart) },
                    {
                        $pull: { products: { item: objectId(details.product) } }
                    }
                ).then((response) => {
                    resolve({ removeProduct: true })
                })
            } else {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                    {
                        $inc: { 'products.$.quantity': count }
                    }).then((response) => {
                        resolve({ status: true })
                    })
            }

        })
    },
    removeCartProduct: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart) },
                {
                    $pull: { products: { item: objectId(details.product) } }
                }).then((response) => {
                    resolve({ removeProduct: true })
                })
        })
    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                    }
                }

            ]).toArray()


            if (total[0] != null) {
                resolve(total[0].total)
            }
            else {
                let total = 0
                resolve(total)
            }

        })
    },
    placeOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {
            console.log("qwertyuio");
            console.log(products);
            let date = new Date()
            let month = date.getMonth()+1
            let year = date.getFullYear()
            let status = order.paymentMethod === 'COD' ? 'Placed' : 'Pending'
            let orderStatus = order.paymentMethod === 'COD' ? 'Order Placed' : 'Payment Pending'
            let orderObj = {
                deliveryDetails: {
                    Fname: order.Fname,
                    Lname: order.Lname,
                    country: order.country,
                    address: order.address,
                    town: order.town,
                    state: order.state,
                    pinCode: order.pinCode,
                    phone: order.phone,
                    email: order.email
                },
                userId: objectId(order.userId),
                paymentMethod: order.paymentMethod,
                products: products,
                totalAmount: total,
                status: status,
                orderStatus: orderStatus,
                Date: date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear(),
                Month : month,
                Year : year,
                time: date
            }
            products.forEach(element => {
                element.status = "placed"
            });

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                products.forEach(element => {
                    let stock = (0 - element.quantity)
                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(element.item) },
                        {
                            $inc: { stock: stock }
                        })
                });

                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(order.userId) })

                resolve(response.insertedId)


            })
        })
    },
    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            resolve(cart.products)
        })
    },
    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            instance.orders.create({
                amount: total * 100,
                currency: "INR",
                receipt: '' + orderId,
                notes: {
                    key1: "value3",
                    key2: "value2"
                }
            }, (err, order) => {
                if (err) {
                    console.log(err);
                }
                console.log(order);
                resolve(order)
            })
        })
    },
    verifyPayment: (details) => {
        return new Promise(async (resolve, reject) => {
            const { createHmac } = await import('node:crypto');
            let hmac = createHmac('sha256', process.env.CryptoSecretKey);
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })
    },
    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                {
                    $set: {
                        status: 'placed'
                    }
                }).then(() => [
                    resolve()
                ])
        })
    },





    addToWishlist: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
        }
        return new Promise(async (resolve, reject) => {
            let userWishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
            if (userWishlist) {
                db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: objectId(userId) },
                    {
                        $push: { products: proObj }
                    }
                ).then((response) => {
                    resolve()
                })
            } else {
                let wishlistObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishlistObj).then((response) => {
                    resolve()
                })
            }
        })
    },



    getWishlistProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let wishlistItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            resolve(wishlistItems)
        })

    },















    // addToWishlist: (proId, userId) => {
    //     let wishlistObj = {
    //         user: objectId(userId),
    //         products: objectId(proId)
    //     }
    //     return new Promise((resolve,reject)=>{
    //         db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishlistObj).then((response) => {
    //             console.log('1111111111111111');
    //             console.log(response);
    //             resolve()
    //         })
    //     })
    // },
    getWishlistCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let wishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
            if (wishlist) {
                count = wishlist.products.length
                console.log("--------------------------");
                console.log(count);
            }
            resolve(count)
        })
    },
    // getWishlistProducts: (userId) => {
    //     return new Promise(async (resolve, reject) => {
    //         let wishlistItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
    //             {
    //                 $match: { user: objectId(userId) }
    //             },
    //             {
    //                 $lookup: {
    //                     from: collection.PRODUCT_COLLECTION,
    //                     localField: 'products',
    //                     foreignField: '_id',
    //                     as: 'product'
    //                 }
    //             },
    //             {
    //                 $project: {
    //                     products:1,
    //                     product: { $arrayElemAt: ['$product', 0] }
    //                 }
    //             }

    //         ]).toArray()
    //         console.log("000000000");
    //         console.log(wishlistItems);
    //         resolve(wishlistItems)
    //     })

    // },



    removeWishlistProduct: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ _id: objectId(details.wishlist) },
                {
                    $pull: { products: { item: objectId(details.product) } }
                }).then((response) => {
                    resolve({ removeProduct: true })
                })
        })
    },

    getOrderProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { userId: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        userId: 1,
                        paymentMethod: 1,
                        deliveryDetails: 1,
                        totalAmount: 1,
                        status: 1,
                        orderStatus: 1,
                        Date: 1



                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        userId: 1,
                        paymentMethod: 1,
                        deliveryDetails: 1,
                        totalAmount: 1,
                        status: 1,
                        orderStatus: 1,
                        Date: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            console.log('55555555555555555555');
            console.log(orderItems);
            resolve(orderItems)
        })

    },
    addAddress: (details) => {
        details.userId = objectId(details.userId)
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.ADDRESS_COLLECTION).insertOne(details).then((response) => {
                resolve()
            })

        })
    },
    getUserAddress: (Id) => {
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.ADDRESS_COLLECTION).find({ userId: objectId(Id) }).toArray()
            resolve(address)
        })
    },
    getAddressDetails: (adrsId) => {
        return new Promise(async (resolve, reject) => {
            let adrsDetails = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({ _id: objectId(adrsId) })
            resolve(adrsDetails)
        })
    },
    editAddress: (details) => {
        console.log('**********************');
        console.log(details);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADDRESS_COLLECTION).updateOne({ _id: objectId(details.addressId) }, {
                $set: {
                    Fname: details.Fname,
                    Lname: details.Lname,
                    country: details.country,
                    address: details.address,
                    town: details.town,
                    state: details.state,
                    pinCode: details.pinCode,
                    phone: details.phone,
                    email: details.email
                }
            }).then((response) => {
                resolve()
            })
        })
    },
    getOrderDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId) }).sort({ time: -1 }).toArray()
            resolve(order)

        })
    },
    getAllOrder: () => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).find().sort({ time: -1 }).toArray()
            resolve(order)

        })
    },
    generatePaypal: (orderId, total) => {
        return new Promise((resolve, reject) => {
            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:5000/success/" + orderId,
                    "cancel_url": "http://localhost:5000/cancel"
                },
                "transactions": [{
                    "amount": {
                        "currency": "USD",
                        "total": total
                    },
                    "description": "Hat for the best team ever"
                }]
            };
            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {
                    for (let i = 0; i < payment.links.length; i++) {
                        if (payment.links[i].rel === 'approval_url') {
                            let link = payment.links[i].href
                            resolve(link)
                        }
                    }
                }
            });




        })
    },
    getOrderProduct: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        status: '$products.status'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        status: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            console.log('...................');
            console.log(orderItems);
            resolve(orderItems)
        })

    },

    getUserCount: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).find().count().then((response) => {
                console.log(response);
                resolve(response)
            })
        })
    },
    getOneUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((response) => {
                resolve(response)
            })
        })
    },
    updateUserDetails: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(details.userId) }, {
                $set: {
                    name: details.name,
                    email: details.email,
                    phone: details.phone
                }
            }).then(() => {
                resolve()
            })
        })
    },
    changePassword: (details) => {
        return new Promise(async (resolve, reject) => {
            let oldPass = details.oldPass
            let newPass = details.newPass
            let conPass = details.conPass
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(details.userId) })
            let response = {}
            if (user) {
                bcrypt.compare(oldPass, user.password).then(async (status) => {
                    if (status) {
                        console.log("correct password sucess");
                        response.status = true
                        response.message = ""
                        if (newPass == conPass) {
                            conPass = await bcrypt.hash(conPass, saltRounds)
                            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(details.userId) }, {
                                $set: {
                                    password: conPass
                                }
                            }).then(() => {
                                response.status = true
                                response.message = ""
                                resolve(response)
                            })
                        } else {
                            response.message = "Password does not match"
                            resolve({ status: false })
                        }
                    } else {
                        console.log('incorrect password');
                        response.message = "Incorrect Password"
                        resolve({ status: false })
                    }
                })
            }
        })
    },
    getWalletDetails:(userId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WALLET_COLLECTION).findOne({userId:objectId(userId)}).then((response)=>{
                resolve(response)
            })
        })
    }





    // getCartCount:(userId)=>{
    //     return new Promise(async(reslove,reject)=>{
    //         let count=0;
    //         console.log(userId);
    //         let cart = await GamepadButton.get().collection
    //     })
    // }
}
