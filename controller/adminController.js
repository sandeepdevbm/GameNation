var express = require('express');
const { response } = require('../app');
const category_helpers = require('../helpers/category_helpers');
var router = express.Router();
var productHelper = require('../helpers/product-helpers');
var offerHelper = require('../helpers/offer-helpers')
const salesHelpers = require('../helpers/sales-helpers');
var userHelpers = require('../helpers/user-helpers');
var orderHelper = require('../helpers/order-helpers')
var couponHelper = require('../helpers/coupon-helpers')
const { upload, upload2 } = require('../public/javascripts/fileUpload')


module.exports.adminPage =  async (req, res, next) => {
    let topSelling = await productHelper.topSellingProducts()
    let UserCount = await userHelpers.getUserCount()
    let orderCount = await orderHelper.getOrderCount()
    let dailySales = await salesHelpers.dailySalesReport()
    let monthlySales = await salesHelpers.monthlySalesReport()
    let yearlySales = await salesHelpers.yearlySalesReport()
    let recentsales = await salesHelpers.recentsales()
    console.log(recentsales);
    res.render('admin', { admin: true, topSelling, UserCount, orderCount, dailySales, monthlySales, yearlySales ,recentsales });
  }

  module.exports.adminLogin = (req, res, next) => {
    res.render('admin', { admin: true });
  }

  module.exports.viewUsers = function (req, res, next) {
    productHelper.getAllUsers().then((userss) => {
      res.render('admin/view-users', { admin: true, userss });
    })
  }

  module.exports.viewProducts = (req, res) => {
    productHelper.getAllProducts().then((products) => {
      res.render('admin/view-products', { admin: true, products })
    })
  }
   module.exports.addPro = (req, res) => {
    category_helpers.categoryList().then((category) => {
      res.render('admin/add-product', { admin: true, category })
    })
  }
  module.exports.addProducts =(req, res, next) => {
    const files = req.files
    const fileName = files.map((file) => {
      return file.filename
    })
    const product = req.body
    product.img = fileName
    productHelper.addProduct(product).then((id) => {
      res.redirect('/admin/add-product')
    })
  }
//   module.exports.
//   module.exports.
//   module.exports.
//   module.exports.
//   module.exports.
//   module.exports.
//   module.exports.
//   module.exports.
//   module.exports.
//   module.exports.
//   module.exports.
