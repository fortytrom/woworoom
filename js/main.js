const $productWrap = document.querySelector('.productWrap');
const $overflowWrap = document.querySelector('#overflowWrap');
const $orderSubmit = document.querySelector('.orderInfo-btn');
const $customerName = document.querySelector('#customerName');
const $customerPhone = document.querySelector('#customerPhone');
const $customerEmail = document.querySelector('#customerEmail');
const $customerAddress = document.querySelector('#customerAddress');
const $tradeWay = document.querySelector('#tradeWay');
const form = document.querySelector('.orderInfo-form');
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
            <a href="javascript:;" id="addCardBtn" class="rd-addCart" data-id="${item.id}">加入購物車</a>
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
        totalContentHtml = "<div class='center'>目前尚無資料唷！</div>"
    } else {
        // 串好品項資料
        chartData.forEach(function (item, index) {
            let subtotal = `NT${toThousands(chartData[index].quantity * chartData[index].product.price)}`
            let nowPrice = `NT${toThousands(chartData[index].product.price)}`
            let content = `<tr data-cartid="${chartData[index].id}">
                        <td>
                            <div class="cardItem-title">
                                <img src="${chartData[index].product.images}" alt="">
                                <p class="chartProductTitle">${chartData[index].product.title}</p>
                            </div>
                        </td>
                        <td>${nowPrice}</td>
                        <td>${chartData[index].quantity}</td>
                        <td>${subtotal}</td>
                        <td class="discardBtn">
                            <a href="javascript:;" class="material-icons">
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
                        <a href="javascript:;" class="discardAllBtn">刪除所有品項</a>
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
    $overflowWrap.innerHTML = totalContentHtml;

}


getProductList()
getCartList()


// 加入購物車
$productWrap.addEventListener('click', function (e) {
    e.preventDefault();
    let $addCart = e.target.getAttribute('class');
    if ($addCart != "rd-addCart") {
        return;
    }
    let productId = e.target.getAttribute('data-id');
    let numCheck = 1;

    cartData.carts.forEach(function (item) {
        if (item.product.id === productId) {
            numCheck = item.quantity += 1;
        }
    })

    axios.post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`, {
        "data": {
            "productId": productId,
            "quantity": numCheck
        }
    }).then(function (response) {
        alert('加入購物車');
        getCartList();
    })

})

// 刪除整個購物車
$overflowWrap.addEventListener('click', function (e) {
    e.preventDefault();
    let $deletAllbtn = e.target.getAttribute('class');
    if ($deletAllbtn != "discardAllBtn") {
        return;
    }
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`).then(function (response) {
        alert('清空購物車囉！');    
        getCartList()
    })
});


// 刪掉單個購物車
$overflowWrap.addEventListener('click', function (e) {
    e.preventDefault();
    let $deletbtn = e.target.getAttribute('class');
    let idDom = "";
    if ($deletbtn != "material-icons") {
        return;
    }else{
        idDom = $deletbtn.parentNode;
    }
    let productId = e.path[2].getAttribute("data-cartid");
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts/${productId}`).then(function (response) {   
        let deletItem = e.path[2].childNodes[1].childNodes[0].nextElementSibling.childNodes[3].outerText; 
        getCartList()
        alert(`您已將${deletItem}刪掉囉！`)
    })
});



// 點了新增按鈕，表單檢核通過，要觸發新增資料
$orderSubmit.addEventListener('click', function (e) {
    e.preventDefault()
    let checkNameValue = checkName();
    let checkPhoneNumberValue = checkPhoneNumber();
    let checkEmailValue = checkEmail();
    let checkAddressValue = checkAddress();

    let isPass = checkNameValue[0]*checkPhoneNumberValue[0]*checkEmailValue[0]*checkAddressValue[0];

    if (isPass == 1) {


        axios.post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/orders`, 
            {
            "data": {
                "user": {
                    "name": String(checkNameValue[1]),
                    "tel": String(checkPhoneNumberValue[1]),
                    "email": String(checkEmailValue[1]),
                    "address": String(checkAddressValue[1]),
                    "payment": $tradeWay.value
                    }
                }
            }
            ).then(function (response) {
                alert('送出訂單囉！');
                form.reset();
                getCartList();
            })
    }
})

// 檢核名稱不得為空
function checkName() {
    let isPass = false;
    let inputValue = $customerName.value.trim();
    const $NameError = document.querySelector('#customerName ~ .orderInfo-message');
    if (inputValue == "") {
        $NameError.textContent = "必填"
        $NameError.setAttribute('style', "display:block;")
    } else {
        $NameError.setAttribute('style', "display:none;")
        isPass = true
    }
    return [isPass, inputValue]
}

// 檢核電話
function checkPhoneNumber() {
    let isPass = false;
    let inputValue = $customerPhone.value.trim();
    const $PhoneError = document.querySelector('#customerPhone ~ .orderInfo-message');
    if ( inputValue == "") {
        $PhoneError.textContent = "必填"
        $PhoneError.setAttribute('style', "display:block;")
    } else if(isNaN(inputValue)){
        $PhoneError.textContent = "請輸入數字"
        $PhoneError.setAttribute('style', "display:block;")
    }else if ( !/^09[0-9]{8}$/.test(inputValue) ) {
        $PhoneError.textContent = "請輸入正確格式"
        $PhoneError.setAttribute('style', "display:block;")
    } else {
        $PhoneError.setAttribute('style', "display:none;")
        isPass = true
    }
    return [isPass, inputValue]
}


// 檢核電話
function checkEmail() {
    let isPass = false;
    let inputValue = $customerEmail.value.trim();
    const $emailError = document.querySelector('#customerEmail ~ .orderInfo-message');
    if ( inputValue == "") {
        $emailError.textContent = "必填"
        $emailError.setAttribute('style', "display:block;")
    } else {
        $emailError.setAttribute('style', "display:none;")
        isPass = true
    }
    return [isPass, inputValue]
}



// 檢核寄送地址必填
function checkAddress() {
    let isPass = false;
    let inputValue = $customerAddress.value.trim();
    const $AddressError = document.querySelector('#customerAddress ~ .orderInfo-message');
    if (inputValue == "") {
        $AddressError.textContent = "必填"
        $AddressError.setAttribute('style', "display:block;")
    } else {
        $AddressError.setAttribute('style', "display:none;")
        isPass = true
    }
    return [isPass, inputValue]
}