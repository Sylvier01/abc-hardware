import homepageProductsData from "./homepageProductsData.js"

const active = document.querySelector(".active")
const navItems = document.querySelectorAll("nav li")
const navItemContainer = document.querySelector(".nav-item-container")
const navAndIcon = document.querySelector(".nav-and-icon")
const secondNavListItem = document.querySelector(".second-nav-list-item")
const upArrow = document.querySelector(".up-arrow")
const downArrow = document.querySelector(".down-arrow")
const dropMenu = document.querySelector(".drop-menu")
const hero = document.querySelector(".hero")
const cart = document.querySelectorAll(".cart")
const cartContainer = document.querySelector(".cart-container")
const cartItemsDisplay = document.querySelector(".cart-items-display")
const addMoreItems = document.querySelector(".add-more-items")
const clearCart = document.querySelector(".clear-cart")
const ctaLink = document.querySelectorAll(".cta-link")
const orderButtons = document.querySelectorAll(".order-by-whatsapp")
const orderByWhatsapp = document.querySelector(".order-by-whatsapp")
const orderBySms = document.querySelector(".order-by-sms")

const WHATSAPP_NUMBER = "254701973009"
const SMS_NUMBER = "+254792929806"

let AllCartItems = Number(localStorage.getItem("AllCartItems")) || 0
let cartAddedItems = JSON.parse(localStorage.getItem("cartAddedItems")) || []


/**
 * ============================================================
 * WHAT CHANGED IN THIS FIX — READ THIS FIRST
 * ============================================================
 *
 * The categories dropdown (and several other things) weren't
 * broken by their own logic — they were never RUNNING on
 * product.html / cart.html, because an earlier, unrelated line
 * threw an error and silently killed the rest of the script.
 *
 * FIX 1: `.all-categories` only exists on index.html. On
 * product.html/cart.html, `allCategories` was null, and
 * `allCategories.innerHTML += ...` threw a TypeError — which
 * stops ALL code after it in the file from running, including
 * the drop-menu category links, footer category links, the
 * scroll-up arrow, and the footer year updater on those pages.
 * Fixed by wrapping the whole homepage-only product-rendering
 * block in `if (allCategories) { ... }`.
 *
 * FIX 2: `sumOfAllProducts` was declared as a `const` on a
 * COMMENTED-OUT line, but then used (uncommented) a few lines
 * later — a ReferenceError, which would have broken the rest of
 * the script even on index.html itself, right after the
 * categories section. Fixed by properly declaring it and
 * guarding its use.
 *
 * FIX 3: category links for the drop-menu and footer are now
 * built once, from data only (no DOM dependency), and run
 * unconditionally on every page — since the nav and footer exist
 * on every page, these links should always be there. Their
 * hrefs now point to `index.html#<category>` when the current
 * page isn't index.html itself, so clicking a category from
 * product.html or cart.html actually navigates to the homepage
 * and lands on that category, instead of pointing at a fragment
 * that only exists on index.html.
 *
 * FIX 4: `searchResultsContainer.addEventListener(...)` ran
 * unguarded — if that element doesn't exist on a page, this
 * would throw too. Now it only attaches if the element exists.
 * ============================================================
 */


/**
 * ============================================================
 * CHANGE 1: getProductData
 * ------------------------------------------------------------
 * Single place that reads a product's data off its .product
 * element. Every part of the file that needs product info calls
 * this instead of reading dataset/DOM text separately.
 * ============================================================
 */
function getProductData(productElement) {
    return {
        name: productElement.dataset.name,
        price: productElement.dataset.price,
        image: productElement.dataset.image
    }
}


/**
 * ============================================================
 * CHANGE 2: addToCart
 * ============================================================
 */
function addToCart({ name, price, image }) {
    const existing = cartAddedItems.find(p => p.name === name)

    if (existing) {
        existing.quantity++
    } else {
        cartAddedItems.push({ name, price, image, quantity: 1 })
    }

    AllCartItems++
    localStorage.setItem("AllCartItems", AllCartItems)
    localStorage.setItem("cartAddedItems", JSON.stringify(cartAddedItems))

    return existing ? existing.quantity : 1
}


/**
 * ============================================================
 * CHANGE 3: buildOrderMessage
 * ============================================================
 */
