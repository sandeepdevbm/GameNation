var express = require('express');
const { Db } = require('mongodb');
var router = express.Router();
var userHelper = require('../helpers/user-helpers')
var productHelper = require('../helpers/product-helpers')
var categoryHelpers = require('../helpers/category_helpers');
var orderHelper = require('../helpers/order-helpers')
var couponHelper = require('../helpers/coupon-helpers')
var voucher_codes = require('voucher-code-generator');
const dotenv = require('dotenv').config()


const { response } = require('../app');


const { homepage, userSignup, userLogin, userSignout, userOtpLogin, 
  otpSendcode, verifyOtp, displayProducts, getCategories, viewCart,
   addProductsToCart, changeCartProductQuantity,removeCartProduct, 
   getUserCheckout, placeOrder, paymentVerification, paymentSuccess, 
   viewWishlist, addToWishlist, deleteWishlistProd, userAccount, 
   createUserAddress, getUserAddress, editAddress, viewOrderedProducts,
    cancelOrderedProduct, applyCoupon, searchProduct, changeUserDetails, changeUserPassword } = require('../controller/userController');



let err = ""



let YOUR_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
let YOUR_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN



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


/*-----------------------------------------HOME PAGE--------------------------------------- */
router.get('/', homepage );


/*-----------------------------------------USER SIGNUP--------------------------------------- */
router.post('/signup', userSignup )


/*-----------------------------------------USER LOGIN--------------------------------------- */
router.post('/login', userLogin )


/*-----------------------------------------USER SIGNOUT--------------------------------------- */
router.get('/signout', userSignout )


/*-----------------------------------------USER OTP LOGIN--------------------------------------- */
router.get('/otpSignin', userOtpLogin )
router.post("/sendcode", otpSendcode );
router.post("/verify", verifyOtp );


/*-----------------------------------------DISPLAY PRODUCTS--------------------------------------- */
router.get('/display-product/:id', displayProducts )


/*-----------------------------------------GET CATEGORIES--------------------------------------- */
router.get('/categories/:id', getCategories )




/*=================================================CART=====================================================*/

/*-----------------------------------------VIEW CART--------------------------------------- */
router.get('/view-cart', validation, viewCart )

/*-----------------------------------------ADD TO CART--------------------------------------- */
router.get('/add-to-cart/:id', addProductsToCart )

/*-----------------------------------------CHANGE CART QUANTITY--------------------------------------- */
router.post('/change-product-quantity', changeCartProductQuantity )

/*-----------------------------------------REMOVE CART PRODUCTS--------------------------------------- */
router.delete('/cart-product', removeCartProduct )




/*-----------------------------------------USER CHECKOUT--------------------------------------- */
router.get('/checkout', validation, getUserCheckout )


/*-----------------------------------------USER PLACEORDER--------------------------------------- */
router.post("/checkout", placeOrder )


/*-----------------------------------------PAYMENT VERIFICATION--------------------------------------- */
router.post('/verify-payment', paymentVerification )


/*-----------------------------------------PAYMENT SUCCESS--------------------------------------- */
router.get('/success/:id', paymentSuccess )


/*-----------------------------------------CANCEL PAYPAL PAYMENT--------------------------------------- */
router.get('/cancel', (req, res) => res.redirect('/view-order'));


/*-----------------------------------------VIEW WISHLIST--------------------------------------- */
router.get('/wishlist', validation, viewWishlist )


/*-----------------------------------------ADD TO WISHLIST--------------------------------------- */
router.get('/add-to-wishlist/:id', addToWishlist )


/*-----------------------------------------REMOVE WISHLIST PRODUCT--------------------------------------- */
router.delete('/wishlist-product', deleteWishlistProd )


/*-----------------------------------------USER ACCOUNT DETAILS--------------------------------------- */
router.get('/my-account', validation, userAccount )


/*-----------------------------------------CREATE NEW ADDRESS--------------------------------------- */
router.post('/create-address', createUserAddress )


/*-----------------------------------------GET USER ADDRESS--------------------------------------- */
router.get('/get-address-details/:id', getUserAddress )


/*-----------------------------------------UPDATE USER ADDRESS--------------------------------------- */
router.post('/edit-address', editAddress )


/*-----------------------------------------ORDERED PRODUCTS--------------------------------------- */
router.get('/view-order-products/:id', validation, viewOrderedProducts )


/*-----------------------------------------CANCEL ORDERED PRODUCT--------------------------------------- */
router.post('/cancel-order-product', cancelOrderedProduct )


/*-----------------------------------------APPLY COUPON--------------------------------------- */
router.get('/applyCouponOffer/:id', validation, applyCoupon )


/*-----------------------------------------SEARCH--------------------------------------- */
router.post('/search', searchProduct )


/*-----------------------------------------UPDATE USER DETAILS--------------------------------------- */
router.post('/change-userDetails', changeUserDetails)


/*-----------------------------------------CHANGE USER PASSWORD--------------------------------------- */
router.post('/change-userPassword', changeUserPassword)



module.exports = router;
