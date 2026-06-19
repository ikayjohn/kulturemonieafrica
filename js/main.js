const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navRoot = document.querySelector(".nav");

// 1) Mobile Navigation
if (menuToggle && navLinks) {
  function closeMenu() {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    navLinks.classList.add("open");
    menuToggle.setAttribute("aria-expanded", "true");
    const firstLink = navLinks.querySelector("a");
    if (firstLink instanceof HTMLElement) firstLink.focus();
  }

  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = navLinks.classList.contains("open");
    if (isOpen) closeMenu();
    else openMenu();
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (!navLinks.contains(target) && !menuToggle.contains(target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("open")) {
      closeMenu();
      menuToggle.focus();
    }
  });
}

// Add 'scrolled' class to .nav when scrollY > 60
function syncNavScrolled() {
  if (!navRoot) return;
  navRoot.classList.toggle("scrolled", window.scrollY > 60);
}
window.addEventListener("scroll", syncNavScrolled, { passive: true });
syncNavScrolled();

// 3) Active Nav Link
const currentPage = location.pathname === "/" ? "/" : location.pathname.replace(/\/+$/, "");
document.querySelectorAll(".nav-links a").forEach((link) => {
  const href = link.getAttribute("href");
  if (!href) return;
  const normalizedHref = href === "/" ? "/" : href.replace(/\/+$/, "");
  link.classList.toggle("active", normalizedHref === currentPage);
});

document.querySelectorAll(".current-year").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

const params = new URLSearchParams(window.location.search);
document.querySelectorAll("[data-form-status]").forEach((status) => {
  const isSent = params.get("sent") === "1";
  const isError = params.get("error") === "1";
  if (!isSent && !isError) return;
  status.classList.remove("hidden");
  status.classList.toggle("form-status--error", isError);
  status.textContent = isSent
    ? "Thanks. Your submission has been received."
    : "Please check the form and try again.";
});

const intent = params.get("intent");
const intentField = document.querySelector("[data-intent-field]");
if (intent && intentField instanceof HTMLInputElement && !intentField.value) {
  const readableIntent = intent.replace(/[-_:]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  intentField.value = readableIntent;
}

const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length) {
  // 2) Scroll Reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
  revealEls.forEach((el) => observer.observe(el));
}

const counterEls = document.querySelectorAll("[data-count-to]");
if (counterEls.length) {
  const formatCounter = (el, value) => {
    const prefix = el.getAttribute("data-count-prefix") || "";
    const suffix = el.getAttribute("data-count-suffix") || "";
    el.textContent = `${prefix}${Math.round(value).toLocaleString()}${suffix}`;
  };

  const runCounter = (el) => {
    const target = Number(el.getAttribute("data-count-to"));
    if (!Number.isFinite(target)) return;
    const duration = 1400;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      formatCounter(el, target * eased);
      if (progress < 1) requestAnimationFrame(tick);
      else formatCounter(el, target);
    };

    requestAnimationFrame(tick);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      runCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.35 });

  counterEls.forEach((el) => {
    formatCounter(el, 0);
    counterObserver.observe(el);
  });
}

// 4) Smooth Anchor Scrolling with fixed-nav offset
document.querySelectorAll("a[href^='#']").forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const navHeight = navRoot ? navRoot.offsetHeight : 0;
    const targetY = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;
    window.scrollTo({ top: targetY, behavior: "smooth" });
    history.pushState(null, "", href);
  });
});

const contactForm = document.querySelector("#contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    let valid = true;
    const honey = contactForm.querySelector('input[name="company"]');
    if (honey instanceof HTMLInputElement && honey.value.trim() !== "") {
      e.preventDefault();
      return;
    }
    const fields = [
      { id: "full-name", error: "Full Name is required." },
      { id: "email", error: "Valid email is required.", pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      { id: "subject", error: "Subject is required." },
      { id: "comment", error: "Comment should be at least 10 characters.", min: 10 }
    ];
    fields.forEach((f) => {
      const input = document.getElementById(f.id);
      const errorEl = document.querySelector(`[data-error="${f.id}"]`);
      let ok = Boolean(input.value.trim());
      if (ok && f.pattern) ok = f.pattern.test(input.value.trim());
      if (ok && f.min) ok = input.value.trim().length >= f.min;
      if (!ok) valid = false;
      if (errorEl) errorEl.textContent = ok ? "" : f.error;
    });
    if (!valid) {
      e.preventDefault();
    }
  });
}