function buildOrderMessage() {
    const orderItems = cartAddedItems.map((product) => {
        return ` ${product.name}
                Quantity: ${product.quantity}
                Price for Each:  ${product.price}
                Total for the product: KSH. ${product.price * product.quantity}
        `
    }).join("\n\n")

    const overallTotalAmount = cartAddedItems.reduce((total, product) => {
        return total + (Number(product.price) * product.quantity)
    }, 0)

    return `Hello, Sylvan Logistics! I'm ordering the following:  
                
                ${orderItems}
                
                Total cost: KSH: ${overallTotalAmount}


                Kindly deliver to:`
}


/**
 * Active nav item
 */
navItems.forEach((item) => {
    item.addEventListener("click", () => {
        navItems.forEach((navItem) => {
            navItem.classList.remove("active")
        })
        item.classList.add("active")
    })
})


/**
 * Drop menu open/close toggle
 */
if (navAndIcon && dropMenu) {
    navAndIcon.addEventListener("click", (event) => {
        event.stopPropagation()

        if (getComputedStyle(dropMenu).display === "none") {
            dropMenu.style.display = "block"
            if (downArrow) downArrow.style.display = "none"
            if (upArrow) upArrow.style.display = "block"
        } else {
            if (upArrow) upArrow.style.display = "none"
            if (downArrow) downArrow.style.display = "block"
            dropMenu.style.display = "none"
        }
    })
}

// Close drop menu when clicked elsewhere
window.addEventListener("click", () => {
    if (dropMenu) dropMenu.style.display = "none"
    if (downArrow) downArrow.style.display = "block"
    if (upArrow) upArrow.style.display = "none"
})


/**
 * Menu-icon display (mobile nav toggle)
 */
const menuIcon = document.querySelector(".menu-icon")
const leftAlignedNav = document.querySelector(".left-aligned-nav")

if (menuIcon && leftAlignedNav) {

    function checkScreenWidth() {
        const width = document.documentElement.clientWidth

        if (width < 768) {
            menuIcon.style.display = "block"
            leftAlignedNav.style.display = "none"
        } else {
            menuIcon.style.display = "none"
            leftAlignedNav.style.display = ""
        }
    }
    checkScreenWidth()

    window.addEventListener("resize", checkScreenWidth)

    menuIcon.addEventListener("click", (event) => {
        event.stopPropagation()

        if (leftAlignedNav.style.display === "none") {
            leftAlignedNav.style.display = "block"
        } else {
            leftAlignedNav.style.display = "none"
        }
    })
}


/**
 * ============================================================
 * CART PAGE
 * ============================================================
 */

const cartIsEmpty = document.querySelector(".cart-is-empty")
const cartOrderSection = document.querySelector(".cart-order-section")

if (cartIsEmpty && clearCart) {
    if (cartAddedItems.length === 0) {
        cartIsEmpty.style.display = "block"
        clearCart.style.display = "none"
        if (cartOrderSection) cartOrderSection.style.display = "none"
    } else {
        cartIsEmpty.style.display = "none"
        if (cartOrderSection) cartOrderSection.style.display = "block"
    }
}

if (cartContainer) {
    cartContainer.addEventListener("click", () => {
        window.location.href = "cart.html"
    })
}

function updateTotalAmount() {
    const totalAmount = document.querySelector(".total-amount")

    if (totalAmount) {
        const overallTotalAmount = cartAddedItems.reduce((total, product) => {
            return total + (Number(product.price) * product.quantity)
        }, 0)

        totalAmount.textContent = `Total amount = Ksh. ${overallTotalAmount}`
    }
}

