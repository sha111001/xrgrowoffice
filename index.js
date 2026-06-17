(() => {
  'use strict';

  

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  function initScrollTop() {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (!scrollTopBtn) return;

    const toggle = () => {
      if (window.scrollY > 100) scrollTopBtn.classList.remove('hidden');
      else scrollTopBtn.classList.add('hidden');
    };

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
  }

  function initModal() {
    const modal = document.getElementById('modalContainer');
    if (!modal) return;

    const openTargets = document.querySelectorAll('.open-login, #openModal');
    const closeBtn = document.getElementById('closeModal');
    const loginForm = modal.querySelector('.login-form');
    const closeTargets = modal.querySelectorAll('.login-btn, .icon-naver, .icon-kakao');

    const openModal = (event) => {
      if (event) event.preventDefault();
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      const firstInput = modal.querySelector('input');
      if (firstInput) firstInput.focus({ preventScroll: true });
    };

    const closeModal = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    };

    const markLoggedIn = () => {
      const targetImg = document.querySelector('.user-icon img');
      if (!targetImg) return;
      targetImg.src = './img/icon_login_me_new.png';
      targetImg.style.width = '32px';
    };

    openTargets.forEach((target) => target.addEventListener('click', openModal));
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    if (loginForm) {
      loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        markLoggedIn();
        closeModal();
      });
    }

    closeTargets.forEach((target) => {
      target.addEventListener('click', (event) => {
        event.preventDefault();
        markLoggedIn();
        closeModal();
      });
    });

    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  }

  function initMobileMenu() {
    const checkBox = document.getElementById('check_box');
    const sideMenu = document.getElementById('side_menu');
    if (!checkBox || !sideMenu) return;

    sideMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        checkBox.checked = false;
      });
    });
  }

  function initMainVideo() {
    const mainVideo = document.querySelector('.main_int #mainVideo[data-toggle-sound="true"]');
    if (!mainVideo) return;

    const tryPlay = () => {
      const playPromise = mainVideo.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          mainVideo.muted = true;
          mainVideo.play().catch(() => {});
        });
      }
    };

    mainVideo.addEventListener('click', () => {
      mainVideo.muted = !mainVideo.muted;
      tryPlay();
    });

    tryPlay();
  }

  function initIntroRotator() {
    const slides = Array.from(document.querySelectorAll('.main_soge .slide'));
    if (slides.length === 0) return;

    let currentIndex = Math.min(1, slides.length - 1);

    const rotateSlides = () => {
      slides.forEach((slide, index) => {
        slide.classList.remove('active', 'prev', 'next');

        if (index === currentIndex) {
          slide.classList.add('active');
        } else if (index === (currentIndex - 1 + slides.length) % slides.length) {
          slide.classList.add('prev');
        } else {
          slide.classList.add('next');
        }
      });
    };

    rotateSlides();
    window.setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      rotateSlides();
    }, 7000);
  }

  function initGrowSlider() {
    const container = document.querySelector('.xr-grow-wrapper .grow-slider-container');
    const track = document.querySelector('.xr-grow-wrapper .grow-slider-track');
    const cards = Array.from(document.querySelectorAll('.xr-grow-wrapper .grow-card'));
    if (!container || !track || cards.length === 0) return;

    let currentIndex = 0;
    let isDragging = false;
    let startX = 0;
    let prevTranslate = 0;
    let currentTranslate = 0;
    let activePointerId = null;

    const getStep = () => {
      if (cards.length > 1) {
        const first = cards[0].getBoundingClientRect();
        const second = cards[1].getBoundingClientRect();
        const measured = second.left - first.left;
        if (measured > 0) return measured;
      }
      const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      return cards[0].offsetWidth + gap;
    };

    const getMaxIndex = () => cards.length - 1;

    const updateActive = () => {
      cards.forEach((card, index) => card.classList.toggle('active', index === currentIndex));
    };

    const setTranslate = (value, animate = true) => {
      track.style.transition = animate ? 'transform 0.32s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
      track.style.transform = `translateX(${value}px)`;
    };

    const snap = (animate = true) => {
      currentIndex = clamp(currentIndex, 0, getMaxIndex());
      currentTranslate = -(currentIndex * getStep());
      prevTranslate = currentTranslate;
      setTranslate(currentTranslate, animate);
      updateActive();
    };

    const onPointerDown = (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      isDragging = true;
      activePointerId = event.pointerId;
      startX = event.clientX;
      container.style.cursor = 'grabbing';
      track.setPointerCapture?.(activePointerId);
      setTranslate(prevTranslate, false);
    };

    const onPointerMove = (event) => {
      if (!isDragging || event.pointerId !== activePointerId) return;
      const diff = event.clientX - startX;
      currentTranslate = prevTranslate + diff;
      setTranslate(currentTranslate, false);
    };

    const onPointerUp = (event) => {
      if (!isDragging || event.pointerId !== activePointerId) return;
      const diff = event.clientX - startX;
      const threshold = Math.max(45, getStep() * 0.18);

      if (diff < -threshold) currentIndex += 1;
      else if (diff > threshold) currentIndex -= 1;

      isDragging = false;
      activePointerId = null;
      container.style.cursor = 'grab';
      snap(true);
    };

    track.addEventListener('pointerdown', onPointerDown);
    track.addEventListener('pointermove', onPointerMove);
    track.addEventListener('pointerup', onPointerUp);
    track.addEventListener('pointercancel', onPointerUp);
    track.addEventListener('dragstart', (event) => event.preventDefault());
    window.addEventListener('resize', () => snap(false));

    snap(false);
  }

  function initVrSlider() {
    const container = document.getElementById('vrSlider');
    const track = document.getElementById('vrTrack');
    const slides = track ? Array.from(track.querySelectorAll('.vr_slide')) : [];
    if (!container || !track || slides.length === 0) return;

    let currentIndex = 0;
    let isDragging = false;
    let startX = 0;
    let prevTranslate = 0;
    let currentTranslate = 0;
    let activePointerId = null;

    const getCenterPosition = (index) => {
      const slide = slides[index];
      const containerWidth = container.offsetWidth;
      const slideWidth = slide.offsetWidth;
      const centerOffset = containerWidth / 2 - slideWidth / 2;
      return centerOffset - slide.offsetLeft;
    };

    const updateActive = () => {
      slides.forEach((slide, index) => slide.classList.toggle('active', index === currentIndex));
    };

    const setTranslate = (value, animate = true) => {
      track.style.transition = animate ? 'transform 0.35s ease-out' : 'none';
      track.style.transform = `translateX(${value}px)`;
    };

    const snap = (animate = true) => {
      currentTranslate = getCenterPosition(currentIndex);
      prevTranslate = currentTranslate;
      setTranslate(currentTranslate, animate);
      updateActive();
    };

    const goBy = (direction) => {
      currentIndex = (currentIndex + direction + slides.length) % slides.length;
      snap(true);
    };

    const onPointerDown = (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      isDragging = true;
      activePointerId = event.pointerId;
      startX = event.clientX;
      track.classList.add('grabbing');
      track.setPointerCapture?.(activePointerId);
      setTranslate(prevTranslate, false);
    };

    const onPointerMove = (event) => {
      if (!isDragging || event.pointerId !== activePointerId) return;
      const diff = event.clientX - startX;
      currentTranslate = prevTranslate + diff;
      setTranslate(currentTranslate, false);
    };

    const onPointerUp = (event) => {
      if (!isDragging || event.pointerId !== activePointerId) return;
      const diff = event.clientX - startX;
      const threshold = Math.max(70, slides[0].offsetWidth * 0.16);

      if (diff < -threshold) goBy(1);
      else if (diff > threshold) goBy(-1);
      else snap(true);

      isDragging = false;
      activePointerId = null;
      track.classList.remove('grabbing');
    };

    track.addEventListener('pointerdown', onPointerDown);
    track.addEventListener('pointermove', onPointerMove);
    track.addEventListener('pointerup', onPointerUp);
    track.addEventListener('pointercancel', onPointerUp);
    track.addEventListener('dragstart', (event) => event.preventDefault());
    window.addEventListener('resize', () => snap(false));

    snap(false);
  }

  function initSub1Nav() {
    const buttons = Array.from(document.querySelectorAll('.sub1_btn button'));
    if (buttons.length === 0) return;

    const targets = [
      document.querySelector('.service-section'),
      document.querySelector('.sub_1_grow'),
      document.querySelector('.exp_1_grow')
    ];

    buttons.forEach((button, index) => {
      button.addEventListener('click', () => {
        const target = targets[index];
        if (!target) return;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function initSub1Cards() {
    const container = document.querySelector('.card_sec');
    const cards = container ? Array.from(container.querySelectorAll('.grow-card')) : [];
    if (!container || cards.length === 0) return;

    const setActiveByIndex = (index) => {
      cards.forEach((card, cardIndex) => card.classList.toggle('active', cardIndex === index));
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = cards.indexOf(entry.target);
        if (index >= 0) setActiveByIndex(index);
      });
    }, {
      root: container,
      threshold: 0.58
    });

    cards.forEach((card) => observer.observe(card));

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    container.addEventListener('pointerdown', (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      isDown = true;
      startX = event.clientX;
      scrollLeft = container.scrollLeft;
      container.setPointerCapture?.(event.pointerId);
    });

    container.addEventListener('pointermove', (event) => {
      if (!isDown) return;
      const diff = event.clientX - startX;
      container.scrollLeft = scrollLeft - diff * 1.2;
    });

    const endDrag = () => { isDown = false; };
    container.addEventListener('pointerup', endDrag);
    container.addEventListener('pointercancel', endDrag);
  }

  function initSub2Slider() {
    const sliderTrack = document.getElementById('sliderTrack');
    const sliderContainer = document.querySelector('.slider-container');
    const slides = sliderTrack ? Array.from(sliderTrack.querySelectorAll('.slide')) : [];
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const navButtons = Array.from(document.querySelectorAll('.sub2_btn .nav-btn'));
    const video = sliderTrack ? sliderTrack.querySelector('video') : null;

    if (!sliderTrack || !sliderContainer || slides.length === 0) return;

    let currentIndex = 0;
    let isDragging = false;
    let startX = 0;
    let activePointerId = null;

    const updateVideo = () => {
      if (!video) return;
      if (currentIndex === 0) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    const showSlide = (index, animate = true) => {
      currentIndex = (index + slides.length) % slides.length;
      sliderTrack.style.transition = animate ? 'transform 0.5s ease-in-out' : 'none';
      sliderTrack.style.transform = `translateX(-${currentIndex * 100}%)`;

      navButtons.forEach((button, buttonIndex) => {
        button.classList.toggle('active', buttonIndex === currentIndex);
      });

      updateVideo();
    };

    const onPointerDown = (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      isDragging = true;
      activePointerId = event.pointerId;
      startX = event.clientX;
      sliderTrack.classList.add('grabbing');
      sliderTrack.setPointerCapture?.(activePointerId);
      sliderTrack.style.transition = 'none';
    };

    const onPointerMove = (event) => {
      if (!isDragging || event.pointerId !== activePointerId) return;
      const diff = event.clientX - startX;
      const percentOffset = (diff / sliderContainer.offsetWidth) * 100;
      sliderTrack.style.transform = `translateX(calc(-${currentIndex * 100}% + ${percentOffset}%))`;
    };

    const onPointerUp = (event) => {
      if (!isDragging || event.pointerId !== activePointerId) return;
      const diff = event.clientX - startX;
      const threshold = Math.max(70, sliderContainer.offsetWidth * 0.12);

      if (diff < -threshold) showSlide(currentIndex + 1, true);
      else if (diff > threshold) showSlide(currentIndex - 1, true);
      else showSlide(currentIndex, true);

      isDragging = false;
      activePointerId = null;
      sliderTrack.classList.remove('grabbing');
    };

    prevBtn?.addEventListener('click', () => showSlide(currentIndex - 1));
    nextBtn?.addEventListener('click', () => showSlide(currentIndex + 1));

    navButtons.forEach((button, index) => {
      button.addEventListener('click', () => showSlide(index));
    });

    sliderTrack.addEventListener('pointerdown', onPointerDown);
    sliderTrack.addEventListener('pointermove', onPointerMove);
    sliderTrack.addEventListener('pointerup', onPointerUp);
    sliderTrack.addEventListener('pointercancel', onPointerUp);
    sliderTrack.addEventListener('dragstart', (event) => event.preventDefault());

    window.addEventListener('resize', () => showSlide(currentIndex, false));
    showSlide(0, false);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initScrollTop();
    initModal();
    initMobileMenu();
    initMainVideo();
    initIntroRotator();
    initGrowSlider();
    initVrSlider();
    initSub1Nav();
    initSub1Cards();
    initSub2Slider();
  });
})();

