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
const { upload, upload2 } = require('../public/javascripts/fileUpload');
const { adminPage, adminLogin, viewUsers, viewProducts, addPro, addProducts } = require('../controller/adminController');



// router.get('/admin-login', function(req, res, next) {

//   if(req.session.loggedin)
//   {
//     res.redirect('/admin-login')
//   }
//   else
//   { 
//     res.render('admin',{admin:true});
//   }
// });


// let error1=""
// const admin={
//   username:"admin",
//   password:"pass"
// }



/* ------------------------------ADMIN LOGIN---------------------------- */
router.get('/', function (req, res, next) {
  res.render('admin/admin-login');
});

router.get('/admin-login', adminPage )

router.post('/admin-login', adminLogin );
  // if(req.body.username===admin.username && req.body.password===admin.password)
  // {
  //   error1=""
  //   req.session.loggedin=true;
  //   res.render('admin',{admin:true});
  // }else{
  //   error1="* Invalid Username or Password"
  //   res.redirect('/admin');
  // }



router.get('/view-users', viewUsers);

router.get('/view-products', viewProducts )

router.get('/add-product', addPro)

// router.post('/add-products',(req,res)=>{
//   console.log(req.body);
//   // console.log(req.files.image);
//   productHelper.addProduct(req.body).then((id)=>{
//     console.log(id);
//     let image=req.files.image
//     image.mv('./public/product-images/'+id+'.jpg',(err,data)=>{
//       if(!err){
//         res.redirect('/admin/add-product')
//       }
//       else{
//         console.log(err)
//       }
//     })
//   })

// })

router.post('/add-products', upload.array('image'), addProducts )

router.get('/block/:id', (req, res) => {
  let userId = req.params.id
  userHelpers.blockUser(userId).then(() => {
    res.redirect('/admin/view-users')
  })
})

router.get('/unblock/:id', (req, res) => {
  userHelpers.unblockUser(req.params.id).then(() => {
    res.redirect('/admin/view-users')
  })

})

router.get('/adminsignout', (req, res) => {
  res.redirect('/admin')
})

router.get("/delete-products/:id", (req, res) => {
  let proId = req.params.id
  productHelper.deleteProducts(proId).then((response) => {
    res.redirect('/admin/view-products')
  })
})

// router.get('/edit-products/:id',async(req,res)=>{
//   let product= await productHelper.getProductDetails(req.params.id)
//   console.log(product);
//   res.render('admin/edit-products',{product,admin:true})
// })



router.get('/edit-products/:id', async (req, res) => {
  let product = await productHelper.getDetailedProduct(req.params.id)
  let category = await category_helpers.categoryList()
  let oneCat = await category_helpers.getOneCategory(product[0].Category)
  res.render('admin/edit-products', { product: product[0], admin: true, category, oneCat })
})


// router.post('/edit-products/:id',(req,res)=>{
//   console.log(req.params.id);
//   let id=req.params.id
//   productHelper.updateProduct(req.params.id,req.body).then(()=>{
//     res.redirect('/admin/view-products')
//     if (req.files.image){
//       let image=req.files.image
//       image.mv('./public/product-images/'+id+'.jpg')
//     }

//   })
// }) 

router.post('/edit-products/:id', upload.array('image'), (req, res) => {
  let id = req.params.id
  productHelper.getProductDetails(req.params.id).then((products) => {
    // res.redirect('/admin/view-products')
    if (req.files != 0) {
      const files = req.files
      const fileName = files.map((file) => {
        return file.filename
      })
      var product = req.body
      product.img = fileName
    }
    else {
      var product = req.body
      product.img = products.img
    }
    productHelper.updateProduct(req.params.id, product).then(() => {
      res.redirect('/admin/view-products')
    })
  })
})

router.get('/add-category', (req, res) => {
  res.render('admin/add-category', { admin: true })
})

router.post('/add-categories', (req, res) => {
  category_helpers.addCategory(req.body).then((response) => {
    res.redirect('/admin/add-category')
  })
})

router.get('/category-list', (req, res) => {
  category_helpers.categoryList().then((category) => {
    res.render('admin/category-list', { admin: true, category })
  })
})

router.get("/delete-category/:id", (req, res) => {
  let catId = req.params.id
  category_helpers.deleteCategory(catId).then((response) => {
    res.redirect('/admin/category-list')
  })
})
router.get('/edit-category/:id', async (req, res) => {
  let category = await category_helpers.getCategoryDetails(req.params.id)
  res.render('admin/edit-category', { category, admin: true })
})

router.post('/edit-category/:id', (req, res) => {
  let id = req.params.id
  category_helpers.updateCategory(id, req.body).then(() => {
    res.redirect('/admin/category-list')
  })
})

router.get('/view-orders', async (req, res) => {
  let order = await userHelpers.getAllOrder()
  res.render('admin/view-orders', { admin: true, order })
})

router.get('/salesManagement', async (req, res) => {
  let dailySales = await salesHelpers.dailySalesReport()
  let monthlySales = await salesHelpers.monthlySalesReport()
  let yearlySales = await salesHelpers.yearlySalesReport()
console.log("jjjjjjjjjjjj");
  console.log(dailySales);
  res.render('admin/sales-management', { admin: true, dailySales, monthlySales, yearlySales })
})

router.get('/cancel-order-product/:id', (req, res) => {
  orderHelper.cancelOrder(req.params.id).then((response) => {
    res.redirect('/admin/view-orders')
  })

})


router.get('/add-productOffer', async (req, res) => {
  let products = await productHelper.getAllProducts()
  res.render('admin/add-productOffer', { admin: true, products })

})

router.post('/productOffers/:id', (req, res) => {
  let proId = req.params.id
  offerHelper.addProductOffer(proId, req.body).then(() => {
    res.redirect('/admin/add-productOffer')
  })
})

router.get('/delete-productOffer/:id', (req, res) => {
  let proId = req.params.id
  offerHelper.deleteProductOffer(proId).then((response) => {
    res.redirect('/admin/add-productOffer')
  })
})


router.get('/add-categoryOffer', async (req, res) => {
  let category = await category_helpers.getCategoryProducts()
  res.render('admin/add-categoryOffer', { admin: true, category })

})


router.post('/updateStatus', (req, res) => {
  let stat = req.body
  orderHelper.updateStatus(stat).then(() => {
    res.json({ status: true })

  })
})

router.get('/coupon', (req, res) => {
  res.render('admin/add-coupon', { admin: true })
})

router.post('/add-coupon', (req, res) => {
  couponHelper.addCoupon(req.body).then(() => {
    res.redirect('/admin/coupon')
  })
})

router.post("/categoryOffers/:id", (req, res) => {
  let catId = req.params.id
  offerHelper.addCategoryOffer(catId, req.body).then(() => {
    res.redirect('/admin/add-categoryOffer')
  })
})


router.get('/viewCoupon', async (req, res) => {
  let coupon = await couponHelper.getCoupons()
  res.render('admin/view-coupon', { admin: true, coupon })
})


router.get('/delete-coupon/:id', (req, res) => {
  couponHelper.deleteCoupon(req.params.id).then(() => {
    res.redirect('/admin/viewCoupon')
  })
})

router.get('/delete-categoryOffer/:id', (req, res) => {
  let catId = req.params.id
  offerHelper.deleteCategoryOffer(catId)
})


router.get('/view-order-product/:id', async (req, res) => {
  let products = await userHelpers.getOrderProduct(req.params.id)
  res.render('admin/view-orderProducts', { admin: true, products })
})

module.exports = router;