const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
}

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
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  revealEls.forEach((el) => observer.observe(el));
}

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
