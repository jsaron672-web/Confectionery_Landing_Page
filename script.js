// Confectionery Halo-Halo | script.js
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

// 1) Mobile navigation menu
const menuBtn = $('.menu-btn'), menu = $('#menu');
if (menuBtn && menu) {
  menuBtn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  menu.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') { menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); }
  });
}

// 2) Dark / light mode
const root = document.documentElement, themeBtn = $('#theme-btn');
try { const saved = localStorage.getItem('theme'); if (saved) root.dataset.theme = saved; } catch (e) {}
function isDark() {
  return root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
}
function paintThemeBtn() { if (themeBtn) themeBtn.textContent = isDark() ? '☀️' : '🌙'; }
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    paintThemeBtn();
  });
  paintThemeBtn();
}

// 3) Image slideshow
const slides = $$('.slide');
if (slides.length) {
  let cur = 0;
  const dotBox = $('.dots');
  const dots = slides.map((_, i) => {
    const d = document.createElement('button');
    d.setAttribute('aria-label', 'Go to photo ' + (i + 1));
    d.addEventListener('click', () => show(i));
    dotBox.appendChild(d);
    return d;
  });
  function show(i) {
    cur = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle('active', n === cur));
    dots.forEach((d, n) => d.classList.toggle('on', n === cur));
  }
  $('.prev').addEventListener('click', () => show(cur - 1));
  $('.next').addEventListener('click', () => show(cur + 1));
  show(0);
}

// 4) Product popup
const dlg = $('#popup');
if (dlg) {
  $$('[data-popup]').forEach((btn) => btn.addEventListener('click', () => {
    const card = btn.closest('.pcard');
    $('#pop-img').src = card.querySelector('img').src;
    $('#pop-img').alt = card.querySelector('img').alt;
    $('#pop-name').textContent = card.querySelector('h3').textContent;
    $('#pop-desc').textContent = card.querySelector('p').textContent;
    $('#pop-price').textContent = card.querySelector('.price').textContent;
    dlg.showModal();
  }));
  $('#pop-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
}

// 5) "View more" button (gallery)
const moreBtn = $('#more-btn');
if (moreBtn) {
  moreBtn.addEventListener('click', () => {
    const items = $$('.more');
    const show = items[0].classList.contains('hidden');
    items.forEach((i) => i.classList.toggle('hidden', !show));
    moreBtn.textContent = show ? 'Show less' : 'View more';
  });
}

// 6) FAQ accordion
$$('.faq-q').forEach((q) => q.addEventListener('click', () => {
  const open = q.getAttribute('aria-expanded') === 'true';
  q.setAttribute('aria-expanded', !open);
  q.nextElementSibling.hidden = open;
}));

// 7) Contact form validation
const form = $('#contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name, email = form.elements.email, msg = form.elements.message;
    let ok = true;
    function check(field, good, text) {
      field.classList.toggle('invalid', !good);
      field.nextElementSibling.textContent = good ? '' : text;
      if (!good) ok = false;
    }
    check(name, name.value.trim().length >= 2, 'Please enter your name.');
    check(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()), 'Please enter a valid email.');
    check(msg, msg.value.trim().length >= 10, 'Your message needs at least 10 characters.');
    $('#form-msg').textContent = ok ? 'Looks good, ' + name.value.trim() + '! (This is a demo form. It does not send emails yet.)' : '';
    if (ok) form.reset();
  });
}

// 8) Lead form: Name, Contact Number, Best Time to Call (date + time), Target Location
// Entries are emailed to legasyn@confectioneryph.com through FormSubmit.
const LEAD_ENDPOINT = 'https://formsubmit.co/ajax/legasyn@confectioneryph.com';
const leadForm = $('#lead-form');
if (leadForm) {
  const pad = (n) => String(n).padStart(2, '0');
  const now = new Date();
  const todayStr = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
  leadForm.elements.date.min = todayStr;
  function niceDate(v) {
    const d = new Date(v + 'T00:00:00');
    return d.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  function niceTime(v) {
    const [h, m] = v.split(':').map(Number);
    return ((h % 12) || 12) + ':' + pad(m) + ' ' + (h >= 12 ? 'PM' : 'AM');
  }
  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = leadForm.elements, msg = $('#lead-msg');
    let ok = true;
    function check(field, good, text) {
      field.classList.toggle('invalid', !good);
      field.closest('.field').querySelector('.err').textContent = good ? '' : text;
      if (!good) ok = false;
    }
    check(f.name, f.name.value.trim().length >= 2, 'Please enter your name.');
    check(f.phone, /^[0-9+()\-\s]{7,}$/.test(f.phone.value.trim()), 'Please enter a valid contact number.');
    const dateOk = f.date.value !== '' && f.date.value >= todayStr, timeOk = f.time.value !== '';
    f.date.classList.toggle('invalid', !dateOk);
    f.time.classList.toggle('invalid', !timeOk);
    f.date.closest('.field').querySelector('.err').textContent = !dateOk ? 'Please pick a date (today or later).' : (!timeOk ? 'Please pick a time.' : '');
    if (!dateOk || !timeOk) ok = false;
    check(f.location, f.location.value.trim().length >= 2, 'Please enter your target location.');
    msg.className = '';
    if (!ok) { msg.textContent = ''; return; }
    const when = niceDate(f.date.value) + ', ' + niceTime(f.time.value);
    if (!LEAD_ENDPOINT) {
      msg.textContent = 'Looks good, ' + f.name.value.trim() + '! (Demo only: this form is not connected here, so nothing was sent.)';
      leadForm.reset();
      return;
    }
    const btn = leadForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const res = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: 'New call-back request: ' + f.name.value.trim(),
          _template: 'table',
          _captcha: 'false',
          _honey: f._honey.value,
          'Name': f.name.value.trim(),
          'Contact Number': f.phone.value.trim(),
          'Best Time to Call': when,
          'Target Location': f.location.value.trim()
        })
      });
      if (!res.ok) throw new Error('bad response');
      msg.textContent = 'Thank you, ' + f.name.value.trim() + '! We will call you on ' + when + '.';
      leadForm.reset();
    } catch (err) {
      msg.className = 'bad';
      msg.textContent = 'Sorry, something went wrong. Please try again.';
    } finally {
      btn.disabled = false;
    }
  });
}
