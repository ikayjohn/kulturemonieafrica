const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navRoot = document.querySelector(".nav");

// 1) Mobile Navigation
if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (!navLinks.contains(target) && !menuToggle.contains(target)) {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
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
const currentPage = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-links a").forEach((link) => {
  const href = link.getAttribute("href");
  link.classList.toggle("active", href === currentPage);
});

document.querySelectorAll(".current-year").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

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
    if (!valid) e.preventDefault();
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
    e.preventDefault();
    vendorForm.classList.add("hidden");
    success.classList.remove("hidden");
  });
  renderStep();
}
