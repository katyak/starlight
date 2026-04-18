/* ============================================================
   STARLITE BALLROOM — script.js
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. Sticky Navbar ── */
  (function initStickyNav() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return;
    var THRESHOLD = 80;
    var ticking = false;

    function updateNav() {
      if (window.scrollY > THRESHOLD) {
        navbar.classList.add('nav--scrolled');
      } else {
        navbar.classList.remove('nav--scrolled');
      }
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          updateNav();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    updateNav();
  })();

  /* ── 2. Mobile Hamburger Menu ── */
  (function initMobileMenu() {
    var hamburger = document.getElementById('hamburger');
    var navLinks = document.getElementById('navLinks');
    if (!hamburger || !navLinks) return;

    function openMenu() {
      navLinks.classList.add('nav__links--open');
      hamburger.classList.add('nav__hamburger--active');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      var firstLink = navLinks.querySelector('a');
      if (firstLink) firstLink.focus();
    }

    function closeMenu() {
      navLinks.classList.remove('nav__links--open');
      hamburger.classList.remove('nav__hamburger--active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', function () {
      if (navLinks.classList.contains('nav__links--open')) {
        closeMenu();
        hamburger.focus();
      } else {
        openMenu();
      }
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('nav__links--open')) {
        closeMenu();
        hamburger.focus();
      }
    });
  })();

  /* ── 3. Scroll Reveal ── */
  (function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal, .reveal-stagger > *').forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    var revealEls = document.querySelectorAll('.reveal');
    var staggerEls = document.querySelectorAll('.reveal-stagger > *');

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(function (el) { observer.observe(el); });
    staggerEls.forEach(function (el) { observer.observe(el); });
  })();

  /* ── 4. Active Nav Link Highlighting ── */
  (function initActiveNav() {
    if (!('IntersectionObserver' in window)) return;

    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav__links a[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    var activeId = null;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          activeId = entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + activeId);
          });
        }
      });
    }, {
      threshold: 0.25,
      rootMargin: '-80px 0px -40% 0px'
    });

    sections.forEach(function (s) { observer.observe(s); });
  })();

  /* ── 5. Testimonial Carousel (mobile) ── */
  (function initTestimonialCarousel() {
    var grid = document.getElementById('testimonialsGrid');
    var prevBtn = document.getElementById('testimPrev');
    var nextBtn = document.getElementById('testimNext');
    var dotsContainer = document.getElementById('testimDots');
    if (!grid || !prevBtn || !nextBtn || !dotsContainer) return;

    var cards = Array.from(grid.querySelectorAll('.testimonial-card'));
    if (!cards.length) return;

    var current = 0;
    var isMobile = false;

    cards.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'testimonials__dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Testimonial ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsContainer.appendChild(dot);
    });

    var dots = Array.from(dotsContainer.querySelectorAll('.testimonials__dot'));

    function goTo(index) {
      current = ((index % cards.length) + cards.length) % cards.length;
      var cardWidth = cards[0].offsetWidth;
      var gap = parseFloat(getComputedStyle(grid).gap) || 24;
      grid.style.transform = 'translateX(-' + (current * (cardWidth + gap)) + 'px)';
      updateDots();
    }

    function updateDots() {
      dots.forEach(function (dot, i) {
        dot.classList.toggle('testimonials__dot--active', i === current);
        dot.setAttribute('aria-selected', String(i === current));
      });
    }

    prevBtn.addEventListener('click', function () { goTo(current - 1); });
    nextBtn.addEventListener('click', function () { goTo(current + 1); });

    function checkLayout() {
      isMobile = window.innerWidth < 768;
      if (!isMobile) {
        grid.style.transform = '';
        current = 0;
        updateDots();
      }
    }

    checkLayout();
    updateDots();
    window.addEventListener('resize', checkLayout, { passive: true });
  })();

  /* ── 6. Particle Canvas (Hero) ── */
  (function initParticles() {
    var canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReduced.matches) {
      canvas.style.display = 'none';
      return;
    }

    var ctx = canvas.getContext('2d');
    var isMobile = window.innerWidth < 768;
    var COUNT = isMobile ? 45 : 85;
    var particles = [];
    var animFrame;
    var GOLD_R = 201, GOLD_G = 168, GOLD_B = 76;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      isMobile = window.innerWidth < 768;
    }

    function Particle() { this.reset(true); }
    Particle.prototype.reset = function (init) {
      this.x = Math.random() * canvas.width;
      this.y = init ? Math.random() * canvas.height : canvas.height + 10;
      this.size = Math.random() * 2 + 0.5;
      this.baseOpacity = Math.random() * 0.55 + 0.08;
      this.speed = Math.random() * 0.35 + 0.08;
      this.drift = (Math.random() - 0.5) * 0.18;
      this.twinkleSpeed = Math.random() * 0.018 + 0.004;
      this.twinkleOffset = Math.random() * Math.PI * 2;
      this.currentOpacity = this.baseOpacity;
    };
    Particle.prototype.update = function (t) {
      this.y -= this.speed;
      this.x += this.drift;
      this.currentOpacity = this.baseOpacity * (0.5 + 0.5 * Math.sin(t * this.twinkleSpeed + this.twinkleOffset));
      if (this.y < -10) this.reset(false);
    };
    Particle.prototype.draw = function () {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + GOLD_R + ',' + GOLD_G + ',' + GOLD_B + ',' + this.currentOpacity + ')';
      ctx.fill();
    };

    function Sparkle() { Particle.call(this); }
    Sparkle.prototype = Object.create(Particle.prototype);
    Sparkle.prototype.draw = function () {
      var s = this.size * 2.2;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.globalAlpha = this.currentOpacity * 0.65;
      ctx.strokeStyle = 'rgb(' + GOLD_R + ',' + GOLD_G + ',' + GOLD_B + ')';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(-s, 0); ctx.lineTo(s, 0);
      ctx.moveTo(0, -s); ctx.lineTo(0, s);
      ctx.stroke();
      ctx.restore();
    };

    function init() {
      particles = [];
      var sparkleCount = Math.floor(COUNT * 0.15);
      for (var i = 0; i < COUNT - sparkleCount; i++) particles.push(new Particle());
      for (var j = 0; j < sparkleCount; j++) particles.push(new Sparkle());
    }

    function animate(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        particles[i].update(t);
        particles[i].draw();
      }
      animFrame = requestAnimationFrame(animate);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(animFrame);
      } else {
        animate(performance.now());
      }
    });

    resize();
    init();
    animate(0);

    window.addEventListener('resize', function () {
      resize();
      init();
    }, { passive: true });
  })();

  /* ── 7. Current Year ── */
  var yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── 8. Contact Form Validation ── */
  (function initFormValidation() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    function showError(input, message) {
      var field = input.closest('.form-field');
      if (!field) return;
      var errorEl = field.querySelector('.form-field__error');
      if (errorEl) errorEl.textContent = message;
      input.style.borderColor = '#e06060';
    }

    function clearError(input) {
      var field = input.closest('.form-field');
      if (!field) return;
      var errorEl = field.querySelector('.form-field__error');
      if (errorEl) errorEl.textContent = '';
      input.style.borderColor = '';
    }

    form.querySelectorAll('input[required], input[type="email"]').forEach(function (input) {
      input.addEventListener('blur', function () {
        if (input.required && !input.value.trim()) {
          showError(input, 'This field is required.');
        } else if (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
          showError(input, 'Please enter a valid email address.');
        } else {
          clearError(input);
        }
      });
      input.addEventListener('input', function () { clearError(input); });
    });

    form.addEventListener('submit', function (e) {
      var valid = true;
      var firstName = form.querySelector('#firstName');
      var lastName = form.querySelector('#lastName');
      var email = form.querySelector('#email');

      if (firstName && !firstName.value.trim()) {
        showError(firstName, 'Please enter your first name.');
        valid = false;
      }
      if (lastName && !lastName.value.trim()) {
        showError(lastName, 'Please enter your last name.');
        valid = false;
      }
      if (email && !email.value.trim()) {
        showError(email, 'Please enter your email address.');
        valid = false;
      } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        showError(email, 'Please enter a valid email address.');
        valid = false;
      }

      if (!valid) {
        e.preventDefault();
        var firstError = form.querySelector('input[style*="border-color"]');
        if (firstError) firstError.focus();
      }
    });
  })();

})();
