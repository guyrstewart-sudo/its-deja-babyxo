/* =========================================================
   Deja · babyxo — site interactions
   Front-end only. Stripe + scheduler hooks marked TODO.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- nav: scrolled + mobile ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const burger = document.getElementById("burger");
  const links = document.querySelector(".nav__links");
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll(
    ".about, .portfolio .section__head, .gallery__item, .shop .section__head, .product, .pkg, .booking-form, .contact__inner"
  );
  revealEls.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));

  /* =========================================================
     PRODUCTS
     Edit this array to manage the shop. To go live with Stripe,
     give each product a `stripeLink` (Stripe Payment Link URL)
     — see README.md.  image: drop a file in assets/images/.
     ========================================================= */
  const PRODUCTS = [
    { id: "tee-soft",   name: "“Soft Voice” Tee",        desc: "Boxy cotton, embroidered script", price: 38, image: "assets/images/shop-tee.jpg",    stripeLink: "" },
    { id: "hoodie-wild",name: "“Wild Heart” Hoodie",     desc: "Heavyweight fleece, terracotta",   price: 64, image: "assets/images/shop-hoodie.jpg", stripeLink: "" },
    { id: "set-magnet", name: "Magnetic Lounge Set",     desc: "Ribbed two-piece, second-skin",    price: 72, image: "assets/images/shop-set.jpg",    stripeLink: "" },
    { id: "cap-babyxo", name: "babyxo Cap",              desc: "Structured, gold-thread logo",     price: 28, image: "assets/images/shop-cap.jpg",    stripeLink: "" }
  ];

  const fmt = (n) => "$" + n.toFixed(0);
  const productsEl = document.getElementById("products");

  productsEl.innerHTML = PRODUCTS.map(
    (p) => `
    <article class="product">
      <div class="product__img">
        <div class="img-slot" data-img="${p.image}"><span>${p.image.split("/").pop()}</span></div>
      </div>
      <div class="product__body">
        <h3 class="product__name">${p.name}</h3>
        <p class="product__desc">${p.desc}</p>
        <div class="product__row">
          <span class="product__price">${fmt(p.price)}</span>
          <button class="product__add" data-add="${p.id}">Add to bag</button>
        </div>
      </div>
    </article>`
  ).join("");

  /* try to load real images into any slot that has one */
  document.querySelectorAll(".img-slot[data-img]").forEach((slot) => {
    const src = slot.getAttribute("data-img");
    const test = new Image();
    test.onload = () => {
      slot.style.backgroundImage = `url("${src}")`;
    };
    test.src = src;
  });

  /* =========================================================
     CART (in-memory only — no browser storage)
     ========================================================= */
  const cart = {}; // id -> qty
  const cartEl = document.getElementById("cart");
  const cartItemsEl = document.getElementById("cartItems");
  const cartTotalEl = document.getElementById("cartTotal");
  const cartCountEl = document.getElementById("cartCount");
  const cartNoteEl = document.getElementById("cartNote");

  const openCart = () => cartEl.classList.add("open");
  const closeCart = () => cartEl.classList.remove("open");

  document.getElementById("cartFab").addEventListener("click", openCart);
  document.getElementById("cartClose").addEventListener("click", closeCart);
  document.getElementById("cartScrim").addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeCart());

  function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    renderCart();
    openCart();
  }
  function changeQty(id, delta) {
    cart[id] = (cart[id] || 0) + delta;
    if (cart[id] <= 0) delete cart[id];
    renderCart();
  }

  function renderCart() {
    const ids = Object.keys(cart);
    let total = 0,
      count = 0;
    if (!ids.length) {
      cartItemsEl.innerHTML = `<p class="cart__empty">Your bag is empty.<br>Add something magnetic.</p>`;
    } else {
      cartItemsEl.innerHTML = ids
        .map((id) => {
          const p = PRODUCTS.find((x) => x.id === id);
          const qty = cart[id];
          total += p.price * qty;
          count += qty;
          return `
          <div class="cart-item">
            <div class="cart-item__thumb" style="${p.image ? `background-image:url('${p.image}');background-size:cover;background-position:center;` : ""}"></div>
            <div class="cart-item__info">
              <div class="cart-item__name">${p.name}</div>
              <div class="cart-item__price">${fmt(p.price)}</div>
              <div class="cart-item__qty">
                <button data-q="${id}" data-d="-1" aria-label="Decrease">−</button>
                <span>${qty}</span>
                <button data-q="${id}" data-d="1" aria-label="Increase">+</button>
              </div>
            </div>
          </div>`;
        })
        .join("");
    }
    cartTotalEl.textContent = fmt(total);
    cartCountEl.textContent = String(count);
    cartNoteEl.textContent = "";
  }

  productsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (btn) addToCart(btn.getAttribute("data-add"));
  });
  cartItemsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-q]");
    if (btn) changeQty(btn.getAttribute("data-q"), Number(btn.getAttribute("data-d")));
  });

  /* ---------- checkout (Stripe-ready stub) ---------- */
  document.getElementById("checkoutBtn").addEventListener("click", () => {
    const ids = Object.keys(cart);
    if (!ids.length) {
      cartNoteEl.textContent = "Your bag is empty.";
      return;
    }
    /* === TODO: wire Stripe here ===
       Simplest path (no backend, works on GitHub Pages):
         1. Create a Stripe Payment Link per product at dashboard.stripe.com
         2. Put the URL in each product's `stripeLink` above
         3. For single-item checkout: window.location = product.stripeLink
       For a real multi-item cart, use Stripe Checkout via a tiny serverless
       function (see README.md). Until then we show a friendly preview. */
    const single = ids.length === 1 ? PRODUCTS.find((p) => p.id === ids[0]) : null;
    if (single && single.stripeLink) {
      window.location.href = single.stripeLink;
      return;
    }
    cartNoteEl.textContent = "Checkout is in preview — connect Stripe in README.md to take payments.";
  });

  renderCart();

  /* =========================================================
     BOOKING
     ========================================================= */
  document.querySelectorAll(".pkg__pick").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pkg = btn.closest(".pkg");
      document.querySelectorAll(".pkg").forEach((p) => p.classList.remove("is-selected"));
      pkg.classList.add("is-selected");
      const type = pkg.getAttribute("data-pkg");
      const sel = document.getElementById("bf-type");
      [...sel.options].forEach((o) => {
        if (o.value === type) sel.value = type;
      });
      document.getElementById("book").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* set date min = today */
  const dateInput = document.getElementById("bf-date");
  dateInput.min = new Date().toISOString().split("T")[0];

  const form = document.getElementById("bookingForm");
  const status = document.getElementById("bookingStatus");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.className = "booking-form__status";
    if (!form.checkValidity()) {
      status.classList.add("err");
      status.textContent = "Please fill in your name, email, type and date.";
      form.reportValidity();
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    /* === TODO: connect a real destination ===
       Options:
       (a) Calendly / Cal.com: replace this form with their embed for live scheduling.
       (b) Email: use Formspree/Getform — set form action + method="POST".
       (c) Your own endpoint. See README.md. */
    console.log("Booking request (preview):", data);
    status.classList.add("ok");
    status.textContent = `Thanks ${data.name.split(" ")[0]}! Your ${data.type} request for ${data.date} is noted — preview mode, so no email sent yet.`;
    form.reset();
    document.querySelectorAll(".pkg").forEach((p) => p.classList.remove("is-selected"));
  });
})();
