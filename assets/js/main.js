// ============================================================
// DAVID COACHING — Shared behaviors
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initNavDropdowns();
  initAccordion();
  initFaqFilter();
  initTdeeCalculator();
  initMacroCalculator();
  initRevealOnScroll();
});

/* ---------- Nav dropdowns ("Công cụ", "Khác") ---------- */
function initNavDropdowns() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  if (!dropdowns.length) return;

  dropdowns.forEach(dd => {
    const trigger = dd.querySelector('.nav-dropdown-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = dd.classList.contains('open');
      dropdowns.forEach(other => other.classList.remove('open'));
      dd.classList.toggle('open', !isOpen);
    });
  });

  document.addEventListener('click', (e) => {
    dropdowns.forEach(dd => {
      if (!dd.contains(e.target)) dd.classList.remove('open');
    });
  });
}

/* ---------- Reveal-on-scroll ---------- */
function initRevealOnScroll() {
  const selector = '.section-head, .pillar-card, .program-card, .accordion-item, .step, .cta-band, section .card, .hero-visual';
  const targets = document.querySelectorAll(selector);
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('reveal', 'show'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    if (el.classList.contains('card') || el.classList.contains('pillar-card')) {
      el.classList.add('reveal-' + ((i % 4) + 1));
    }
    observer.observe(el);
  });
}

/* ---------- Mobile nav toggle ---------- */
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
}

/* ---------- Accordion (used on Training & FAQ pages) ---------- */
function initAccordion() {
  document.querySelectorAll('.accordion-item').forEach(item => {
    const header = item.querySelector('.accordion-header');
    const body = item.querySelector('.accordion-body');
    if (!header || !body) return;
    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // close siblings within the same accordion group
      const group = item.closest('.accordion-group');
      if (group && group.dataset.exclusive === 'true') {
        group.querySelectorAll('.accordion-item.open').forEach(sib => {
          if (sib !== item) {
            sib.classList.remove('open');
            sib.querySelector('.accordion-body').style.maxHeight = null;
          }
        });
      }
      item.classList.toggle('open', !isOpen);
      body.style.maxHeight = !isOpen ? body.scrollHeight + 'px' : null;
    });
  });
}

/* ---------- FAQ chip filter ---------- */
function initFaqFilter() {
  const chipRow = document.querySelector('.chip-row');
  if (!chipRow) return;
  const chips = chipRow.querySelectorAll('.chip');
  const items = document.querySelectorAll('[data-category]');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const cat = chip.dataset.filter;
      items.forEach(item => {
        const itemCats = (item.dataset.category || '').split(' ');
        const show = cat === 'all' || itemCats.includes(cat);
        item.style.display = show ? '' : 'none';
      });
    });
  });
}

/* ---------- TDEE Calculator ---------- */
function initTdeeCalculator() {
  const form = document.getElementById('tdee-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const gender = form.gender.value;
    const age = parseFloat(form.age.value);
    const height = parseFloat(form.height.value);
    const weight = parseFloat(form.weight.value);
    const activity = parseFloat(form.activity.value);

    if (!age || !height || !weight) return;

    // Mifflin-St Jeor
    let rmr = 10 * weight + 6.25 * height - 5 * age;
    rmr += gender === 'nam' ? 5 : -161;

    const tdee = rmr * activity;
    const cut = tdee - 600;
    const maintain = tdee;
    const bulk = tdee + 275;

    document.getElementById('res-rmr').textContent = Math.round(rmr).toLocaleString('vi-VN');
    document.getElementById('res-tdee').textContent = Math.round(tdee).toLocaleString('vi-VN');
    document.getElementById('res-cut').textContent = Math.round(cut).toLocaleString('vi-VN');
    document.getElementById('res-maintain').textContent = Math.round(maintain).toLocaleString('vi-VN');
    document.getElementById('res-bulk').textContent = Math.round(bulk).toLocaleString('vi-VN');

    const panel = document.getElementById('tdee-result');
    panel.classList.add('show');
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Pre-fill macro calculator weight + suggested calories if present
    const macroWeight = document.getElementById('macro-weight');
    const macroCalories = document.getElementById('macro-calories');
    if (macroWeight) macroWeight.value = weight;
    if (macroCalories) macroCalories.value = Math.round(maintain);
  });
}

/* ---------- Macro Calculator ---------- */
function initMacroCalculator() {
  const form = document.getElementById('macro-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const weight = parseFloat(form.weight.value);
    const calories = parseFloat(form.calories.value);
    const goal = form.goal.value; // cut | maintain | bulk

    if (!weight || !calories) return;

    let proteinPerKg, fatPerKg;
    if (goal === 'cut') { proteinPerKg = 2.0; fatPerKg = 0.7; }
    else if (goal === 'bulk') { proteinPerKg = 1.8; fatPerKg = 0.9; }
    else { proteinPerKg = 1.8; fatPerKg = 0.9; }

    const proteinG = proteinPerKg * weight;
    const fatG = fatPerKg * weight;
    const proteinKcal = proteinG * 4;
    const fatKcal = fatG * 9;
    let carbKcal = calories - proteinKcal - fatKcal;
    let warning = '';
    if (carbKcal < 0) {
      warning = 'Năng lượng mục tiêu thấp hơn mức protein + sàn chất béo tối thiểu. Hãy tăng năng lượng mục tiêu, hoặc đây có thể là mức thâm hụt quá gắt — không khuyến khích.';
      carbKcal = 0;
    }
    const carbG = carbKcal / 4;

    document.getElementById('res-protein-g').textContent = Math.round(proteinG) + ' g';
    document.getElementById('res-fat-g').textContent = Math.round(fatG) + ' g';
    document.getElementById('res-carb-g').textContent = Math.round(carbG) + ' g';
    document.getElementById('res-protein-meal').textContent = Math.round(proteinG / 4) + '–' + Math.round(proteinG / 3) + ' g / cữ (chia 3–4 cữ)';

    const total = proteinKcal + fatKcal + carbKcal || 1;
    document.getElementById('bar-protein').style.width = (proteinKcal / total * 100) + '%';
    document.getElementById('bar-fat').style.width = (fatKcal / total * 100) + '%';
    document.getElementById('bar-carb').style.width = (carbKcal / total * 100) + '%';

    const warnEl = document.getElementById('macro-warning');
    if (warnEl) {
      warnEl.textContent = warning;
      warnEl.style.display = warning ? 'block' : 'none';
    }

    const panel = document.getElementById('macro-result');
    panel.classList.add('show');
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}