const vendorForm = document.querySelector("#vendor-form");
if (vendorForm) {
  const steps = [...vendorForm.querySelectorAll(".vendor-step")];
  const chips = [...vendorForm.querySelectorAll(".step-chip")];
  const nextBtns = vendorForm.querySelectorAll("[data-next]");
  const prevBtns = vendorForm.querySelectorAll("[data-prev]");
  const success = document.getElementById("vendor-success");
  let currentStep = 0;

  function renderStep() {
    steps.forEach((step, i) => step.classList.toggle("hidden", i !== currentStep));
    chips.forEach((chip, i) => chip.classList.toggle("active", i === currentStep));
  }

  nextBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const requiredFields = [...steps[currentStep].querySelectorAll("[required]")];
      const valid = requiredFields.every((field) => {
        if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) return true;
        if (field.type === "checkbox") return field.checked;
        return field.value.trim() !== "";
      });
      if (!valid) {
        steps[currentStep].querySelector("[required]")?.focus();
        return;
      }
      if (currentStep < steps.length - 1) {
        currentStep += 1;
        renderStep();
      }
    });
  });
  prevBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentStep > 0) {
        currentStep -= 1;
        renderStep();
      }
    });
  });
  vendorForm.addEventListener("submit", (e) => {
    if (!vendorForm.checkValidity()) {
      e.preventDefault();
      vendorForm.reportValidity();
      return;
    }
    if (success) success.classList.add("hidden");
  });
  renderStep();
}

const giftCardForm = document.querySelector("#gift-card-form");
if (giftCardForm) {
  const amountInput = giftCardForm.querySelector("[data-gift-amount-input]");
  const amountPreview = document.querySelector("[data-gift-preview-amount]");
  const amountButtons = giftCardForm.querySelectorAll("[data-gift-amount]");

  amountButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const amount = button.getAttribute("data-gift-amount") || "10000";
      amountButtons.forEach((btn) => btn.classList.toggle("active", btn === button));
      if (amountInput instanceof HTMLInputElement) amountInput.value = amount;
      if (amountPreview) amountPreview.textContent = `₦${Number(amount).toLocaleString()}`;
    });
  });

  giftCardForm.addEventListener("submit", (e) => {
    if (!giftCardForm.checkValidity()) {
      e.preventDefault();
      giftCardForm.reportValidity();
    }
  });
}

document.querySelectorAll("img").forEach((image) => {
  if (!(image instanceof HTMLImageElement)) return;
  if (!image.hasAttribute("loading")) image.loading = "lazy";
  if (!image.hasAttribute("decoding")) image.decoding = "async";
});

