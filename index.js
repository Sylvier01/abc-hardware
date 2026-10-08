import homepageProductsData from "./homepageProductsData.js"

const navItems = document.querySelectorAll("nav li")
const navAndIcon = document.querySelector(".nav-and-icon")
const categoriesContainer = document.querySelector(".categories-container")
const upArrow = document.querySelector(".up-arrow")
const downArrow = document.querySelector(".down-arrow")
const dropMenu = document.querySelector(".drop-menu")
const cartContainer = document.querySelector(".cart-container")
const cartItemsDisplay = document.querySelector(".cart-items-display")
const cartTableContent = document.querySelector(".cart-table-content")
const addMoreItems = document.querySelector(".add-more-items")
const clearCart = document.querySelector(".clear-cart")
const totalAmount = document.querySelector(".total-amount")
const orderByWhatsapp = document.querySelector(".order-by-whatsapp")
const orderBySms = document.querySelector(".order-by-sms")

const BUSINESS_NAME = "ABC Hardware"
const WHATSAPP_NUMBER = "254701973009"
const SMS_NUMBER = "+254792929806"

let AllCartItems = Number(localStorage.getItem("AllCartItems")) || 0
let cartAddedItems = JSON.parse(localStorage.getItem("cartAddedItems")) || []


/**
 * ============================================================
 * HELPERS
 * ============================================================
 */

// FIX 9: anything placed into innerHTML / attributes goes through this,
// so a quote in a product name (e.g. 4.5") can't break the markup.
function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]))
}

function stripHtml(html) {
    const temp = document.createElement("div")
    temp.innerHTML = html
    return temp.textContent
}

// FIX 8: price 0 means "no price yet"
const hasPrice = (price) => Number(price) > 0
const priceLabel = (price) => hasPrice(price) ? `Ksh. ${price}` : "Price on request"

function openWhatsApp(message) {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank")
}

/**
 * FIX 9: description is no longer stored in a data-* attribute on the
 * product card (any " in it would break the HTML). It is looked up
 * from the data file by product name instead.
 */
function getProductData(productElement) {
    const name = productElement.dataset.name
    const source = homepageProductsData.find((p) => p.itemName === name)

    return {
        name,
        price: productElement.dataset.price,
        image: productElement.dataset.image,
        category: productElement.dataset.category,
        description: source ? source.productDescription : ""
    }
}

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

