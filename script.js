/* =========================================================
   EAGLE WRITES - JavaScript
   Professional, Accessible, Production-Quality
========================================================= */

'use strict';

/* =========================================================
   1. CONFIGURATION
========================================================= */

const CONFIG = {
    scrollThreshold: 100,
    animationDuration: 600,
    revealOffset: 100,
    maxMessageLength: 1000,
    formSubmitDelay: 1000,
};

/* =========================================================
   2. UTILITY FUNCTIONS
========================================================= */

/**
 * Check if an element exists in the DOM
 * @param {string} selector - CSS selector
 * @returns {HTMLElement|null}
 */
function getElement(selector) {
    return document.querySelector(selector);
}

/**
 * Get all elements matching a selector
 * @param {string} selector - CSS selector
 * @returns {NodeList}
 */
function getAllElements(selector) {
    return document.querySelectorAll(selector);
}

/**
 * Add a class to an element
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class to add
 */
function addClass(element, className) {
    if (element) {
        element.classList.add(className);
    }
}

/**
 * Remove a class from an element
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class to remove
 */
function removeClass(element, className) {
    if (element) {
        element.classList.remove(className);
    }
}

/**
 * Toggle a class on an element
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class to toggle
 */
function toggleClass(element, className) {
    if (element) {
        element.classList.toggle(className);
    }
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean}
 */
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Smooth scroll to element
 * @param {HTMLElement} element - Target element
 * @param {number} offset - Offset from top
 */
function smoothScrollTo(element, offset = 0) {
    if (!element) return;
    
    const targetPosition = element.getBoundingClientRect().top + window.scrollY - offset;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 800;
    let start = null;

    function animation(currentTime) {
        if (start === null) start = currentTime;
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function: ease-in-out-cubic
        const easeProgress = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        window.scrollTo(0, startPosition + distance * easeProgress);
        
        if (elapsed < duration) {
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}

/**
 * Debounce function for performance
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function}
 */
function debounce(func, delay) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, delay);
    };
}

/**
 * Throttle function for performance
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function}
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/* =========================================================
   3. MOBILE NAVIGATION
========================================================= */

const MobileMenu = {
    menuToggle: getElement('#mobile-menu-toggle'),
    navMenu: getElement('#nav-menu'),
    navLinks: getAllElements('.nav-link'),
    isOpen: false,

    init() {
        if (!this.menuToggle || !this.navMenu) return;

        this.menuToggle.addEventListener('click', () => this.toggle());
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.close());
        });

        document.addEventListener('click', (e) => this.handleClickOutside(e));
        document.addEventListener('keydown', (e) => this.handleEscape(e));
    },

    toggle() {
        this.isOpen ? this.close() : this.open();
    },

    open() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        addClass(this.navMenu, 'active');
        addClass(this.menuToggle, 'active');
        this.menuToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    },

    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        removeClass(this.navMenu, 'active');
        removeClass(this.menuToggle, 'active');
        this.menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    },

    handleClickOutside(event) {
        if (this.isOpen && 
            !this.navMenu.contains(event.target) && 
            !this.menuToggle.contains(event.target)) {
            this.close();
        }
    },

    handleEscape(event) {
        if (event.key === 'Escape' && this.isOpen) {
            this.close();
        }
    }
};

/* =========================================================
   4. STICKY NAVBAR
========================================================= */

const StickyNavbar = {
    header: getElement('#header'),
    scrollThreshold: CONFIG.scrollThreshold,

    init() {
        if (!this.header) return;
        window.addEventListener('scroll', throttle(() => this.handleScroll(), 100));
    },

    handleScroll() {
        if (window.scrollY > this.scrollThreshold) {
            addClass(this.header, 'scrolled');
        } else {
            removeClass(this.header, 'scrolled');
        }
    }
};

/* =========================================================
   5. SMOOTH SCROLLING
========================================================= */

const SmoothScroll = {
    navbarHeight: 80, // Approximate fixed navbar height

    init() {
        const links = getAllElements('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => this.handleClick(e, link));
        });
    },

    handleClick(event, link) {
        const href = link.getAttribute('href');
        
        // Skip if it's just a hash or external link
        if (href === '#' || href.startsWith('http')) return;

        const target = getElement(href);
        if (!target) return;

        event.preventDefault();
        smoothScrollTo(target, this.navbarHeight);
    }
};

/* =========================================================
   6. ACTIVE NAVIGATION
========================================================= */