// Convert image cards to full-bleed overlay cards without repeated inline style work.
document.querySelectorAll(".card").forEach((card) => {
  if (!(card instanceof HTMLElement)) return;
  const image = card.querySelector("img");
  if (!image) return;

  card.classList.add("media-overlay");

  let overlay = card.querySelector(".card-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "card-overlay";
    card.appendChild(overlay);
  }
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.setProperty("display", "block", "important");
  overlay.style.setProperty("position", "absolute", "important");
  overlay.style.setProperty("inset", "0", "important");
  overlay.style.setProperty("z-index", "1", "important");
  overlay.style.setProperty("background", "linear-gradient(to top, rgba(0,0,0,.9), rgba(0,0,0,.44) 52%, rgba(0,0,0,.08))", "important");

  let content = card.querySelector(".card-content");
  if (!(content instanceof HTMLElement)) {
    content = document.createElement("div");
    content.className = "card-content";
    const children = [...card.children];
    children.forEach((child) => {
      if (child === image || child === overlay) return;
      content.appendChild(child);
    });
    card.appendChild(content);
  }

  card.style.setProperty("background", "#000", "important");
  card.style.setProperty("color", "#fff", "important");
  card.style.setProperty("padding", "0", "important");
  card.style.setProperty("overflow", "hidden", "important");
  card.style.setProperty("position", "relative", "important");
  card.style.setProperty("min-height", "360px", "important");

  image.style.setProperty("position", "absolute", "important");
  image.style.setProperty("inset", "0", "important");
  image.style.setProperty("width", "100%", "important");
  image.style.setProperty("height", "100%", "important");
  image.style.setProperty("min-height", "100%", "important");
  image.style.setProperty("object-fit", "cover", "important");
  image.style.setProperty("display", "block", "important");
  image.style.setProperty("margin", "0", "important");
  image.style.setProperty("border", "0", "important");
  image.style.setProperty("border-radius", "0", "important");

  content.style.setProperty("position", "absolute", "important");
  content.style.setProperty("left", "0", "important");
  content.style.setProperty("right", "0", "important");
  content.style.setProperty("bottom", "0", "important");
  content.style.setProperty("z-index", "2", "important");
  content.style.setProperty("width", "100%", "important");
  content.style.setProperty("max-width", "100%", "important");
  content.style.setProperty("padding", "1rem", "important");
  content.style.setProperty("color", "#fff", "important");
  content.querySelectorAll("*").forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    node.style.setProperty("color", "#fff", "important");
  });
  content.querySelectorAll(".card__tag").forEach((tag) => {
    if (!(tag instanceof HTMLElement)) return;
    tag.style.setProperty("color", "#ff6a70", "important");
  });
});

const heroSliderRoot = document.querySelector("[data-hero-slider]");
if (heroSliderRoot instanceof HTMLElement) {
  const track = heroSliderRoot.querySelector(".hero-slider");
  const slides = [...heroSliderRoot.querySelectorAll(".hero-slide")];
  const dots = [...heroSliderRoot.querySelectorAll("[data-hero-dot]")];
  const prevBtn = heroSliderRoot.querySelector("[data-hero-prev]");
  const nextBtn = heroSliderRoot.querySelector("[data-hero-next]");
  let index = 0;
  let timer = null;

  const renderHero = () => {
    if (!(track instanceof HTMLElement)) return;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
  };

  const nextHero = () => {
    index = (index + 1) % slides.length;
    renderHero();
  };

  const prevHero = () => {
    index = (index - 1 + slides.length) % slides.length;
    renderHero();
  };

  const startHeroAuto = () => {
    stopHeroAuto();
    timer = window.setInterval(nextHero, 5500);
  };

  const stopHeroAuto = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  if (nextBtn instanceof HTMLElement) nextBtn.addEventListener("click", () => { nextHero(); startHeroAuto(); });
  if (prevBtn instanceof HTMLElement) prevBtn.addEventListener("click", () => { prevHero(); startHeroAuto(); });

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      index = i;
      renderHero();
      startHeroAuto();
    });
  });

  heroSliderRoot.addEventListener("mouseenter", stopHeroAuto);
  heroSliderRoot.addEventListener("mouseleave", startHeroAuto);
  renderHero();
  startHeroAuto();
}

const normalizedPath = location.pathname.replace(/\/+$/, "") || "/";
const marketplaceCartEnabled =
  normalizedPath === "/marketplace" ||
  normalizedPath.startsWith("/marketplace/") ||
  normalizedPath === "/gift-tokens";

