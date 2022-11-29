var express = require('express');
const { Db } = require('mongodb');
var router = express.Router();
var userHelper = require('../helpers/user-helpers')
var productHelper = require('../helpers/product-helpers')
var categoryHelpers = require('../helpers/category_helpers');
var orderHelper = require('../helpers/order-helpers')
var couponHelper = require('../helpers/coupon-helpers')
var voucher_codes = require('voucher-code-generator');

const { response } = require('../app');

const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.PaypalClientId,
  'client_secret': process.env.PaypalClientSecret
});

let err = ""



let YOUR_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
let YOUR_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN

let usertransfer

const client = require("twilio")(
  YOUR_ACCOUNT_SID,
  YOUR_AUTH_TOKEN
);



function validation(req, res, next) {
  console.log("Validation")

  if (req.session.userloggedIn) {
    next()
  }
  else {
    console.log("false")
    res.redirect('/')
  }
}


module.exports.homepage = (req, res, next)=> {
    // let cartCount=null;
  
    let cartCount = null
    categoryHelpers.categoryList().then(async (category) => {
      await productHelper.getAllProducts().then(async (products) => {
  
        if (req.session.userloggedIn) {
          let person = req.session.user;
          let users = await productHelper.getUserDetails(req.session.user._id)
          let cartCount = await userHelper.getCartCount(req.session.user._id)
          let wishlistCount = await userHelper.getWishlistCount(req.session.user._id)
  
          res.render('index', { products, person, user: true, category, cartCount, users, wishlistCount })
        } else {
          res.render('index', { products, category, user: true });
        }
      })
    }) 
   
  }
 module.exports.userSignup = (req, res) => {
    req.body.status = true
    userHelper.doSignup(req.body).then((response) => {
      res.json(response)
    })
  
  }

  module.exports.userLogin = (req, res) => {

    userHelper.doLogin(req.body).then((response) => {
      categoryHelpers.categoryList().then((category) => {
        if (response.status && response.user.status) {
          req.session.user = response.user
          req.session.userloggedIn = true
          let userDetails = req.session.user
          res.json('success')
        } else {
          req.session.userloggedIn = false
          res.json('incorrect username or password')
        }
      })
    })
  }

  module.exports.userSignout = (req, res) => {
    req.session.userloggedIn = false
    delete req.session.user
    res.redirect('/')
  }

  module.exports.userOtpLogin = (req, res) => {
    res.render('user/user-login', { user: true })
  }

  module.exports.otpSendcode = (req, res) => {
    userHelper.getPhoneNumber(req.body.phone).then((response) => {
      usertransfer = response.user
      if (response.status == true) {
        client.verify
          .services('VAe9b8e1032522835a9d3fcffc587053d6') // Change service ID
          .verifications.create({
            to: `+91${req.body.phone}`,
            channel: "sms",
          })
          .then((data) => {
            let response = {
              message: "Verification is sent!!",
              phonenumber: req.body.phone,
              data,
            }
            res.render('user/enter-otp', { user: true })
  
          }).catch((err) => { console.log(err) })
  
      }
      else {
        error1 = "Mobile Number is not linked to any accounts";
        res.redirect('otpSignin')
      }
  
    })
  }
  module.exports.verifyOtp = (req, res) => {

    client.verify
      .services('VAe9b8e1032522835a9d3fcffc587053d6') // Change service ID
      .verificationChecks.create({
        to: `+91${usertransfer.phone}`,
        code: req.body.code,
      })
      .then((data) => {
        if (data.status === "approved") {
          req.session.userloggedIn = true
          req.session.user = usertransfer
          res.redirect('/')
        } else {
          res.redirect('/otpSignin')
        }
      });
  }

  module.exports.displayProducts = (req, res) => {
    productHelper.getProduct(req.params.id).then(async (products) => {
      if (req.session.userloggedIn) {
        let cartCount = await userHelper.getCartCount(req.session.user._id)
        let person = req.session.user
        res.render('user/display-product', { user: true, products:products[0], person, cartCount })
      } else {
        res.render('user/display-product', { user: true, products:products[0] })
      }
  
    })
  
  }
  module.exports.getCategories = (req, res) => {
    productHelper.categoryProducts(req.params.id).then(async (products) => {
      let cat = await categoryHelpers.getCategoryDetails(req.params.id)
      if (req.session.userloggedIn) {
        let cartCount = await userHelper.getCartCount(req.session.user._id)
        let wishlistCount = await userHelper.getWishlistCount(req.session.user._id)
  
        let person = req.session.user;
        res.render('user/view-products', { person, user: true, products, cat, wishlistCount, cartCount })
      } else {
        res.render('user/view-products', { user: true, products, cat })
      }
  
    })
  }
  module.exports.viewCart = async (req, res) => {
    let person = req.session.user._id;
    let products = await userHelper.getCartProducts(req.session.user._id)
    let total = 0
    if (products.length > 0) {
      total = await userHelper.getTotalAmount(req.session.user._id)
    }
    res.render('user/view-cart', { person, products, total, user: true })
  
  }
  module.exports.addProductsToCart = (req, res) => {
    if (req.session.user) {
      userHelper.addToCart(req.params.id, req.session.user._id).then(async () => {
        let count = await userHelper.getCartCount(req.session.user._id)
        res.json({ status: true, count })
  
      })
    } else {
      res.json({ status: false })
    }
  
  
  }
  module.exports.changeCartProductQuantity = (req, res) => {
    userHelper.changeProductQuantity(req.body).then(async (response) => {
      response.total = await userHelper.getTotalAmount(req.body.user)
      res.json(response)
  
    })
  }
  module.exports.removeCartProduct = (req, res) => {
    userHelper.removeCartProduct(req.body).then((response) => {
      res.json(response)
    })
  }
  module.exports.getUserCheckout = async (req, res) => {
    let total = await userHelper.getTotalAmount(req.session.user._id)
    let address = await userHelper.getUserAddress(req.session.user._id)
    let products = await userHelper.getCartProducts(req.session.user._id)
    let coupon = await couponHelper.getAllCoupon(req.session.user._id)
    let person = req.session.user
    res.render('user/checkout', { person, total, address, coupon, products, user: true })
  }
  module.exports.placeOrder = async (req, res) => {
    let products = await userHelper.getCartProductList(req.body.userId)
    if (req.body.newTotal) {
      totalPrice = parseFloat(req.body.newTotal)
      couponHelper.pushUser(req.body.couponName, req.session.user._id)
    } else {
  
      totalPrice = await userHelper.getTotalAmount(req.body.userId)
  
    }
    userHelper.placeOrder(req.body, products, totalPrice).then(async (orderId) => {
      if (req.body.paymentMethod === 'COD') {
        let response = { paymentMethod: 'COD' }
        res.json(response)
      } else if (req.body.paymentMethod == 'Razorpay') {
        userHelper.generateRazorpay(orderId, totalPrice).then((data) => {
          let response = {
            paymentMethod: 'Razorpay',
            razorpayDetails: data
          }
          res.json(response)
        })
      } else if (req.body.paymentMethod == 'Paypal') {
        data = await userHelper.generatePaypal(orderId, totalPrice)
        let response = {
          paymentMethod: "Paypal",
          paypalDetails: data
        }
        res.json(response)
      }
  
    })
  }
  module.exports.paymentVerification = (req, res) => {
    userHelper.verifyPayment(req.body).then(() => {
      userHelper.changePaymentStatus(req.body['order[receipt]']).then(() => {
        res.json({ status: true })
      })
    }).catch((err) => {
      res.json({ status: false })
    })
  }
  module.exports.paymentSuccess = (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    let orderId = req.params.id
  
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
        "amount": {
          "currency": "USD",
          "total": "25.00"
        }
      }]
    };
  
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        console.log(JSON.stringify(payment));
        userHelper.changePaymentStatus(orderId).then(() => {
          res.redirect('/my-account');
        })
  
      }
    });
  
  }
  module.exports.viewWishlist = async (req, res) => {
    let person = req.session.user._id;
    let products = await userHelper.getWishlistProducts(req.session.user._id)
    res.render('user/wishlist', { person, products, user: true })
  }
  module.exports.addToWishlist = (req, res) => {
    if (req.session.user) {
      userHelper.addToWishlist(req.params.id, req.session.user._id).then(async () => {
        let count = await userHelper.getWishlistCount(req.session.user._id)
        res.json({ status: true, count })
  
      })
    } else {
      res.json({ status: false })
    }
  }
   module.exports.deleteWishlistProd = (req, res) => {
    userHelper.removeWishlistProduct(req.body).then((response) => {
      res.json(response)
    })
  }
  module.exports.userAccount = async (req, res) => {
    let person = req.session.user
    let products = await userHelper.getOrderProducts(req.session.user._id)
    let address = await userHelper.getUserAddress(req.session.user._id)
    let order = await userHelper.getOrderDetails(req.session.user._id)
    let usr = await userHelper.getOneUser(req.session.user._id)
    let wallet = await userHelper.getWalletDetails(req.session.user._id)
    console.log("[[[[[[[[[[[[[");
    console.log(wallet);
    res.render('user/myAccount', { user: true, person, address, products, order, usr , wallet })
  }
  module.exports.createUserAddress = (req, res) => {
    userHelper.addAddress(req.body).then((response) => {
      res.json('success')
    })
  }
  module.exports.getUserAddress = async (req, res) => {
    if (req.session.user) {
      let addrs = await userHelper.getAddressDetails(req.params.id)
      res.json(addrs)
    }
  }
  module.exports.editAddress = (req, res) => {
    userHelper.editAddress(req.body).then((response) => {
      res.json('success')
    })
  }
  module.exports.viewOrderedProducts = async (req, res) => {
    let products = await userHelper.getOrderProduct(req.params.id)
    console.log('ssssssssssss');
    console.log(products);
    let person = req.session.user._id
    res.render('user/view-order-product', { user: true, products, person })
  }
 module.exports.cancelOrderedProduct = (req, res) => {
  console.log("kkkkkkkkkkkkkkk");
  console.log(req.body);
    orderHelper.cancelOrder(req.body).then((response) => {
      res.redirect('/my-account')
    })
  }
  module.exports.applyCoupon = (req, res) => {
    let couponId = req.params.id
    couponHelper.getCouponDetails(couponId).then((details) => {
      res.json(details)
    })
  }
  module.exports.searchProduct = (req, res) => {
    productHelper.searchProducts(req.body).then((products) => {
      res.render('user/view-products', { user: true, products })
    })
  }
 module.exports.changeUserDetails = (req,res)=>{
    userHelper.updateUserDetails(req.body).then(()=>{
      res.json('success')
    })
  }
  module.exports.changeUserPassword = (req,res)=>{
    userHelper.changePassword(req.body).then((response)=>{
      res.json(response)
    })
  }
//   module.exports.