const ActiveNavigation = {
    sections: getAllElements('section[id]'),
    navLinks: getAllElements('.nav-link'),
    observer: null,

    init() {
        if (this.sections.length === 0 || this.navLinks.length === 0) return;

        const observerOptions = {
            root: null,
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    this.highlightLink(sectionId);
                }
            });
        }, observerOptions);

        this.sections.forEach(section => {
            this.observer.observe(section);
        });
    },

    highlightLink(sectionId) {
        this.navLinks.forEach(link => {
            removeClass(link, 'active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                addClass(link, 'active');
            }
        });
    }
};

/* =========================================================
   7. SCROLL REVEAL ANIMATIONS
========================================================= */

const ScrollReveal = {
    elements: getAllElements('[class*="reveal"]'),
    observer: null,
    prefersReduced: prefersReducedMotion(),

    init() {
        if (this.elements.length === 0 || this.prefersReduced) return;

        const observerOptions = {
            root: null,
            rootMargin: `0px 0px -${CONFIG.revealOffset}px 0px`,
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.reveal(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        this.elements.forEach(element => {
            addClass(element, 'reveal-hidden');
            this.observer.observe(element);
        });
    },

    reveal(element) {
        addClass(element, 'reveal-visible');
        removeClass(element, 'reveal-hidden');
    }
};

/* =========================================================
   8. BACK TO TOP BUTTON
========================================================= */

const BackToTop = {
    button: null,
    threshold: 300,

    init() {
        this.createButton();
        window.addEventListener('scroll', throttle(() => this.handleScroll(), 100));
        if (this.button) {
            this.button.addEventListener('click', () => this.scrollToTop());
        }
    },

    createButton() {
        const button = document.createElement('button');
        button.id = 'back-to-top';
        button.setAttribute('aria-label', 'Back to top');
        button.className = 'btn btn-primary back-to-top-btn';
        button.innerHTML = '↑ Top';
        button.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            display: none;
            z-index: 999;
            cursor: pointer;
            padding: 0.75rem 1.25rem;
            background-color: #F4C430;
            color: #0B1F3A;
            border: none;
            border-radius: 0.75rem;
            font-weight: 700;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(244, 196, 48, 0.3);
        `;

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-3px)';
            button.style.boxShadow = '0 8px 25px rgba(244, 196, 48, 0.4)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 4px 15px rgba(244, 196, 48, 0.3)';
        });

        document.body.appendChild(button);
        this.button = button;
    },

    handleScroll() {
        if (!this.button) return;

        if (window.scrollY > this.threshold) {
            this.button.style.display = 'flex';
            this.button.style.alignItems = 'center';
            this.button.style.justifyContent = 'center';
        } else {
            this.button.style.display = 'none';
        }
    },

    scrollToTop() {
        if (prefersReducedMotion()) {
            window.scrollTo(0, 0);
        } else {
            smoothScrollTo(document.documentElement, 0);
        }
    }
};

/* =========================================================
   9. CONTACT FORM VALIDATION
========================================================= */

const ContactForm = {
    form: getElement('#contact-form'),
    submitBtn: null,
    isSubmitting: false,
    fields: {},

    init() {
        if (!this.form) return;

        this.submitBtn = this.form.querySelector('button[type="submit"]');
        this.cacheFields();
        this.attachListeners();
    },

    cacheFields() {
        this.fields = {
            name: this.form.querySelector('#form-name'),
            email: this.form.querySelector('#form-email'),
            phone: this.form.querySelector('#form-phone'),
            service: this.form.querySelector('#form-service'),
            message: this.form.querySelector('#form-message')
        };
    },

    attachListeners() {
        if (!this.fields.name) return;

        Object.values(this.fields).forEach(field => {
            if (field) {
                field.addEventListener('blur', () => this.validateField(field));
                field.addEventListener('input', () => this.clearError(field));
            }
        });

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    },

    validateField(field) {
        if (!field) return true;

        const value = field.value.trim();
        const fieldType = field.name;

        if (!value) {
            this.showError(field, 'This field is required');
            return false;
        }

        if (fieldType === 'email' && !this.isValidEmail(value)) {
            this.showError(field, 'Please enter a valid email address');
            return false;
        }

        if (fieldType === 'phone' && value && !this.isValidPhone(value)) {
            this.showError(field, 'Please enter a valid phone number');
            return false;
        }

        if (fieldType === 'full_name' && value.length < 2) {
            this.showError(field, 'Name must be at least 2 characters');
            return false;
        }

        if (fieldType === 'message' && value.length < 10) {
            this.showError(field, 'Message must be at least 10 characters');
            return false;
        }

        this.clearError(field);
        return true;
    },

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    isValidPhone(phone) {
        const phoneRegex = /^[\d\s\+\-\(\)]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
    },

    showError(field, message) {
        if (!field) return;

        this.clearError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.style.cssText = `
            color: #dc2626;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: block;
        `;
        errorDiv.textContent = message;
        errorDiv.setAttribute('role', 'alert');

        field.setAttribute('aria-invalid', 'true');
        field.style.borderColor = '#dc2626';
        field.parentElement.appendChild(errorDiv);
    },

    clearError(field) {
        if (!field) return;

        const errorDiv = field.parentElement.querySelector('.form-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        field.setAttribute('aria-invalid', 'false');
        field.style.borderColor = '';
    },

    handleSubmit(event) {
        event.preventDefault();

        if (this.isSubmitting) return;

        // Validate all fields
        const isValid = Object.values(this.fields)
            .filter(field => field)
            .every(field => this.validateField(field));

        if (!isValid) {
            // Focus the first invalid field
            const firstInvalid = Object.values(this.fields).find(
                field => field && field.getAttribute('aria-invalid') === 'true'
            );
            if (firstInvalid) {
                firstInvalid.focus();
            }
            return;
        }

        this.submitForm();
    },

    submitForm() {
        this.isSubmitting = true;
        if (this.submitBtn) {
            this.submitBtn.disabled = true;
            this.submitBtn.textContent = 'Sending...';
        }

        // Simulate form processing
        setTimeout(() => {
            this.showSuccessMessage();
            this.resetForm();
            this.isSubmitting = false;
            
            if (this.submitBtn) {
                this.submitBtn.disabled = false;
                this.submitBtn.textContent = 'Send Message';
            }
        }, CONFIG.formSubmitDelay);
    },

    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'form-success';
        message.setAttribute('role', 'alert');
        message.style.cssText = `
            background-color: #dcfce7;
            color: #166534;
            padding: 1rem;
            border-radius: 0.75rem;
            margin-bottom: 1.5rem;
            border-left: 4px solid #16a34a;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        `;
        message.innerHTML = `
            <span style="font-size: 1.2rem;">✓</span>
            <div>
                <strong>Success!</strong>
                Your information has been validated successfully. The contact form will be connected to the EAGLE WRITES backend.
            </div>
        `;

        this.form.insertBefore(message, this.form.firstChild);

        setTimeout(() => {
            if (message.parentElement) {
                message.remove();
            }
        }, 5000);
    },

    resetForm() {
        this.form.reset();
        Object.values(this.fields).forEach(field => {
            if (field) {
                this.clearError(field);
            }
        });
    }
};

/* =========================================================
   10. MESSAGE CHARACTER COUNTER
========================================================= */

const CharacterCounter = {
    messageField: getElement('#form-message'),
    maxLength: CONFIG.maxMessageLength,
    counter: null,

    init() {
        if (!this.messageField) return;

        this.messageField.setAttribute('maxlength', this.maxLength);
        this.createCounter();
        this.messageField.addEventListener('input', () => this.updateCounter());
    },

    createCounter() {
        if (!this.messageField.parentElement) return;

        this.counter = document.createElement('div');
        this.counter.className = 'character-counter';
        this.counter.style.cssText = `
            font-size: 0.85rem;
            color: #64748B;
            margin-top: 0.5rem;
            text-align: right;
        `;
        this.counter.textContent = `0 / ${this.maxLength} characters`;

        this.messageField.parentElement.appendChild(this.counter);
    },

    updateCounter() {
        if (!this.counter) return;

        const length = this.messageField.value.length;
        this.counter.textContent = `${length} / ${this.maxLength} characters`;

        if (length > this.maxLength * 0.8) {
            this.counter.style.color = '#F4C430';
        } else if (length > this.maxLength * 0.9) {
            this.counter.style.color = '#dc2626';
        } else {
            this.counter.style.color = '#64748B';
        }
    }
};

/* =========================================================
   11. MODAL SYSTEM
========================================================= */

const Modal = {
    modals: {},

    init() {
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-modal-trigger]');
            if (trigger) {
                const modalId = trigger.getAttribute('data-modal-trigger');
                this.open(modalId);
            }

            const closeBtn = e.target.closest('[data-modal-close]');
            if (closeBtn) {
                const modal = closeBtn.closest('[data-modal]');
                if (modal) {
                    this.close(modal.id);
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('[data-modal].active');
                if (openModal) {
                    this.close(openModal.id);
                }
            }
        });
    },

    open(modalId) {
        const modal = getElement(`#${modalId}`);
        if (!modal) return;

        addClass(modal, 'active');
        document.body.style.overflow = 'hidden';
        modal.setAttribute('aria-hidden', 'false');
        
        // Trap focus
        this.trapFocus(modal);
    },

    close(modalId) {
        const modal = getElement(`#${modalId}`);
        if (!modal) return;

        removeClass(modal, 'active');
        document.body.style.overflow = '';
        modal.setAttribute('aria-hidden', 'true');
    },

    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        modal.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        });

        firstElement.focus();
    }
};