if (marketplaceCartEnabled) {
  const storageKey = "kulturemonie_shop_cart";
  const addButtons = [...document.querySelectorAll("[data-add-to-cart]")];

  const formatMoney = (value) => `N${Number(value).toLocaleString()}`;
  const readCart = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };
  const writeCart = (items) => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  };

  const fab = document.createElement("button");
  fab.type = "button";
  fab.className = "shop-cart-fab";
  fab.setAttribute("aria-expanded", "false");
  fab.setAttribute("aria-controls", "shop-cart-panel");
  fab.setAttribute("aria-label", "Open cart");
  fab.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.6"></circle><circle cx="18" cy="20" r="1.6"></circle><path d="M3 4h2.2l1.9 9.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.7L20 7H6.2"></path></svg><span class="shop-cart-fab__count">0</span>';

  const panel = document.createElement("aside");
  panel.id = "shop-cart-panel";
  panel.className = "shop-cart-panel";
  panel.hidden = true;
  panel.innerHTML = `
    <div class="shop-cart-head">
      <div>
        <h3>Cart</h3>
        <p>Items added from this shop page.</p>
      </div>
      <button type="button" class="shop-cart-close" aria-label="Close cart">×</button>
    </div>
    <div class="shop-cart-body" data-shop-cart-body></div>
    <div class="shop-cart-foot">
      <div class="shop-cart-total">
        <strong>Total</strong>
        <strong data-shop-cart-total>N0</strong>
      </div>
      <div class="shop-cart-actions">
        <a class="btn btn-outline" href="/marketplace">Keep Shopping</a>
        <a class="btn btn-primary" href="/contact?intent=shop-cart-checkout">Checkout</a>
      </div>
    </div>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  const countEl = fab.querySelector(".shop-cart-fab__count");
  const bodyEl = panel.querySelector("[data-shop-cart-body]");
  const totalEl = panel.querySelector("[data-shop-cart-total]");
  const closeBtn = panel.querySelector(".shop-cart-close");

  const renderCart = () => {
    const cart = readCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (countEl) countEl.textContent = String(totalItems);
    if (totalEl) totalEl.textContent = formatMoney(totalValue);
    if (!bodyEl) return;

    if (!cart.length) {
      bodyEl.innerHTML = '<div class="shop-cart-empty">Your cart is empty.</div>';
      return;
    }

    bodyEl.innerHTML = cart.map((item, index) => `
      <div class="shop-cart-row">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h4>${item.name}</h4>
          <div class="shop-cart-meta">Qty: ${item.quantity}</div>
          <div class="shop-cart-price">${formatMoney(item.price)}</div>
          <button type="button" class="shop-cart-remove" data-remove-cart-item="${index}">Remove</button>
        </div>
        <strong>${formatMoney(item.price * item.quantity)}</strong>
      </div>
    `).join("");
  };

  const openCart = () => {
    panel.hidden = false;
    fab.setAttribute("aria-expanded", "true");
  };
  const closeCart = () => {
    panel.hidden = true;
    fab.setAttribute("aria-expanded", "false");
  };

  fab.addEventListener("click", () => {
    if (panel.hidden) openCart();
    else closeCart();
  });

  if (closeBtn instanceof HTMLElement) {
    closeBtn.addEventListener("click", closeCart);
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const giftButton = target.closest("[data-gift-card-add-to-cart]");
    if (giftButton instanceof HTMLElement) {
      event.preventDefault();
      const amountInput = document.querySelector("[data-gift-amount-input]");
      const amount = amountInput instanceof HTMLInputElement ? Number(amountInput.value) : NaN;
      if (!Number.isFinite(amount)) return;

      const cart = readCart();
      const name = `FlixnFlex Gift Card - ${formatMoney(amount)}`;
      const image = "/assets/images/optimized/gift-card-mockup-v2.webp";
      const existing = cart.find((item) => item.name === name);
      if (existing) existing.quantity += 1;
      else cart.push({ name, price: amount, image, quantity: 1 });
      writeCart(cart);
      renderCart();
      openCart();
      return;
    }

    const addButton = target.closest("[data-add-to-cart]");
    if (addButton instanceof HTMLElement) {
      event.preventDefault();
      const name = addButton.getAttribute("data-cart-name");
      const price = Number(addButton.getAttribute("data-cart-price"));
      const image = addButton.getAttribute("data-cart-image") || "";
      if (!name || !Number.isFinite(price)) return;

      const cart = readCart();
      const existing = cart.find((item) => item.name === name);
      if (existing) existing.quantity += 1;
      else cart.push({ name, price, image, quantity: 1 });
      writeCart(cart);
      renderCart();
      openCart();
      return;
    }

    const removeButton = target.closest("[data-remove-cart-item]");
    if (removeButton instanceof HTMLElement) {
      const index = Number(removeButton.getAttribute("data-remove-cart-item"));
      const cart = readCart();
      if (Number.isInteger(index) && cart[index]) {
        cart.splice(index, 1);
        writeCart(cart);
        renderCart();
      }
      return;
    }

    if (!panel.hidden && !panel.contains(target) && !fab.contains(target)) {
      closeCart();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) closeCart();
  });

  renderCart();
}
