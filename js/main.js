const $productWrap = document.querySelector('.productWrap');
let productData = [];
let cartData = [];
// 拉API顯示商品資訊
function getProductList() {
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/products`).then(function (response) {
        productData = response.data.products;
        showProductList(productData)
        filter(productData)
    })
}

// 拉API顯示購物車資訊
function getCartList() {
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`).then(function (response) {
        cartData = response.data;
        showCarts(cartData);
    })
}

// 於畫面上顯示產品
function showProductList(data) {
    let renderHtmlProduct = "";
    data.forEach(function (item) {
        let originPrice = `NT${toThousands(item.origin_price)}`
        let nowPrice = `NT${toThousands(item.price)}`
        let content =
            `<li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${item.images}" alt="">
            <a href="#" id="addCardBtn" class="rd-addCart" data-id="${item.id}">加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">${originPrice}</del>
            <p class="nowPrice">${nowPrice}</p>
        </li>`
        renderHtmlProduct += content
    })
    $productWrap.innerHTML = renderHtmlProduct;
}

// 加上千分位
function toThousands(money) {
    let a = String(money)
    let result = a.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
    return result
}

// 篩選產品
function filter(data) {
    const $productSelect = document.querySelector('.productSelect');
    $productSelect.addEventListener('change', function (e) {
        let nowFilter = e.target.value;
        if (nowFilter == "全部") {
            showProductList(data)
        } else {
            let newAry = data.filter(function (item) {
                return item.category == e.target.value;
            })
            showProductList(newAry)
        }
    })
}

// 於畫面上顯示購物車
function showCarts(cartsItem) {

    let chartData = cartsItem.carts;
    let renderHtmlCarts = "";
    let finalToTal = 0;
    let totalContentHtml = "";
    if (chartData.length < 1) {
        totalContentHtml = "目前尚無資料唷！"
    } else {
        // 串好品項資料
        chartData.forEach(function (item, index) {
            let subtotal = `NT${toThousands(chartData[index].quantity * chartData[index].product.price)}`
            let nowPrice = `NT${toThousands(chartData[index].product.price)}`
            let content = `<tr data-cartid="${chartData[index].id}">
                        <td>
                            <div class="cardItem-title">
                                <img src="${chartData[index].product.images}" alt="">
                                <p>${chartData[index].product.title}</p>
                            </div>
                        </td>
                        <td>${nowPrice}</td>
                        <td>${chartData[index].quantity}</td>
                        <td>${subtotal}</td>
                        <td class="discardBtn">
                            <a href="#" class="material-icons">
                                clear
                            </a>
                        </td>
                    </tr>`
            renderHtmlCarts += content;
            finalToTal += chartData[index].quantity * chartData[index].product.price;
        })

        // 加表頭表尾
        totalContentHtml =
            `<table class="shoppingCart-table">
                <tr>
                    <th width="40%">品項</th>
                    <th width="15%">單價</th>
                    <th width="15%">數量</th>
                    <th width="15%">金額</th>
                    <th width="15%"></th>
                </tr>
                ${renderHtmlCarts}
                <tr>
                    <td>
                        <a href="#" class="discardAllBtn">刪除所有品項</a>
                    </td>
                    <td></td>
                    <td></td>
                    <td>
                        <p>總金額</p>
                    </td>
                    <td>NT${toThousands(finalToTal)}</td>
                </tr>
            </table>`

    }

    const $overflowWrap = document.querySelector('#overflowWrap');
    $overflowWrap.innerHTML = totalContentHtml;

}


function getCartsList(cartsItem) {

}



getProductList()
getCartList()

// 綁加入購物車按鈕
$productWrap.addEventListener('click', function (e) {
    e.preventDefault();
    let $addCart = e.target.getAttribute('class');
    if ($addCart != "rd-addCart") {
        return;
    }
    let productId = e.target.getAttribute('data-id');
    let numCheck = 1;

    cartData.carts.forEach(function (item,index) {
        if (item.product.id == productId) {
            numCheck = item.quantity += 1;
            axios.post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`, {
                "data": {
                    "productId": productId,
                    "quantity": numCheck
                }
            }).then(function (response) {
                console.log(response)
                alert('加入購物車');
                showCarts(response.data)
            })
        }

    })

})