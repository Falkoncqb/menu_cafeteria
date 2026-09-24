/* ==========================================================================
   CAFETERÍA DE ESPECIALIDAD - SCRIPT DE PRODUCTOS DINÁMICOS & PANEL ADMIN
   Gestión en tiempo real de 5 productos por sección con sincronización a 60 FPS
   ========================================================================== */

(function () {
  'use strict';

  const TOTAL_FRAMES = 240;
  const CANVAS_WIDTH = 1280;
  const CANVAS_HEIGHT = 720;

  // ==========================================================================
  // ESTADO Y 5 PRODUCTOS POR DEFECTO PARA CADA SECCIÓN
  // ==========================================================================
  const DEFAULT_MENU = {
    section1: [
      { id: 's1-1', name: 'Cafe cortado', price: '$ 2.000.-', desc: 'Espresso doble balanceado con un toque sutil de leche tibia texturizada.' },
      { id: 's1-2', name: 'Cafe con leche', price: '$ 3.500.-', desc: 'Cremoso y reconfortante, café de origen fundido en leche entera caliente.' },
      { id: 's1-3', name: 'Capuccino', price: '$ 4.000.-', desc: 'Corona aterciopelada de microespuma densa con notas de cacao y avellana.' },
      { id: 's1-4', name: 'Mocaccino', price: '$ 5.000.-', desc: 'Espresso intenso, chocolate belga fundido y corona de crema dulce.' },
      { id: 's1-5', name: 'Espresso Doble', price: '$ 2.800.-', desc: 'Extracción pura de tueste medio con crema dorada y notas a frutos secos.' }
    ],
    section2: [
      { id: 's2-1', name: 'Torta tres leches', price: '$ 4.000.-', desc: 'Bizcochuelo esponjoso embebido en tres leches con delicado merengue italiano.' },
      { id: 's2-2', name: 'Panqueques', price: '$ 5.000.-', desc: 'Torre de panqueques dorados con miel de maple, frutos del bosque y mantequilla.' },
      { id: 's2-3', name: 'Paila con huevo y tomate', price: '$ 5.000.-', desc: 'Huevos de campo recién preparados en paila de greda con tomates salteados y tostadas.' },
      { id: 's2-4', name: 'Cheesecake de frutos rojos', price: '$ 4.500.-', desc: 'Base crocante de galleta con crema de queso suave y coulis de frambuesas.' },
      { id: 's2-5', name: 'Medialunas artesanales (2 un)', price: '$ 3.200.-', desc: 'Hojaldre tierno de mantequilla glaseado con almíbar tibio de vainilla.' }
    ]
  };

  // Cargar estado de localStorage o usar valores por defecto
  let menuData = loadMenuData();

  function loadMenuData() {
    try {
      const saved = localStorage.getItem('cafeteria_menu_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error leyendo localStorage, usando valores por defecto');
    }
    return JSON.parse(JSON.stringify(DEFAULT_MENU));
  }

  function saveMenuData() {
    try {
      localStorage.setItem('cafeteria_menu_v2', JSON.stringify(menuData));
    } catch (e) {}
  }

  // ==========================================================================
  // ELEMENTOS DOM
  // ==========================================================================
  const canvasHero = document.getElementById('canvasHero');
  const ctxHero = canvasHero.getContext('2d');
  const canvasSweets = document.getElementById('canvasSweets');
  const ctxSweets = canvasSweets.getContext('2d');

  const heroSection = document.getElementById('hero-section');
  const sweetsSection = document.getElementById('sweets-section');
  
  const heroProductsList = document.getElementById('hero-products-list');
  const sweetsProductsList = document.getElementById('sweets-products-list');

  const navBtn1 = document.getElementById('nav-btn-1');
  const navBtn2 = document.getElementById('nav-btn-2');
  const globalStatusTag = document.getElementById('global-status-tag');
  
  const heroTrackerFill = document.getElementById('heroTrackerFill');
  const sweetsTrackerFill = document.getElementById('sweetsTrackerFill');
  const heroDogCard = document.getElementById('heroDogCard');

  const loadingScreen = document.getElementById('loading-screen');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');

  // Elementos Panel Admin
  const adminOpenBtn = document.getElementById('admin-open-btn');
  const adminModalBackdrop = document.getElementById('adminModalBackdrop');
  const adminCloseBtn = document.getElementById('admin-close-btn');
  const adminTabs = Array.from(document.querySelectorAll('.admin-tab-btn'));
  const adminProductsEditor = document.getElementById('adminProductsEditor');
  const addProductBtn = document.getElementById('add-product-btn');
  const resetDefaultsBtn = document.getElementById('reset-defaults-btn');

  let activeAdminSection = 'section1';

  // Arrays de frames
  const heroFrames = new Array(TOTAL_FRAMES);
  const sweetsFrames = new Array(TOTAL_FRAMES);
  let totalLoaded = 0;
  const TOTAL_TO_LOAD = TOTAL_FRAMES * 2;

  let targetProgHero = 0;
  let currentProgHero = 0;
  let targetProgSweets = 0;
  let currentProgSweets = 0;

  function pad(num, size) {
    let s = num + '';
    while (s.length < size) s = '0' + s;
    return s;
  }

  // ==========================================================================
  // PRECARGA DE FRAMES
  // ==========================================================================
  function preloadAllFrames() {
    let initialReady = false;

    // 1. Frames Hero (Cafés)
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `frames/frame_${pad(i, 4)}.jpg`;
      img.onload = () => {
        totalLoaded++;
        checkLoader();
        if (i === 0) drawHeroFrame(0);
      };
      img.onerror = () => { totalLoaded++; };
      heroFrames[i] = img;
    }

    // 2. Frames Sección 2 (democafe1.mp4)
    for (let j = 0; j < TOTAL_FRAMES; j++) {
      const img = new Image();
      img.src = `frames_section2/frame_${pad(j, 4)}.jpg`;
      img.onload = () => {
        totalLoaded++;
        checkLoader();
        if (j === 0) drawSweetsFrame(0);
      };
      img.onerror = () => { totalLoaded++; };
      sweetsFrames[j] = img;
    }

    function checkLoader() {
      const pct = Math.floor((totalLoaded / TOTAL_TO_LOAD) * 100);
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (progressText) progressText.textContent = `${pct}%`;

      if (totalLoaded >= 50 && !initialReady) {
        initialReady = true;
        setTimeout(() => {
          if (loadingScreen) loadingScreen.classList.add('hidden');
        }, 200);
      }
    }
  }

  function drawHeroFrame(index) {
    const idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(index)));
    const img = heroFrames[idx];
    if (img && img.complete && img.naturalWidth !== 0) {
      ctxHero.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctxHero.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }

  function drawSweetsFrame(index) {
    const idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(index)));
    const img = sweetsFrames[idx];
    if (img && img.complete && img.naturalWidth !== 0) {
      ctxSweets.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctxSweets.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }

  // ==========================================================================
  // RENDERIZADO DINÁMICO DE PRODUCTOS EN EL SITIO
  // ==========================================================================
  function renderLiveCards() {
    // 1. Render Sección 1 (Hero Cafés)
    heroProductsList.innerHTML = '';
    const s1List = menuData.section1;
    const s1Count = s1List.length || 1;

    s1List.forEach((prod, idx) => {
      const revealThreshold = (idx / (s1Count + 0.4)) * 0.9;
      const activeMin = idx / s1Count;
      const activeMax = (idx + 1) / s1Count;

      const article = document.createElement('article');
      article.className = 'product-item';
      article.id = `hero-item-${prod.id}`;
      article.setAttribute('data-reveal', revealThreshold.toFixed(3));
      article.setAttribute('data-active-min', activeMin.toFixed(3));
      article.setAttribute('data-active-max', activeMax.toFixed(3));

      article.innerHTML = `
        <div class="product-bar"></div>
        <div class="product-content">
          <div class="product-line">
            <span class="product-name">${escapeHtml(prod.name)}</span>
            <span class="dots-leader"></span>
            <span class="product-price">${escapeHtml(prod.price)}</span>
          </div>
          <p class="product-note">${escapeHtml(prod.desc)}</p>
        </div>
      `;

      article.addEventListener('click', () => {
        const scrollable = heroSection.offsetHeight - window.innerHeight;
        const targetY = heroSection.offsetTop + activeMin * scrollable;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      });

      heroProductsList.appendChild(article);
    });

    // 2. Render Sección 2 (Tortas & Dulces)
    sweetsProductsList.innerHTML = '';
    const s2List = menuData.section2;
    const s2Count = s2List.length || 1;

    s2List.forEach((prod, idx) => {
      const revealThreshold = (idx / (s2Count + 0.2)) * 0.9;
      const activeMin = idx / s2Count;
      const activeMax = (idx + 1) / s2Count;

      const article = document.createElement('article');
      article.className = 'product-item';
      article.id = `sweets-item-${prod.id}`;
      article.setAttribute('data-reveal', revealThreshold.toFixed(3));
      article.setAttribute('data-active-min', activeMin.toFixed(3));
      article.setAttribute('data-active-max', activeMax.toFixed(3));

      article.innerHTML = `
        <div class="product-bar"></div>
        <div class="product-content">
          <div class="product-line">
            <span class="product-name">${escapeHtml(prod.name)}</span>
            <span class="dots-leader"></span>
            <span class="product-price">${escapeHtml(prod.price)}</span>
          </div>
          <p class="product-note">${escapeHtml(prod.desc)}</p>
        </div>
      `;

      article.addEventListener('click', () => {
        const scrollable = sweetsSection.offsetHeight - window.innerHeight;
        const targetY = sweetsSection.offsetTop + activeMin * scrollable;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      });

      sweetsProductsList.appendChild(article);
    });

    updateSectionUI();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ==========================================================================
  // PANEL DE ADMINISTRADOR EN TIEMPO REAL
  // ==========================================================================
  function renderAdminEditor() {
    adminProductsEditor.innerHTML = '';
    const items = menuData[activeAdminSection] || [];

    if (items.length === 0) {
      adminProductsEditor.innerHTML = '<p style="color: #888; text-align:center; padding: 2rem;">No hay productos en esta sección. ¡Agrega uno nuevo abajo!</p>';
      return;
    }

    items.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'admin-item-card';

      card.innerHTML = `
        <div class="admin-item-row">
          <span class="admin-item-num">${pad(index + 1, 2)}</span>
          <input type="text" class="admin-input input-name" data-id="${item.id}" data-field="name" value="${escapeHtml(item.name)}" placeholder="Nombre del producto" />
          <input type="text" class="admin-input input-price" data-id="${item.id}" data-field="price" value="${escapeHtml(item.price)}" placeholder="$ 0.000.-" />
          <button class="btn-delete-item" data-id="${item.id}" title="Eliminar producto">&times;</button>
        </div>
        <input type="text" class="admin-input input-desc" data-id="${item.id}" data-field="desc" value="${escapeHtml(item.desc)}" placeholder="Descripción o notas de cata" />
      `;

      // Evento input en tiempo real: Actualiza inmediatamente la carta en el sitio
      card.querySelectorAll('.admin-input').forEach(input => {
        input.addEventListener('input', (e) => {
          const field = e.target.getAttribute('data-field');
          const id = e.target.getAttribute('data-id');
          const val = e.target.value;

          const targetObj = menuData[activeAdminSection].find(p => p.id === id);
          if (targetObj) {
            targetObj[field] = val;
            saveMenuData();
            
            // Actualización directa en vivo del DOM visible sin parpadeos
            const livePrefix = activeAdminSection === 'section1' ? 'hero-item-' : 'sweets-item-';
            const liveCard = document.getElementById(`${livePrefix}${id}`);
            if (liveCard) {
              if (field === 'name') {
                const el = liveCard.querySelector('.product-name');
                if (el) el.textContent = val;
              } else if (field === 'price') {
                const el = liveCard.querySelector('.product-price');
                if (el) el.textContent = val;
              } else if (field === 'desc') {
                const el = liveCard.querySelector('.product-note');
                if (el) el.textContent = val;
              }
            }
          }
        });
      });

      // Botón de eliminar producto
      const delBtn = card.querySelector('.btn-delete-item');
      delBtn.addEventListener('click', () => {
        const id = delBtn.getAttribute('data-id');
        menuData[activeAdminSection] = menuData[activeAdminSection].filter(p => p.id !== id);
        saveMenuData();
        renderLiveCards();
        renderAdminEditor();
      });

      adminProductsEditor.appendChild(card);
    });
  }

  // Cambiar pestaña en el modal
  adminTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      adminTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeAdminSection = tab.getAttribute('data-section');
      renderAdminEditor();
    });
  });

  // Agregar nuevo producto
  addProductBtn.addEventListener('click', () => {
    const newId = 'prod-' + Date.now();
    const isCoffee = activeAdminSection === 'section1';
    menuData[activeAdminSection].push({
      id: newId,
      name: isCoffee ? 'Nuevo Café de Origen' : 'Nuevo Dulce Artesanal',
      price: '$ 4.500.-',
      desc: 'Elaboración de autor con ingredientes seleccionados de primera calidad.'
    });
    saveMenuData();
    renderLiveCards();
    renderAdminEditor();
    adminProductsEditor.scrollTop = adminProductsEditor.scrollHeight;
  });

  // Restaurar valores iniciales
  resetDefaultsBtn.addEventListener('click', () => {
    if (confirm('¿Restaurar los 5 productos originales de ambas secciones?')) {
      menuData = JSON.parse(JSON.stringify(DEFAULT_MENU));
      saveMenuData();
      renderLiveCards();
      renderAdminEditor();
    }
  });

  // Abrir / Cerrar modal
  adminOpenBtn.addEventListener('click', () => {
    renderAdminEditor();
    adminModalBackdrop.classList.add('open');
  });

  adminCloseBtn.addEventListener('click', () => {
    adminModalBackdrop.classList.remove('open');
  });

  adminModalBackdrop.addEventListener('click', (e) => {
    if (e.target === adminModalBackdrop) {
      adminModalBackdrop.classList.remove('open');
    }
  });

  // ==========================================================================
  // SCROLL-DRIVEN SYNCHRONIZATION
  // ==========================================================================
  function onScroll() {
    const heroRect = heroSection.getBoundingClientRect();
    const heroScrollable = heroSection.offsetHeight - window.innerHeight;
    if (heroScrollable > 0) {
      targetProgHero = Math.max(0, Math.min(1, -heroRect.top / heroScrollable));
    }

    const sweetsRect = sweetsSection.getBoundingClientRect();
    const sweetsScrollable = sweetsSection.offsetHeight - window.innerHeight;
    if (sweetsScrollable > 0) {
      targetProgSweets = Math.max(0, Math.min(1, -sweetsRect.top / sweetsScrollable));
    }

    if (sweetsRect.top <= window.innerHeight * 0.4) {
      if (navBtn2) navBtn2.classList.add('active');
      if (navBtn1) navBtn1.classList.remove('active');
      if (globalStatusTag) globalStatusTag.textContent = 'Sección 2: Tortas & Dulces';
    } else {
      if (navBtn1) navBtn1.classList.add('active');
      if (navBtn2) navBtn2.classList.remove('active');
      if (globalStatusTag) globalStatusTag.textContent = 'Sección 1: Cafés de Origen';
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  function updateSectionUI() {
    // 1. SECCIÓN HERO
    const heroFrameIdx = Math.min(TOTAL_FRAMES - 1, Math.round(currentProgHero * (TOTAL_FRAMES - 1)));
    drawHeroFrame(heroFrameIdx);

    if (heroTrackerFill) {
      heroTrackerFill.style.width = `${currentProgHero * 100}%`;
    }

    const heroCards = Array.from(heroProductsList.querySelectorAll('.product-item'));
    heroCards.forEach(card => {
      const reveal = parseFloat(card.getAttribute('data-reveal')) || 0;
      const activeMin = parseFloat(card.getAttribute('data-active-min')) || 0;
      const activeMax = parseFloat(card.getAttribute('data-active-max')) || 1;

      if (currentProgHero >= reveal) {
        card.classList.add('revealed');
      } else {
        card.classList.remove('revealed');
      }

      if (currentProgHero >= activeMin && currentProgHero <= activeMax) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    if (heroDogCard) {
      if (currentProgHero >= 0.90 || heroFrameIdx >= 225) {
        heroDogCard.classList.add('show');
      } else {
        heroDogCard.classList.remove('show');
      }
    }

    // 2. SECCIÓN TORTAS & DULCES
    const sweetsFrameIdx = Math.min(TOTAL_FRAMES - 1, Math.round(currentProgSweets * (TOTAL_FRAMES - 1)));
    drawSweetsFrame(sweetsFrameIdx);

    if (sweetsTrackerFill) {
      sweetsTrackerFill.style.width = `${currentProgSweets * 100}%`;
    }

    const sweetsCards = Array.from(sweetsProductsList.querySelectorAll('.product-item'));
    sweetsCards.forEach(card => {
      const reveal = parseFloat(card.getAttribute('data-reveal')) || 0;
      const activeMin = parseFloat(card.getAttribute('data-active-min')) || 0;
      const activeMax = parseFloat(card.getAttribute('data-active-max')) || 1;

      if (currentProgSweets >= reveal) {
        card.classList.add('revealed');
      } else {
        card.classList.remove('revealed');
      }

      if (currentProgSweets >= activeMin && currentProgSweets <= activeMax) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  function renderLoop() {
    currentProgHero += (targetProgHero - currentProgHero) * 0.14;
    currentProgSweets += (targetProgSweets - currentProgSweets) * 0.14;

    updateSectionUI();
    requestAnimationFrame(renderLoop);
  }

  // ==========================================================================
  // INICIALIZACIÓN
  // ==========================================================================
  window.addEventListener('DOMContentLoaded', () => {
    canvasHero.width = CANVAS_WIDTH;
    canvasHero.height = CANVAS_HEIGHT;
    canvasSweets.width = CANVAS_WIDTH;
    canvasSweets.height = CANVAS_HEIGHT;

    renderLiveCards();
    preloadAllFrames();
    onScroll();
    requestAnimationFrame(renderLoop);
  });

})();