function buildOrderMessage() {
    const orderItems = cartAddedItems.map((product, index) => {
        return [
            `${index + 1}. ${product.name}`,
            `   Quantity: ${product.quantity}`,
            `   Price for each: Ksh. ${product.price}`,
            `   Total for the product: Ksh. ${product.price * product.quantity}`
        ].join("\n")
    }).join("\n\n")

    const overallTotalAmount = cartAddedItems.reduce((total, product) => {
        return total + (Number(product.price) * product.quantity)
    }, 0)

    // FIX: this used to say "Sylvan Logistics" (copied from the other site)
    return [
        `Hello, ${BUSINESS_NAME}! I'm ordering the following:`,
        "",
        orderItems,
        "",
        `Total cost: Ksh. ${overallTotalAmount}`,
        "",
        "Kindly deliver to:"
    ].join("\n")
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
if (categoriesContainer && dropMenu) {
    categoriesContainer.addEventListener("click", (event) => {
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
const closeIcon = document.querySelector(".close-icon")
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

    //menu-icon to close leftAlignedNav
    menuIcon.addEventListener("click", (event) => {
        event.stopPropagation()

        if (leftAlignedNav.style.display === "none") {
            leftAlignedNav.style.display = "block"
        } else {
            leftAlignedNav.style.display = "none"
        }
    })
}
//close-icon to close leftAlignedNav
if (closeIcon && leftAlignedNav) {
    closeIcon.addEventListener("click", () => {
        leftAlignedNav.style.display = "none"
    })
}

//close leftAlignedNav when link clicked
if(leftAlignedNav){
    const navLinks = document.querySelectorAll("a:not(.categories-link)")

    navLinks.forEach((link) =>{
        link.addEventListener("click", () =>{
            leftAlignedNav.style.display = "none"
        })
    })
}


/**
 * ============================================================
 * CART PAGE
 * ============================================================
 */
const emptyCartContainer = document.querySelector(".empty-cart-container")
const orderBtnsContainer = document.querySelector(".order-btns-container")


// Every element is null-checked inside, so this is safe on any page
function setEmptyCartUI() {
    if (emptyCartContainer) emptyCartContainer.style.display = "block"
    if (cartTableContent) cartTableContent.style.display = "none"
    if (totalAmount) totalAmount.style.display = "none"
    if (clearCart) clearCart.style.display = "none"
    if (orderBtnsContainer) orderBtnsContainer.style.display = "none"

    if (addMoreItems) {
        addMoreItems.style.marginRight = "auto"
        addMoreItems.style.marginLeft = "auto"
    }
}

if (cartContainer) {
    cartContainer.addEventListener("click", () => {
        window.location.href = "cart.html"
    })
}

function updateTotalAmount() {
    if (totalAmount) {
        const overallTotalAmount = cartAddedItems.reduce((total, product) => {
            return total + (Number(product.price) * product.quantity)
        }, 0)

        totalAmount.textContent = `Total amount = Ksh. ${overallTotalAmount}`
    }
}

if (cartTableContent) {

    // FIX 4: empty-cart container is null-checked
    if (cartAddedItems.length > 0) {
        cartItemsDisplay.style.display = "block"
        cartTableContent.style.display = "block"
        if (emptyCartContainer) emptyCartContainer.style.display = "none"
    } else {
        setEmptyCartUI()
    }

    cartAddedItems.forEach((product, index) => {

        const row = document.createElement("tr")

        row.className = "cart-item"
        row.dataset.name = product.name
        row.dataset.price = product.price
        row.dataset.image = product.image

        row.innerHTML = `
            <td>
               ${index + 1}
            </td>

            <td>
                <img 
                    src="${escapeHtml(product.image)}" 
                    alt="${escapeHtml(product.name)}" 
                    class="cart-product-image"
                >
            </td>

            <td>
                ${escapeHtml(product.name)}
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

        cartTableContent.appendChild(row)

        //make image clickable
        cartTableContent.addEventListener("click", (event) =>{
    
        const cartProductImage = event.target.closest(".cart-product-image")

        if(cartProductImage){
            const row = cartProductImage.closest(".cart-item")

            localStorage.setItem("productImage", row.dataset.image)
            localStorage.setItem("productName", row.dataset.name)
            localStorage.setItem("productPrice", row.dataset.price)

            window.location.href = "product.html"

            return
        }
    })


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
            if (productIndex !== -1) cartAddedItems.splice(productIndex, 1)

            AllCartItems = Math.max(0, AllCartItems - product.quantity)
            updateTotalAmount()

            localStorage.setItem("AllCartItems", AllCartItems)
            localStorage.setItem("cartAddedItems", JSON.stringify(cartAddedItems))

            if (cartItemsDisplay) {
                if (AllCartItems > 0) {
                    cartItemsDisplay.textContent = AllCartItems
                    cartItemsDisplay.style.display = "block"
                } else {
                    cartItemsDisplay.style.display = "none"
                }
            }

            // FIX 2 + 6: last item removed -> show the empty-cart UI
            // (previously this used a null element and threw an error)
            if (cartAddedItems.length === 0) {
                setEmptyCartUI()
            }
        })
    })

    updateTotalAmount()

    // FIX 3: these listeners are attached ONCE, outside the loop.
    // Before, a cart with 3 items opened 3 WhatsApp windows per click.
    if (orderByWhatsapp) {
        orderByWhatsapp.addEventListener("click", () => {
            if (cartAddedItems.length === 0) return
            openWhatsApp(buildOrderMessage())
        })
    }

    if (orderBySms) {
        orderBySms.addEventListener("click", () => {
            if (cartAddedItems.length === 0) return
            window.location.href = `sms:${SMS_NUMBER}?body=${encodeURIComponent(buildOrderMessage())}`
        })
    }

    // FIX 1: the ONE clear-cart handler (the earlier duplicate, which
    // never touched localStorage, has been deleted)
    if (clearCart) {
        clearCart.addEventListener("click", () => {
            localStorage.removeItem("cartAddedItems")
            localStorage.removeItem("AllCartItems")

            cartAddedItems = []
            AllCartItems = 0

            updateTotalAmount()

            if (cartItemsDisplay) cartItemsDisplay.style.display = "none"

            document.querySelectorAll(".cart-table-content tr:not(:first-child)").forEach((row) => {
                row.remove()
            })

            setEmptyCartUI()
        })
    }
}


/**
 * ============================================================
 * PRODUCT PAGE (product.html)
 * ============================================================
 */

if (document.querySelector(".productPage")) {

    const cartBtn = document.querySelector(".cart-btn")
    const proceedToCartBtn = document.querySelector(".proceed-to-cart-btn")

    const productPageImage = document.querySelector(".productPage-image")
    const productPageProductName = document.querySelector(".productPage-product-name")
    const productPagePrice = document.querySelector(".productPage-price")
    const productPageProductDescription = document.querySelector(".productPage-product-description")

    const productImage = localStorage.getItem("productImage")
    const productName = localStorage.getItem("productName")
    const productPrice = localStorage.getItem("productPrice")

    productPageImage.innerHTML = `<img src="${escapeHtml(productImage)}" alt="${escapeHtml(productName)}">`
    productPageProductName.textContent = productName
    productPagePrice.textContent = priceLabel(productPrice)

    //Proceed to cart Btn
    proceedToCartBtn.addEventListener("click", () => {
        window.location.href = "cart.html"
    })

    const productInfo = homepageProductsData.find((p) => p.itemName === productName)
    if (productInfo) {
        productPageProductDescription.innerHTML = productInfo.productDescription
    }

    if (hasPrice(productPrice)) {
        cartBtn.addEventListener("click", () => {
            const quantity = addToCart({ name: productName, price: productPrice, image: productImage })

            cartBtn.innerHTML = `<img src="assets/icon/shopping-cart png.png" alt="cart icon" class="cart-icon"> ${quantity} Added to Cart`
            if (cartItemsDisplay) {
                cartItemsDisplay.style.display = "block"
                cartItemsDisplay.textContent = AllCartItems
            }
        })
    } 
    // FIX 7: the old WhatsApp-order block was removed from here. The h/w
    // product page has no WhatsApp order button, so it never ran.
}

// Display cart count badge if there's anything in the cart
let allCartItems = Number(localStorage.getItem("AllCartItems")) || 0

if (allCartItems > 0 && cartItemsDisplay) {
    cartItemsDisplay.style.display = "block"
    cartItemsDisplay.textContent = allCartItems
}


/**
 * ============================================================
 * CATEGORY DATA (computed from product data only, no DOM
 * dependency, so this is safe to run on every page)
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

// Are we on index.html? If not, category links need to point back
// to index.html's anchors.
const onIndexPage = document.querySelector(".all-categories") !== null

const categoryHref = (category) => {
    const anchor = `#${categoryId(category)}`
    return onIndexPage ? anchor : `index.html${anchor}`
}


/**
 * ============================================================
 * HOMEPAGE product/category rendering
 * ============================================================
 */
const allCategories = document.querySelector(".all-categories")

function productCardHtml(product) {
    const priced = hasPrice(product.itemPrice)

    // FIX 9: every value is escaped. The old version broke on
    // 'SALI Angle Grinder 710W 4.5"' because of the " in the name.
    // FIX 8: price 0 shows "Price on request" and an Enquire button.
    return `
        <div class="product"
            data-name="${escapeHtml(product.itemName)}"
            data-price="${escapeHtml(product.itemPrice)}"
            data-image="${escapeHtml(product.itemImage)}"
            data-category="${escapeHtml(product.category)}"
        >

            <img
                class="product-image"
                src="${escapeHtml(product.itemImage)}"
                alt="${escapeHtml(product.itemName)}"
            >

            <h3>${escapeHtml(product.itemName)}</h3>

            <p class="price">${priceLabel(product.itemPrice)}</p>

            <button class="cart-btn">Add to Cart</button>
        </div>
    `
}

if (allCategories) {
    allCategories.innerHTML = categories.map((category) => `
        <section class="categories-styling" id="${categoryId(category)}">
            <h2>${escapeHtml(category)}</h2>
            <section class="products-container">
                ${homepageProducts
                    .filter((product) => product.category === category)
                    .map(productCardHtml)
                    .join("")}
            </section>
        </section>
    `).join("")

    // const sumOfAllProducts = document.querySelector(".sum-of-all-products")
    // const productsOnHomepage = document.querySelectorAll(".product")

    // if (sumOfAllProducts) {
    //     sumOfAllProducts.textContent = `(${productsOnHomepage.length})`
    // }
}


/**
 * ============================================================
 * Drop-menu and footer category links (run on every page)
 * ============================================================
 */
if (dropMenu) {
    dropMenu.innerHTML = categories.map((category) => `
        <li class="drop-menu-item">
            <a href="${categoryHref(category)}">
                ${escapeHtml(category)}
            </a>
        </li>
    `).join("")
}

const footerCategories = document.querySelector(".footer-categories")

if (footerCategories) {
    footerCategories.innerHTML = categories.map((category) => `
        <li>
            <a href="${categoryHref(category)}">
                ${escapeHtml(category)}
            </a>
        </li>
    `).join("")
}


/**
 * ============================================================
 * SEARCH, only wired up where the search elements exist
 * (i.e. index.html)
 * ============================================================
 */
const searchBtn = document.querySelector("#search-btn")
const search = document.querySelector("#search-input")
const searchResultsContainer = document.querySelector(".search-results-container")

const products = document.querySelectorAll(".product")

function performSearch() {
    const searched = search.value.trim().toLowerCase()

    if (!searched) {
        searchResultsContainer.innerHTML = ""
        return
    }
    const searchWords = searched.split(/\s+/)

    const matches = [...products].filter((product) => {
        const { name, category, description } = getProductData(product)

        // description can contain HTML tags, so search only its text
        const searchableText = `
            ${name}
            ${category}
            ${stripHtml(description)}
        `.toLowerCase()

        return searchWords.every((word) => {
            return searchableText.includes(word)
        })
    })

    searchResultsContainer.scrollIntoView({
        behavior: "smooth",
        block: "start"
    })

    // FIX 9: the user's text is escaped before it goes back into the page
    const safeQuery = escapeHtml(search.value)

    if (matches.length === 0) {
        searchResultsContainer.style.border = "1px solid"

        searchResultsContainer.innerHTML = `
            <h3>Search Results for "${safeQuery}"</h3>

            <p class="no-search-results">
                No products found for "${safeQuery}"
            </p>
        `
        return
    }

    searchResultsContainer.innerHTML = `
        <h3>Search Results for "${safeQuery}"</h3>

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
                    const priced = hasPrice(price)

                    return `
                            <tr
                                class="search-result"
                                data-name="${escapeHtml(name)}"
                                data-price="${escapeHtml(price)}"
                                data-image="${escapeHtml(image)}"
                            >
                                <td>                                    
                                    <img
                                        src="${escapeHtml(image)}"
                                        alt="${escapeHtml(name)}"
                                        class="search-result-image"
                                    >
                                    
                                </td>

                                <td>
                                    ${escapeHtml(name)}
                                </td>

                                <td>
                                    ${priceLabel(price)}
                                </td>

                                <td>
                                    <button 
                                        class="cart-btn search-cart-btn"
                                        data-name="${escapeHtml(name)}"
                                        data-price="${escapeHtml(price)}"
                                        data-image="${escapeHtml(image)}"
                                    >
                                        ${priced ? "Add to Cart" : "Enquire"}
                                    </button>
                                </td>
                            </tr>
                    `
                    
                }).join("")
            }
            </tbody>
        </table>
    `
}


if (searchResultsContainer) {
    searchResultsContainer.addEventListener("click", (event) => {
        
        //clickable image
        const searchResultImage = event.target.closest(".search-result-image")
        
        if(searchResultImage){
            const row = searchResultImage.closest(".search-result")

            localStorage.setItem("productImage", row.dataset.image)
            localStorage.setItem("productName", row.dataset.name)
            localStorage.setItem("productPrice", row.dataset.price)

            window.location.href = "product.html"
        }
        // closest() so clicking the cart icon inside the button still works
        const button = event.target.closest(".search-cart-btn")
        if (!button) return

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

// FIX 7: the old "Whatsapp order from Main page" block (orderButtons.forEach)
// was removed. The h/w product cards have no WhatsApp buttons, so it only
// ever attached a useless extra listener to the cart page's order button.


/**
 * ============================================================
 * ANIMATIONS
 * ============================================================
 */
const paragraphs = document.querySelectorAll(".animated-paragraph")

paragraphs.forEach((paragraph) => {
    paragraph.innerHTML = paragraph.textContent
        .split(" ")
        .map(word => `<span class="word">${escapeHtml(word)}</span>`)
        .join(" ")

    // scoped to this paragraph, so delays restart for each one
    const words = paragraph.querySelectorAll(".word")
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