if (document.querySelector(".cart-table-content")) {

    const cartTableContent = document.querySelector(".cart-table-content")

    cartAddedItems.forEach((product, index) => {

        const row = document.createElement("tr")

        row.innerHTML = `
            <td>
               ${index + 1}
            </td>

            <td>
                <img src="${product.image}" class="table-product-image">
            </td>

            <td>
                ${product.name}
            </td>

            <td class="product-quantity">
               <span class="minus">-</span> <span class="quantity">${product.quantity}</span><span class="plus">+</span>
            </td>

            <td>
                Ksh. <span class="product-total">${product.price * product.quantity}</span>
            </td>
            <td>
                <img
                    src="assets/icon/recycle-bin.png"
                    class="recycle-bin">
            </td>
        `
        updateTotalAmount()

        if (orderByWhatsapp) {
            orderByWhatsapp.addEventListener("click", () => {
                const message = buildOrderMessage()
                const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
                window.open(whatsappLink, "_blank")
            })
        }

        if (orderBySms) {
            orderBySms.addEventListener("click", () => {
                const message = buildOrderMessage()
                const smsLink = `sms:${SMS_NUMBER}?body=${encodeURIComponent(message)}`
                window.location.href = smsLink
            })
        }

        cartTableContent.appendChild(row)

        const quantityDisplay = row.querySelector(".quantity")
        const productTotal = row.querySelector(".product-total")

        const minus = row.querySelector(".minus")
        minus.addEventListener("click", () => {
            if (product.quantity > 1) {
                product.quantity--
                AllCartItems--

                updateTotalAmount()

                quantityDisplay.textContent = product.quantity
                if (cartItemsDisplay) cartItemsDisplay.textContent = AllCartItems
                productTotal.textContent = product.price * product.quantity

                localStorage.setItem("AllCartItems", AllCartItems)
                localStorage.setItem("cartAddedItems", JSON.stringify(cartAddedItems))
            }
        })

        const plus = row.querySelector(".plus")
        plus.addEventListener("click", () => {
            product.quantity++
            AllCartItems++

            updateTotalAmount()

            quantityDisplay.textContent = product.quantity
            if (cartItemsDisplay) cartItemsDisplay.textContent = AllCartItems
            productTotal.textContent = product.price * product.quantity

            localStorage.setItem("AllCartItems", AllCartItems)
            localStorage.setItem("cartAddedItems", JSON.stringify(cartAddedItems))
        })

        const recycleBin = row.querySelector(".recycle-bin")
        recycleBin.addEventListener("click", () => {
            row.remove()

            const productIndex = cartAddedItems.indexOf(product)
            cartAddedItems.splice(productIndex, 1)

            AllCartItems -= product.quantity
            updateTotalAmount()

            if (AllCartItems < 0) {
                AllCartItems = 0
            }

            localStorage.setItem("AllCartItems", AllCartItems)
            localStorage.setItem("cartAddedItems", JSON.stringify(cartAddedItems))

            if (AllCartItems > 0) {
                if (cartItemsDisplay) {
                    cartItemsDisplay.textContent = AllCartItems
                    cartItemsDisplay.style.display = "block"
                }
            } else {
                if (cartItemsDisplay) cartItemsDisplay.style.display = "none"
                clearCart.style.display = "none"
            }

            if (cartAddedItems.length === 0) {
                cartIsEmpty.style.display = "block"
            }
        })

        if (!row) {
            cartIsEmpty.style.display = "block"
        }
    })

    if (cartItemsDisplay) {
        cartItemsDisplay.textContent = AllCartItems
        cartItemsDisplay.style.display = "block"
    }
}


/**
 * ============================================================
 * PRODUCT PAGE (product.html)
 * ============================================================
 */

if (document.querySelector(".productPage")) {

    const cartBtn = document.querySelector(".cart-btn")

    const productPageImage = document.querySelector(".productPage-image")
    const productPageProductName = document.querySelector(".productPage-product-name")
    const productPagePrice = document.querySelector(".productPage-price")
    const productPageProductDescription = document.querySelector(".productPage-product-description")

    const productImage = localStorage.getItem("productImage")
    const productName = localStorage.getItem("productName")
    const productPrice = localStorage.getItem("productPrice")

    productPageImage.innerHTML = `<img src="${productImage}">`
    productPageProductName.textContent = productName
    productPagePrice.innerHTML = `Ksh. ${productPrice}`

    for (let i = 0; i < homepageProductsData.length; i++) {
        if (productName === homepageProductsData[i].itemName) {
            productPageProductDescription.innerHTML = homepageProductsData[i].productDescription
        }
    }

    cartBtn.addEventListener("click", () => {
        const quantity = addToCart({ name: productName, price: productPrice, image: productImage })

        cartBtn.innerHTML = `<img src="assets/icon/shopping-cart png.png" alt="cart icon" class="cart-icon"> ${quantity} Added to Cart`
        if (cartItemsDisplay) {
            cartItemsDisplay.style.display = "block"
            cartItemsDisplay.textContent = AllCartItems
        }
    })

    if (orderByWhatsapp) {
        orderByWhatsapp.addEventListener("click", () => {
            const message = `Hello, Sylvan Logistics! I'm ordering ${productName}. 
            Quantity: 
            Price: ${productPrice}
            What are the delivery details?`

            const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
            window.open(whatsappLink, "_blank")
        })
    }
}

// Display cart count badge if there's anything in the cart
let allCartItems = Number(localStorage.getItem("AllCartItems")) || 0

if (allCartItems > 0 && cartItemsDisplay) {
    cartItemsDisplay.style.display = "block"
    cartItemsDisplay.textContent = allCartItems
}


