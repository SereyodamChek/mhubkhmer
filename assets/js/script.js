$(document).ready(function () {
  let body = $("body");
  let iconTogger = $("#iconTogger");
  let navlist = $(".navlist");
  let wrapperForm = $(".warpper_form");
  let menuOption = 0;

  let links = $(".navlist li a");

  activeLink();
  getProduct();

  function activeLink() {
    links.each(function () {
      $(this).on("click", function () {
        links.each(function () {
          $(this).removeClass("active");
        });
        $(this).addClass("active");
      });
    });
  }

  heroImgClick();

  // Declare array of components
  let pages = [
    "home.html",
    "about.html",
    "menu.html",
    "service.html",
    "contact.html",
    "team.html",
    "recommand.html",
  ];

  // responsive click button menu
  iconTogger.on("click", function () {
    navlist.toggleClass("active");
    iconTogger.toggleClass("fa-xmark");
  });

  navlist.on("click", function () {
    $(this).removeClass("active");
    iconTogger.removeClass("fa-xmark");
  });

  $("#signUp").click(function () {
    wrapperForm.toggleClass("active");
  });

  body.on("click", ".navlist .menu", function () {
    let eThis = $(this);
    menuOption = eThis.data("option");
    $("body .page").load(
      "components/" + pages[menuOption],
      function (responseTxt, statusTxt, xhr) {
        if (statusTxt === "success") {
          heroImgClick();
          getProduct();
        }
        if (statusTxt === "error") {
          alert("Error: " + xhr.status + ": " + xhr.statusText);
        }
      }
    );
  });

  // click hero img
  function heroImgClick() {
    let imgs = $(".hero_image_slider img");
    let heroImg = $(".main_hero_image");
    imgs.each(function () {
      $(this).on("click", function () {
        let src = $(this).attr("src");
        heroImg.attr("src", src);
      });
    });
  }

  // event for add to cart and close
  body.on("click", "#iconCart", function () {
    $(".main_container").toggleClass("show_cart");
  });

  body.on("click", ".close", function () {
    $(".main_container").removeClass("show_cart");
  });

  function getProduct() {
    let listProductHTML = $(".product_list");
    let listCartHTML = $(".list_cart");
    let iconCartSpan = $(".add_cart span");
    let listProducts = [];
    let carts = [];
    let totalProductPriceElement = $("body .total"); // This is the DOM element
    let totalPrice = 0; // Initialize total price as a number
    let checkOutButton = $("body .check_out");

    // Add product to HTML
    const showProducts = (arrayProduct) => {
      const displayProduct = arrayProduct
        .map((product) => {
          return `
                <article class="card_product" data-id="${product.id}">
                    <div class="card_produc_img">
                        <img src="${product.img}" alt="" />
                    </div>
                    <p class="product_name">${product.name}</p>
                    <p class="product_price">$${product.price}</p>
                    <button class="btn_cart">កម្មងអីឡូវនេះ</button>
                </article>
            `;
        })
        .join("");

      listProductHTML.html(displayProduct);
    };

    listProductHTML.on("click", ".btn_cart", function (event) {
      let product_id = $(this).parent().data("id");
      addToCart(product_id);
    });

    const addToCart = (product_id) => {
      let positionThisProductInCart = carts.findIndex(
        (value) => value.product_id == product_id
      );
      if (carts.length <= 0) {
        carts = [{ product_id: product_id, quantity: 1 }];
      } else if (positionThisProductInCart < 0) {
        carts.push({ product_id: product_id, quantity: 1 });
      } else {
        carts[positionThisProductInCart].quantity += 1;
      }
      addCartToHTML();
      addCartToMemory();
    };

    const addCartToMemory = () => {
      localStorage.setItem("cart", JSON.stringify(carts));
    };

    const addCartToHTML = () => {
      listCartHTML.empty();
      let totalQuantity = 0;
      totalPrice = 0; // Reset total price before recalculating
      if (carts.length > 0) {
        carts.forEach((cart) => {
          totalQuantity += cart.quantity;
          let positionProduct = listProducts.findIndex(
            (value) => value.id == cart.product_id
          );
          let info = listProducts[positionProduct];
          let newCart = $(`
                    <article class="item_cart" data-id="${cart.product_id}">
                        <div class="img_cart">
                            <img src="${info.img}" alt="" />
                        </div>
                        <div class="name_cart">${info.name}</div>
                        <div class="total_price">$${(
              info.price * cart.quantity
            ).toFixed(2)}</div>
                        <div class="quantity">
                            <span class="minuss">-</span>
                            <span>${cart.quantity}</span>
                            <span class="pluss">+</span>
                        </div>
                    </article>
                `);
          listCartHTML.append(newCart);

          // Add to the total price
          totalPrice += info.price * cart.quantity;
        });
      }
      iconCartSpan.text(totalQuantity);

      // Update total price in HTML
      totalProductPriceElement.text(`$${totalPrice.toFixed(2)}`); // Update total price
    };

    listCartHTML.on("click", ".minuss, .pluss", function (event) {
      let product_id = $(this).closest(".item_cart").data("id");
      let type = $(this).hasClass("pluss") ? "pluss" : "minuss";
      changeQuantity(product_id, type);
    });

    const changeQuantity = (product_id, type) => {
      let positionItemInCart = carts.findIndex(
        (value) => value.product_id == product_id
      );
      if (positionItemInCart >= 0) {
        if (type === "pluss") {
          carts[positionItemInCart].quantity += 1;
        } else {
          let valueChange = carts[positionItemInCart].quantity - 1;
          if (valueChange > 0) {
            carts[positionItemInCart].quantity = valueChange;
          } else {
            carts.splice(positionItemInCart, 1);
          }
        }
      }
      addCartToMemory();
      addCartToHTML();
    };

    const handleCheckout = () => {
      if (carts.length > 0) {
        let invoice =
          "វិកាយប័ត្រ:\n--------------------------------------------\n";
        let total = 0;

        carts.forEach((cart) => {
          let product = listProducts.find((item) => item.id == cart.product_id);
          invoice += `${product.name} - ចំនួន: ${cart.quantity} - តម្លៃ: $${(
            product.price * cart.quantity
          ).toFixed(2)}\n`;
          total += product.price * cart.quantity;
        });

        invoice += `-------------------------------------------\nតម្លៃសរុប: $${total.toFixed(
          2
        )}`;

        // Use SweetAlert for confirmation dialog
        swal({
          title: "ការទូទាត់ប្រាក់ទទួលបានជោគជ័យ",
          text: invoice,
          icon: "success",
          button: "បិត",
        });

        carts = [];
        localStorage.removeItem("cart"); // Clear cart from local storage
        addCartToHTML(); // Clear cart from HTML
      } else {
        swal({
          title: "គ្មានការកម្មងអុីវ៉ាន់!",
          icon: "error",
          button: "បិត",
        });
      }
    };

    // Attach checkout button event listener
    checkOutButton.on("click", handleCheckout);

    const initApp = () => {
      $.getJSON("product.json", function (data) {
        listProducts = data;
        showProducts(listProducts);

        if (localStorage.getItem("cart")) {
          carts = JSON.parse(localStorage.getItem("cart"));
          addCartToHTML();
        }
      });
    };

    // Filter
    let btnMeunFilter = document.querySelectorAll(".btn_menu_filter");

    btnMeunFilter.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const category = e.currentTarget.dataset.category;
        if (listProducts.length > 0) {
          const filterMenu = listProducts.filter((item) => {
            return item.category == category;
          });
          category == "all"
            ? showProducts(listProducts)
            : showProducts(filterMenu);
        }
      });
    });

    let filterList = $("body .filter_List li a");
    filterList.each(function () {
      $(this).on("click", function () {
        filterList.each(function () {
          $(this).removeClass("active");
        });
        $(this).addClass("active");
      });
    });

    let searchMenu = document.querySelector("#txt_search_menu");

    $("#txt_search_menu").on("keyup", function () {
      if (listProducts.length > 0) {
        const searchTerm = searchMenu.value.toLowerCase(); // Lowercase search term

        const filteredProducts = listProducts.filter((item) => {
          const productName = item.name.toLowerCase();
          return productName.includes(searchTerm); // Use includes() for partial matches
        });

        if (filteredProducts.length === 0) {
          listProductHTML.html(`<h2>Product not found</h2>`);
        } else {
          showProducts(filteredProducts);
        }
      }
    });

    initApp();
  }
});
// ...existing code...
$(document).ready(function () {
  $('.payment_option.aba').on('click', function () {
    swal({
      title: "ស្កេន QR Code ដើម្បីបង់ប្រាក់តាម ABA",
      text: "សូមស្កេន QR Code ខាងក្រោម",
      content: {
        element: "div",
        attributes: {
          style: "display: flex; justify-content: center; align-items: center;",
          innerHTML: '<img src="assets/images/khqr.JPG" width="250" alt="ABA QR Code" />'
        }
      },
      button: "បិទ"
    });
  });
});

$(document).ready(function () {
  $('.payment_option.khqr').on('click', function () {
    swal({
      title: "ស្កេន QR Code ដើម្បីបង់ប្រាក់តាម KHQR",
      text: "សូមស្កេន QR Code ខាងក្រោម",
      content: {
        element: "div",
        attributes: {
          style: "display: flex; justify-content: center; align-items: center;",
          innerHTML: '<img src="assets/images/khqr.JPG" width="250" alt="KHQR QR Code" />'
        }
      },
      button: "បិទ"
    });
  });
});
$(document).ready(function () {
  $('.pay_with_scan').on('click', function () {
    window.location.href = 'register.html';
  });
});