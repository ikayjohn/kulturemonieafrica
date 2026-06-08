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
