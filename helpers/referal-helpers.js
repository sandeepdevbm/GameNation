var db = require("../config/connection")
var collection = require('../config/collections')
var objectId = require("mongodb").ObjectId
var voucher_codes = require('voucher-code-generator');

module.exports = {
    addWallet: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WALLET_COLLECTION).insertOne({
                userId: userId,
                balance: parseInt(0),
                transaction: []
            })
            resolve()
        })
    },
    referalCredit: (reff, amount) => {
        amount = parseInt(amount)
        return new Promise(async (resolve, reject) => {
            let referal = await db.get().collection(collection.USER_COLLECTION).findOne({ referals: reff.referals })
            if (referal) {
                referaldata = {
                    amount: amount,
                    date: new Date().toDateString(),
                    timestamp: new Date(),
                    status: "credited",
                    message: 'Referral Amount'
                }
                db.get().collection(collection.WALLET_COLLECTION).updateOne({ userId: referal._id }, {
                    $inc: {
                        balance: amount
                    },
                    $push: {
                        transaction: referaldata
                    }
                })
            }
            resolve()
        })
    },
    addCredit: (userId) => {
        return new Promise(async (resolve, reject) => {
            referaldata = {
                amount: parseInt(50),
                date: new Date().toDateString(),
                timestamp: new Date(),
                status: "credited",
                message: 'Referral Amount'
            }
            await db.get().collection(collection.WALLET_COLLECTION).updateOne({ userId: objectId(userId) },
                {
                    $inc: {
                        balance: parseInt(50)
                    },
                    $push: {
                        transaction: referaldata
                    }
                })
            resolve()
        })
    }
}

