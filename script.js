/* Ortak betik: her etkileşim ilgili öğe sayfada yoksa çalışmaz. */
const $ = (s) => document.querySelector(s);

// 1) Karanlık mod (tercih tarayıcıda saklanır, sunucuya gitmez)
const root = document.documentElement;
const themeBtn = $('#themeBtn');
function setTheme(t) {
  root.dataset.theme = t;
  if (themeBtn) { themeBtn.setAttribute('aria-pressed', String(t === 'dark')); themeBtn.textContent = t === 'dark' ? 'Açık mod' : 'Karanlık mod'; }
}
let saved = null;
try { saved = localStorage.getItem('tema'); } catch (e) {}
setTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
if (themeBtn) themeBtn.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(next);
  try { localStorage.setItem('tema', next); } catch (e) {}
});

// 2) Mobil menü
const menuBtn = $('#menuBtn'), nav = $('#nav');
if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.focus(); }
  });
}

// 3) Kare kaydırıcı: zıplayan top (animasyonun 12 temel ilkesinden "squash and stretch")
const slider = $('#frame');
if (slider) {
  const ball = $('#ball'), out = $('#frameOut'), strip = $('#strip');
  const TOTAL = 24;
  for (let i = 0; i < TOTAL; i++) strip.appendChild(document.createElement('i'));
  const update = () => {
    const f = Number(slider.value), t = (f - 1) / (TOTAL - 1);
    const lift = Math.abs(Math.sin(t * Math.PI * 2));          // 0 = yerde, 1 = en yüksekte
    const x = 30 + t * 240, y = 150 - 110 * lift;
    const squash = 1 - 0.35 * Math.max(0, 1 - lift * 8);       // yere yakınken basıklaşır
    ball.setAttribute('cx', x); ball.setAttribute('cy', y + 18 * (1 - squash));
    ball.setAttribute('ry', 18 * squash); ball.setAttribute('rx', 18 / Math.sqrt(squash));
    out.textContent = f + ' / ' + TOTAL;
    [...strip.children].forEach((c, i) => c.classList.toggle('on', i < f));
  };
  slider.addEventListener('input', update);
  update();
}

// 4) Proje filtreleme ve arama
const cards = [...document.querySelectorAll('.card[data-cat]')];
if (cards.length) {
  const search = $('#search'), count = $('#count'), btns = [...document.querySelectorAll('[data-filter]')];
  let cat = 'hepsi';
  const apply = () => {
    const q = search.value.trim().toLocaleLowerCase('tr');
    let n = 0;
    cards.forEach((c) => {
      const show = (cat === 'hepsi' || c.dataset.cat === cat) && c.textContent.toLocaleLowerCase('tr').includes(q);
      c.parentElement.hidden = !show;
      if (show) n++;
    });
    count.textContent = n ? n + ' proje gösteriliyor.' : 'Eşleşen proje yok. Aramayı veya filtreyi değiştirin.';
  };
  btns.forEach((b) => b.addEventListener('click', () => {
    cat = b.dataset.filter;
    btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    apply();
  }));
  search.addEventListener('input', apply);
  apply();
}

// 5) İletişim formu doğrulama ve geri bildirim mesajı
const form = $('#contactForm');
if (form) {
  const rules = {
    ad: (v) => v.trim().length >= 2 || 'Adınızı en az 2 karakter olarak yazın.',
    eposta: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Geçerli bir e-posta yazın (örn. ad@ornek.com).',
    mesaj: (v) => v.trim().length >= 10 || 'Mesajınız en az 10 karakter olmalı.'
  };
  const check = (el) => {
    const r = rules[el.name](el.value);
    const ok = r === true;
    el.setAttribute('aria-invalid', String(!ok));
    $('#err-' + el.name).textContent = ok ? '' : r;
    return ok;
  };
  const fields = [...form.querySelectorAll('input,textarea')];
  fields.forEach((el) => el.addEventListener('blur', () => check(el)));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = fields.filter((el) => !check(el));
    const msg = $('#formMsg');
    if (bad.length) { msg.textContent = 'Formda ' + bad.length + ' hata var. Kırmızı uyarıları düzeltin.'; bad[0].focus(); return; }
    msg.textContent = 'Teşekkürler ' + fields[0].value.trim() + '! Form doğrulandı. Bu örnek sitede mesaj bir yere gönderilmez.';
    form.reset();
  });
}