/* =========================================================
   12. FAQ ACCORDION
========================================================= */

const FAQ = {
    items: getAllElements('.faq-item'),
    singleOpen: true,

    init() {
        if (this.items.length === 0) return;

        this.items.forEach((item, index) => {
            const trigger = item.querySelector('.faq-trigger');
            if (trigger) {
                trigger.setAttribute('data-faq-index', index);
                trigger.addEventListener('click', () => this.toggleItem(item));
                trigger.addEventListener('keydown', (e) => this.handleKeyboard(e, item));
            }
        });
    },

    toggleItem(item) {
        const isOpen = item.classList.contains('open');

        if (this.singleOpen) {
            this.items.forEach(i => this.closeItem(i));
        }

        if (!isOpen) {
            this.openItem(item);
        } else {
            this.closeItem(item);
        }
    },

    openItem(item) {
        addClass(item, 'open');
        const trigger = item.querySelector('.faq-trigger');
        const content = item.querySelector('.faq-content');
        
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'true');
        }
        if (content) {
            content.style.maxHeight = content.scrollHeight + 'px';
        }
    },

    closeItem(item) {
        removeClass(item, 'open');
        const trigger = item.querySelector('.faq-trigger');
        const content = item.querySelector('.faq-content');
        
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
        }
        if (content) {
            content.style.maxHeight = '0';
        }
    },

    handleKeyboard(event, item) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.toggleItem(item);
        }
    }
};

