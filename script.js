
document.addEventListener("DOMContentLoaded", () => {
    const topbar = document.querySelector(".topbar");
    const header = document.querySelector(".site-header");
    const navToggle = document.querySelector(".nav-toggle");
    const navMenu = document.querySelector(".nav-menu");
    const navOverlay = document.querySelector(".nav-overlay");
    const dropdownItems = document.querySelectorAll(".nav-item.has-dropdown");
    const dropdownButtons = document.querySelectorAll(".dropdown-toggle");
    const quoteButtons = document.querySelectorAll(".quote-btn");
    const quoteModal = document.querySelector(".quote-modal");
    const modalContent = document.querySelector(".modal-content");
    const modalClose = document.querySelector(".modal-close");
    const forms = document.querySelectorAll("#quoteForm, #contactForm");

    let lastFocusedElement = null;

    function handleScroll() {
        const scrolled = window.scrollY > 80;

        topbar?.classList.toggle("topbar-hidden", scrolled);
        header?.classList.toggle("sticky", scrolled);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    function closeAllDropdowns(except = null) {
        dropdownItems.forEach(item => {
            if (item === except) return;

            item.classList.remove("is-open");
            item.querySelector(".dropdown-toggle")
                ?.setAttribute("aria-expanded", "false");
        });
    }

    function toggleDropdown(item) {
        const isOpen = item.classList.contains("is-open");

        closeAllDropdowns();

        if (!isOpen) {
            item.classList.add("is-open");
            item.querySelector(".dropdown-toggle")
                ?.setAttribute("aria-expanded", "true");
        }
    }

    dropdownButtons.forEach(button => {
        button.addEventListener("click", () => {
            const item = button.closest(".nav-item.has-dropdown");
            if (item) toggleDropdown(item);
        });
    });

    dropdownItems.forEach(item => {
        item.addEventListener("mouseenter", () => {
            if (window.innerWidth > 991) {
                closeAllDropdowns();
                item.classList.add("is-open");
                item.querySelector(".dropdown-toggle")
                    ?.setAttribute("aria-expanded", "true");
            }
        });

        item.addEventListener("mouseleave", () => {
            if (window.innerWidth > 991) {
                item.classList.remove("is-open");
                item.querySelector(".dropdown-toggle")
                    ?.setAttribute("aria-expanded", "false");
            }
        });
    });

    document.addEventListener("click", event => {
        if (!event.target.closest(".nav-item.has-dropdown")) {
            closeAllDropdowns();
        }
    });

    function openMobileMenu() {
        navMenu?.classList.add("active");
        navToggle?.classList.add("active");
        navOverlay?.classList.add("active");
        navToggle?.setAttribute("aria-expanded", "true");
        document.body.classList.add("menu-open");
    }

    function closeMobileMenu() {
        navMenu?.classList.remove("active");
        navToggle?.classList.remove("active");
        navOverlay?.classList.remove("active");
        navToggle?.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
        closeAllDropdowns();
    }

    navToggle?.addEventListener("click", () => {
        if (navMenu?.classList.contains("active")) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    navOverlay?.addEventListener("click", closeMobileMenu);

    navMenu?.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMobileMenu);
    });

    function openQuoteModal() {
        if (!quoteModal) return;

        lastFocusedElement = document.activeElement;
        closeMobileMenu();

        quoteModal.classList.add("active");
        quoteModal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");

        setTimeout(() => {
            quoteModal.querySelector("input")?.focus();
        }, 100);
    }

    function closeQuoteModal() {
        if (!quoteModal) return;

        quoteModal.classList.remove("active");
        quoteModal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");

        lastFocusedElement?.focus();
    }

    quoteButtons.forEach(button => {
        button.addEventListener("click", openQuoteModal);
    });

    modalClose?.addEventListener("click", closeQuoteModal);

    quoteModal?.addEventListener("click", event => {
        if (event.target === quoteModal) {
            closeQuoteModal();
        }
    });

    const focusableSelector = [
        "a[href]",
        "button:not([disabled])",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        '[tabindex]:not([tabindex="-1"])'
    ].join(",");

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            if (quoteModal?.classList.contains("active")) {
                closeQuoteModal();
            } else if (navMenu?.classList.contains("active")) {
                closeMobileMenu();
                navToggle?.focus();
            } else {
                closeAllDropdowns();
            }
        }

        if (
            event.key === "Tab" &&
            quoteModal?.classList.contains("active")
        ) {
            const focusable = [
                ...quoteModal.querySelectorAll(focusableSelector)
            ].filter(element => element.getClientRects().length > 0);

            if (!focusable.length) {
                event.preventDefault();
                modalContent?.focus();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });

    function clearFormErrors(form) {
        form.querySelectorAll(".form-error").forEach(error => {
            error.remove();
        });

        form.querySelectorAll(".invalid").forEach(field => {
            field.classList.remove("invalid");
            field.removeAttribute("aria-invalid");
        });
    }

    function showFieldError(field, message) {
        field.classList.add("invalid");
        field.setAttribute("aria-invalid", "true");

        const error = document.createElement("span");
        error.className = "form-error";
        error.textContent = message;

        field.insertAdjacentElement("afterend", error);
    }

    function validateForm(form) {
        clearFormErrors(form);

        let valid = true;

        const name = form.querySelector('[name="name"]');
        const phone = form.querySelector('[name="phone"]');
        const email = form.querySelector('[name="email"]');
        const service = form.querySelector('[name="service"]');
        const message = form.querySelector('[name="message"]');

        if (!name.value.trim()) {
            showFieldError(name, "Please enter your name.");
            valid = false;
        } else if (name.value.trim().length < 2) {
            showFieldError(name, "Name must contain at least 2 characters.");
            valid = false;
        }

        const digits = phone.value.replace(/\D/g, "");

        if (!phone.value.trim()) {
            showFieldError(phone, "Please enter your phone number.");
            valid = false;
        } else if (digits.length < 10 || digits.length > 15) {
            showFieldError(phone, "Please enter a valid phone number.");
            valid = false;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
            showFieldError(email, "Please enter a valid email address.");
            valid = false;
        }

        if (!service.value) {
            showFieldError(service, "Please select a service.");
            valid = false;
        }

        if (!message.value.trim()) {
            showFieldError(message, "Please enter your message.");
            valid = false;
        } else if (message.value.trim().length < 10) {
            showFieldError(message, "Message must contain at least 10 characters.");
            valid = false;
        }

        return valid;
    }

    forms.forEach(form => {
        form.addEventListener("submit", event => {
            event.preventDefault();

            const status = form.querySelector(".form-status");

            if (!validateForm(form)) {
                status.textContent = "Please correct the highlighted fields.";
                status.className = "form-status error";
                form.querySelector(".invalid")?.focus();
                return;
            }

            status.textContent =
                "Demo successful! Connect a form service to receive real enquiries.";

            status.className = "form-status success";

            form.reset();
            clearFormErrors(form);
        });

        form.addEventListener("input", event => {
            if (event.target.classList.contains("invalid")) {
                event.target.classList.remove("invalid");
                event.target.removeAttribute("aria-invalid");
                event.target.parentElement.querySelector(".form-error")?.remove();
            }
        });

        form.addEventListener("change", event => {
            if (event.target.classList.contains("invalid")) {
                event.target.classList.remove("invalid");
                event.target.removeAttribute("aria-invalid");
                event.target.parentElement.querySelector(".form-error")?.remove();
            }
        });
    });

    const year = document.querySelector("#currentYear");

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    const revealElements = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    } else {
        revealElements.forEach(element => {
            element.classList.add("visible");
        });
    }

    let previousMobileState = window.innerWidth <= 991;

    window.addEventListener("resize", () => {
        const currentMobileState = window.innerWidth <= 991;

        if (currentMobileState !== previousMobileState) {
            closeMobileMenu();
            closeAllDropdowns();
            previousMobileState = currentMobileState;
        }
    });
});