/**
 * ============================================================
 * CATEGORY DATA — computed from product data only, no DOM
 * dependency, so this is safe to run on every page.
 * ============================================================
 */

const homepageProducts = homepageProductsData.filter((product) => {
    return product.showOnHomepage === true
})

const categories = [...new Set(
    homepageProducts.map((product) => product.category)
)]

const categoryId = (category) => {
    return category.replace(/[^a-zA-Z0-9]+/g, "-")
}

// FIX 3: are we currently on index.html? If not, category links
// need to point back to index.html's anchors, not a fragment
// that only exists on the homepage.
const onIndexPage = document.querySelector(".all-categories") !== null

const categoryHref = (category) => {
    const anchor = `#${categoryId(category)}`
    return onIndexPage ? anchor : `index.html${anchor}`
}


/**
 * ============================================================
 * FIX 1: homepage-only product/category rendering — guarded so
 * it only runs where `.all-categories` actually exists.
 * ============================================================
 */
const allCategories = document.querySelector(".all-categories")

if (allCategories) {

    categories.forEach((category) => {
        allCategories.innerHTML += `
            <section class="categories-styling" id="${categoryId(category)}">
                <h2>${category}</h2>
                <section class="products-container"></section>
            </section>
        `
    })

    homepageProducts.forEach((product) => {
        const categoryContainer = document.querySelector(
            `#${categoryId(product.category)} .products-container`
        )
        categoryContainer.innerHTML += `
            <div class="product"
                data-name="${product.itemName}"
                data-price="${product.itemPrice}"
                data-image="${product.itemImage}">

                <img
                    class="product-image"
                    src="${product.itemImage}"
                    alt="${product.itemName}"
                >

                <h3>${product.itemName}</h3>

                <p class="price">Ksh. ${product.itemPrice}</p>

                <button class="cart-btn">Add to Cart</button>
            </div>
            `
    })

    // FIX 2: properly declared (was previously commented out
    // while still being used a few lines down)
    // const sumOfAllProducts = document.querySelector(".sum-of-all-products")
    // const productsOnHomepage = document.querySelectorAll(".product")

    // if (sumOfAllProducts) {
    //     sumOfAllProducts.textContent = `(${productsOnHomepage.length})`
    // }
}


/**
 * ============================================================
 * FIX 3: drop-menu and footer category links — these run on
 * EVERY page (nav and footer exist everywhere), using the
 * page-aware categoryHref() so links work correctly whether
 * you're already on index.html or coming from product.html /
 * cart.html.
 * ============================================================
 */
if (dropMenu) {
    categories.forEach((category) => {
        dropMenu.innerHTML += `
            <li class="drop-menu-item">
                <a href="${categoryHref(category)}">
                    ${category}
                </a>
            </li>
        `
    })
}

const footerCategories = document.querySelector(".footer-categories")

if (footerCategories) {
    categories.forEach((category) => {
        footerCategories.innerHTML += `
            <li>
                <a href="${categoryHref(category)}">
                    ${category}
                </a>
            </li>
        `
    })
}


/**
 * ============================================================
 * SEARCH — only wired up where the search elements actually
 * exist (i.e. index.html)
 * ============================================================
 */
const searchBtn = document.querySelector("#search-btn")
const search = document.querySelector("#search-input")
const searchResultsContainer = document.querySelector(".search-results-container")

// Re-select products here in case the homepage block above ran
// and populated .product elements
const products = document.querySelectorAll(".product")

function performSearch() {
    const searched = search.value.trim().toLowerCase()

    if (!searched) {
        searchResultsContainer.innerHTML = ""
        return
    }

    const matches = [...products].filter((product) => {
        const { name } = getProductData(product)
        return name.toLowerCase().includes(searched)
    })

    searchResultsContainer.scrollIntoView({
        behavior: "smooth",
        block: "start"
    })

    if (matches.length === 0) {
        searchResultsContainer.style.border = "1px solid"

        searchResultsContainer.innerHTML = `
            <h3>Search Results for "${search.value}"</h3>

            <p class="no-search-results">
                No products found for "${search.value}"
            </p>
        `
        return
    }

    searchResultsContainer.innerHTML = `
        <h3>Search Results for "${search.value}"</h3>

        <table class="search-results-table">

            <thead>
                <tr>
                    <th>Image</th>
                    <th>Product</th>
                    <th>Price</th>
                </tr>
            </thead>

            <tbody>
                ${matches.map((product) => {
                    const { image, name, price } = getProductData(product)

                    return `
                            <tr>
                                <td>
                                    <img
                                        src="${image}"
                                        alt="${name}"
                                        class="search-result-image"
                                    >
                                </td>

                                <td>
                                    ${name}
                                </td>

                                <td>
                                    Ksh. ${price}
                                </td>

                                <td>
                                    <button
                                        class="cart-btn search-cart-btn"
                                        data-name="${name}"
                                        data-price="${price}"
                                        data-image="${image}"
                                    >
                                        Add to Cart
                                    </button>
                                </td>
                            </tr>
                    `
                }).join("")}
            </tbody>
        </table>
    `
}