/* =========================================================
   13. TESTIMONIAL SLIDER
========================================================= */

const Testimonials = {
    container: getElement('.testimonials-grid'),
    slides: getAllElements('.testimonial-card'),
    currentSlide: 0,
    autoplayInterval: null,
    autoplayDelay: 5000,

    init() {
        if (this.slides.length <= 1) return;

        // Check if slider controls exist
        const prevBtn = getElement('[data-testimonial-prev]');
        const nextBtn = getElement('[data-testimonial-next]');

        if (prevBtn || nextBtn) {
            this.setupControls();
        }
    },

    setupControls() {
        const prevBtn = getElement('[data-testimonial-prev]');
        const nextBtn = getElement('[data-testimonial-next]');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prev());
            prevBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.prev();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.next());
            nextBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.next();
                }
            });
        }

        this.startAutoplay();
        this.container.addEventListener('mouseenter', () => this.stopAutoplay());
        this.container.addEventListener('mouseleave', () => this.startAutoplay());
    },

    next() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.updateSlide();
        this.resetAutoplay();
    },

    prev() {
        this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.updateSlide();
        this.resetAutoplay();
    },

    updateSlide() {
        this.slides.forEach((slide, index) => {
            if (index === this.currentSlide) {
                addClass(slide, 'active');
                slide.setAttribute('aria-hidden', 'false');
            } else {
                removeClass(slide, 'active');
                slide.setAttribute('aria-hidden', 'true');
            }
        });
    },

    startAutoplay() {
        if (!prefersReducedMotion()) {
            this.autoplayInterval = setInterval(() => this.next(), this.autoplayDelay);
        }
    },

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
        }
    },

    resetAutoplay() {
        this.stopAutoplay();
        this.startAutoplay();
    }
};

/* =========================================================
   14. SERVICE CARDS INTERACTION
========================================================= */

const ServiceCards = {
    cards: getAllElements('.service-card'),

    init() {
        this.cards.forEach(card => {
            const link = card.querySelector('.service-link');
            if (link) {
                link.addEventListener('click', (e) => {
                    // Allow normal link behavior
                    // Just ensure accessibility
                    if (!link.href || link.href === '#') {
                        e.preventDefault();
                    }
                });

                // Add keyboard support
                link.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        if (!link.href || link.href === '#') {
                            e.preventDefault();
                        }
                    }
                });
            }
        });
    }
};

