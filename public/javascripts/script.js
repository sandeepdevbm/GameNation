

function addToCart(proId) {
    console.log('addtocatrnc')
    $.ajax({
        url: '/add-to-cart/' + proId,
        method: 'get',
        success: (response) => {
            console.log(response)
            if (response.status) {
                swal("Good job!", "Product Successfully Added", "success");
                $("#cart-count").html(response.count)
            } else {
                $("#sign-modal").modal('show')
            }

        }
    })
}


function addToWishlist(proId) {
    $.ajax({
        url: '/add-to-wishlist/'+proId,
        method: 'get',
        success: (response) => {
            console.log(response)
            if (response.status) {
                swal("Good job!", "Product Successfully Added", "success");
                $("#wishlist-count").html(response.count)
            } else {
                $("#sign-modal").modal('show')
            }

        }
    })
}