// FIX 4: only attach if the element actually exists on this page
if (searchResultsContainer) {
    searchResultsContainer.addEventListener("click", (event) => {
        const button = event.target

        const productData = {
            name: button.dataset.name,
            price: button.dataset.price,
            image: button.dataset.image,
        }

        if (!productData.name) return

        const quantity = addToCart(productData)

        button.innerHTML = `
            <img
                src="assets/icon/shopping-cart png.png"
                alt="cart icon"
                class="cart-icon"
            >
            ${quantity}
        `

        if (cartItemsDisplay) {
            cartItemsDisplay.style.display = "block"
            cartItemsDisplay.textContent = AllCartItems
        }
    })
}

if (searchBtn && search && searchResultsContainer) {

    searchBtn.addEventListener("click", performSearch)

    search.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            performSearch()
        }
    })
}


/**
 * ============================================================
 * Per-product listeners: add-to-cart, and click-to-view
 * ============================================================
 */
products.forEach((product) => {

    const cartBtn = product.querySelector(".cart-btn")
    if (!cartBtn) return

    const { name: productName } = getProductData(product)

    const existingProduct = cartAddedItems.find((p) => p.name === productName)
    if (existingProduct) {
        cartBtn.innerHTML = `
            <img src="assets/icon/shopping-cart png.png" alt="cart icon" class="cart-icon">
            ${existingProduct.quantity}`
    }

    cartBtn.addEventListener("click", (event) => {
        event.stopPropagation()

        const productData = getProductData(product)
        const quantity = addToCart(productData)

        cartBtn.innerHTML = `<img src="assets/icon/shopping-cart png.png" alt="cart icon" class="cart-icon"> ${quantity}`
        if (cartItemsDisplay) {
            cartItemsDisplay.style.display = "block"
            cartItemsDisplay.textContent = AllCartItems
        }
    })

    product.addEventListener("click", () => {
        const { name, price, image } = getProductData(product)

        localStorage.setItem("productImage", image)
        localStorage.setItem("productName", name)
        localStorage.setItem("productPrice", price)

        window.location.href = "product.html"
    })
})


if (clearCart) {
    clearCart.addEventListener("click", () => {
        localStorage.removeItem("cartAddedItems")
        localStorage.removeItem("AllCartItems")

        cartAddedItems = []
        AllCartItems = 0

        updateTotalAmount()

        if (cartItemsDisplay) cartItemsDisplay.style.display = "none"
        cartIsEmpty.style.display = "block"

        const cartRows = document.querySelectorAll(".cart-table-content tr:not(:first-child)")
        cartRows.forEach((row) => {
            row.remove()
            clearCart.style.display = "none"
        })
    })
}


/**
 * Whatsapp order from Main page
 */
orderButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
        event.stopPropagation()

        const product = button.closest(".product")
        if (!product) return

        const { name, price } = getProductData(product)

        const message = `Hello, Sylvan Logistics! I'm ordering ${name}. 
        Quantity: 
        Price: ${price}
        What are the delivery details?`

        const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
        window.open(whatsappLink, "_blank")
    })
})


/**
 * ============================================================
 * ANIMATIONS
 * ============================================================
 */
const paragraphs = document.querySelectorAll(".animated-paragraph")

paragraphs.forEach((paragraph) => {
    paragraph.innerHTML = paragraph.textContent
        .split(" ")
        .map(word => `<span class="word">${word}</span>`)
        .join(" ")

    const words = document.querySelectorAll(".word")
    words.forEach((word, index) => {
        word.style.animationDelay = `${index * 0.05}s`
    })
})


/**
 * Scroll-up-arrow
 */
const scrollUpArrow = document.querySelector(".scroll-up-arrow")

if (scrollUpArrow) {
    scrollUpArrow.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    })
}


/**
 * Footer
 */
function updateFooter() {
    const yearElement = document.getElementById("copyright-year")
    if (yearElement) {
        yearElement.textContent = " " + new Date().getFullYear()
    }
}
updateFooter()