/* =========================================================
   15. BUTTON FEEDBACK
========================================================= */

const ButtonFeedback = {
    init() {
        const buttons = getAllElements('button, .btn');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Don't create ripple for already styled buttons
                if (button.classList.contains('mobile-menu-toggle') ||
                    button.classList.contains('back-to-top-btn')) {
                    return;
                }

                // Optional: Add click feedback via cursor
                if (e.clientX !== 0 && e.clientY !== 0) {
                    const feedback = document.createElement('span');
                    feedback.style.cssText = `
                        position: absolute;
                        left: ${e.clientX - button.getBoundingClientRect().left}px;
                        top: ${e.clientY - button.getBoundingClientRect().top}px;
                        pointer-events: none;
                    `;
                }
            });
        });
    }
};

/* =========================================================
   16. FORM PROTECTION
========================================================= */

const FormProtection = {
    init() {
        const forms = getAllElements('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn && submitBtn.disabled) {
                    e.preventDefault();
                }
            });
        });
    }
};

/* =========================================================
   17. CLIPBOARD / COPY BUTTON
========================================================= */

const Clipboard = {
    init() {
        document.addEventListener('click', (e) => {
            const copyBtn = e.target.closest('[data-copy]');
            if (copyBtn) {
                e.preventDefault();
                this.copy(copyBtn);
            }
        });
    },

    copy(button) {
        const text = button.getAttribute('data-copy');
        if (!text) return;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => this.showFeedback(button, 'Copied!'))
                .catch(() => this.fallbackCopy(text, button));
        } else {
            this.fallbackCopy(text, button);
        }
    },

    fallbackCopy(text, button) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            this.showFeedback(button, 'Copied!');
        } catch (err) {
            console.error('Copy failed:', err);
        }
        
        document.body.removeChild(textarea);
    },

    showFeedback(button, message) {
        const originalText = button.textContent;
        button.textContent = message;
        
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    }
};

/* =========================================================
   18. INITIALIZATION
========================================================= */

function initEagleWrites() {
    // Check if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeModules();
        });
    } else {
        initializeModules();
    }
}

function initializeModules() {
    // Initialize all modules
    MobileMenu.init();
    StickyNavbar.init();
    SmoothScroll.init();
    ActiveNavigation.init();
    ScrollReveal.init();
    BackToTop.init();
    ContactForm.init();
    CharacterCounter.init();
    Modal.init();
    FAQ.init();
    Testimonials.init();
    ServiceCards.init();
    ButtonFeedback.init();
    FormProtection.init();
    Clipboard.init();

    // Log initialization complete (development only)
    if (typeof console !== 'undefined' && console.log) {
        console.log('✓ EAGLE WRITES initialized successfully');
    }
}

// Start initialization when script loads
initEagleWrites();

/* =========================================================
   END OF SCRIPT
========================================================= */

// ===============================
// SUPABASE PASSWORD RESET
// ===============================

async function handlePasswordReset() {
    const hash = window.location.hash;

    if (!hash || !hash.includes("access_token")) {
        return;
    }

    const params = new URLSearchParams(hash.substring(1));

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (type !== "recovery" || !accessToken) {
        return;
    }

    const newPassword = prompt("Enter your new password:");

    if (!newPassword) {
        return;
    }

    if (newPassword.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    try {
        const response = await fetch(
            "http://localhost:5000/api/auth/update-password",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    password: newPassword
                })
            }
        );

        const result = await response.json();

        if (result.success) {
            alert("Password updated successfully. You can now log in.");
            window.location.hash = "";
            window.location.href = "/";
        } else {
            alert(result.error || "Failed to update password.");
        }

    } catch (error) {
        console.error("Password reset error:", error);
        alert("Unable to reset password. Please try again.");
    }
}

// ===============================
// COURSE ENROLLMENT
// ===============================

const CourseEnrollment = {

    init() {

        const enrollmentButtons = document.querySelectorAll(
            '[data-course-id]'
        );

        if (enrollmentButtons.length === 0) {
            return;
        }

        enrollmentButtons.forEach(button => {

            button.addEventListener('click', () => {
                this.handleEnrollment(button);
            });

        });

    },

    handleEnrollment(button) {

        const courseId = button.getAttribute('data-course-id');
        const courseTitle = button.getAttribute('data-course-title');

        if (!courseId || !courseTitle) {
            console.error('Course information is missing.');
            return;
        }

        console.log('Course selected:', {
            id: courseId,
            title: courseTitle
        });

        this.openEnrollmentForm(courseId, courseTitle);

    },

    openEnrollmentForm(courseId, courseTitle) {

        const existingModal = document.getElementById(
            'course-enrollment-modal'
        );

        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');

        modal.id = 'course-enrollment-modal';

        modal.innerHTML = `

            <div class="enrollment-overlay">

                <div class="enrollment-modal">

                    <button
                        type="button"
                        class="enrollment-close"
                        aria-label="Close enrollment form"
                    >
                        &times;
                    </button>

                    <div class="enrollment-header">

                        <div class="enrollment-brand">
                            EAGLE WRITES
                        </div>

                        <h2>Course Enrollment</h2>

                        <p>You are enrolling in:</p>

                        <h3>${courseTitle}</h3>

                    </div>

                    <form id="course-enrollment-form">

                        <input
                            type="hidden"
                            name="course_id"
                            value="${courseId}"
                        >

                        <input
                            type="hidden"
                            name="course_title"
                            value="${courseTitle}"
                        >

                        <div class="enrollment-field">

                            <label for="enrollment-name">
                                Full Name
                            </label>

                            <input
                                type="text"
                                id="enrollment-name"
                                name="full_name"
                                placeholder="Enter your full name"
                                required
                            >

                        </div>

                        <div class="enrollment-field">

                            <label for="enrollment-email">
                                Email Address
                            </label>

                            <input
                                type="email"
                                id="enrollment-email"
                                name="email"
                                placeholder="Enter your email address"
                                required
                            >

                        </div>

                        <div class="enrollment-field">

                            <label for="enrollment-phone">
                                Phone Number
                            </label>

                            <input
                                type="tel"
                                id="enrollment-phone"
                                name="phone"
                                placeholder="+254 XXX XXX XXX"
                                required
                            >

                        </div>

                        <div class="enrollment-field">

                            <label for="enrollment-message">
                                Additional Information
                            </label>

                            <textarea
                                id="enrollment-message"
                                name="message"
                                placeholder="Tell us anything you would like us to know..."
                                rows="4"
                            ></textarea>

                        </div>

                        <button
                            type="submit"
                            class="btn btn-primary enrollment-submit"
                        >
                            Submit Enrollment
                        </button>

                    </form>

                </div>

            </div>

        `;

        document.body.appendChild(modal);

        const closeButton = modal.querySelector(
            '.enrollment-close'
        );

        const overlay = modal.querySelector(
            '.enrollment-overlay'
        );

        const form = modal.querySelector(
            '#course-enrollment-form'
        );

        closeButton.addEventListener('click', () => {
            modal.remove();
        });

        overlay.addEventListener('click', (event) => {

            if (event.target === overlay) {
                modal.remove();
            }

        });

        form.addEventListener('submit', async (event) => {

            event.preventDefault();

            const formData = new FormData(form);

            const enrollmentData = {
                courseId: formData.get('course_id'),
                courseTitle: formData.get('course_title'),
                fullName: formData.get('full_name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                message: formData.get('message')
            };

            console.log('Enrollment submitted:', enrollmentData);

            const submitButton = form.querySelector(
                '.enrollment-submit'
            );

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Submitting...';
            }

            try {

                const { error } = await supabaseClient
                    .from('enrollments')
                    .insert([
                        {
                            course_id: formData.get('course_id'),
                            course_title: formData.get('course_title'),
                            full_name: formData.get('full_name'),
                            email: formData.get('email'),
                            phone: formData.get('phone'),
                            message: formData.get('message')
                        }
                    ]);

                if (error) {
                    console.error('Enrollment error:', error);

                    alert(
                        'We could not submit your enrollment. Please try again.'
                    );

                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = 'Submit Enrollment';
                    }

                    return;
                }

                alert(
                    'Thank you for your enrollment request. ' +
                    'EAGLE WRITES will contact you shortly.'
                );

                modal.remove();

            } catch (error) {

                console.error('Enrollment error:', error);

                alert(
                    'Something went wrong. Please try again.'
                );

                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Submit Enrollment';
                }

            }

        });

    }

};

document.addEventListener('DOMContentLoaded', () => {

    CourseEnrollment.init();

});