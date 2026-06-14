// ===== Живые сайты в мокапах: показываем десктопную версию в нужном масштабе =====
const FRAME_WIDTH = 1280; // ширина «виртуального экрана» внутри мокапа

function fitFrames() {
  document.querySelectorAll('.fit-frame').forEach((frame) => {
    const box = frame.parentElement;
    if (!box.clientWidth) return;
    const scale = box.clientWidth / FRAME_WIDTH;
    frame.style.width = FRAME_WIDTH + 'px';
    frame.style.height = Math.ceil(box.clientHeight / scale) + 'px';
    frame.style.transform = `scale(${scale})`;
  });
}
window.addEventListener('resize', fitFrames);
window.addEventListener('load', fitFrames);
fitFrames();

// ===== Полноэкранный просмотр макетов («Открыть макет») =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');

function openLightbox(src) {
  lightboxImg.src = src;
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  lightbox.querySelector('.lightbox__scroll').scrollTop = 0;
  document.body.style.overflow = 'hidden'; // блокируем скролл страницы под окном
}
function closeLightbox() {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
document.querySelectorAll('[data-view]').forEach((btn) => {
  btn.addEventListener('click', () => openLightbox(btn.dataset.view));
});
lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// ===== Навигация: становится «стеклянной на светлом», когда уходим с главного экрана =====
const nav = document.getElementById('nav');
const hero = document.querySelector('.hero');

function updateNav() {
  const heroBottom = hero.getBoundingClientRect().bottom;
  nav.classList.toggle('is-scrolled', heroBottom < 120);
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// ===== Большие заголовки: разбиваем текст на слова для анимации «из маски» =====
function splitWords(el) {
  const process = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
          return;
        }
        const line = document.createElement('span');
        line.className = 'split-line';
        const word = document.createElement('span');
        word.className = 'split-word';
        word.textContent = part;
        line.appendChild(word);
        frag.appendChild(line);
      });
      node.replaceWith(frag);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
      [...node.childNodes].forEach(process);
    }
  };
  [...el.childNodes].forEach(process);
  // каждое следующее слово выезжает чуть позже предыдущего
  el.querySelectorAll('.split-word').forEach((w, i) => {
    w.style.transitionDelay = `${i * 90}ms`;
  });
}
document.querySelectorAll('.section-title').forEach(splitWords);

// ===== Плавное появление блоков при скролле =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('is-visible'), delay);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .work').forEach((el) => observer.observe(el));

// ===== Стопка карточек: накрытая карточка уезжает в глубину =====
const workCards = [...document.querySelectorAll('.work')];

function stackCards() {
  workCards.forEach((card, i) => {
    const next = workCards[i + 1];
    if (!next) return;
    const nextTop = next.getBoundingClientRect().top;
    // прогресс: следующая карточка прошла путь от низа экрана до верха стопки
    const start = window.innerHeight;
    const end = 140;
    const p = Math.min(1, Math.max(0, (start - nextTop) / (start - end)));
    card.style.transform = `scale(${1 - p * 0.06}) translateY(${p * -8}px)`;
    card.style.opacity = String(1 - p * 0.35);
  });
  requestAnimationFrame(stackCards);
}
requestAnimationFrame(stackCards);

// ===== «Тянучесть»: бегущая строка наклоняется от скорости скролла =====
const marqueeTrack = document.getElementById('marqueeTrack');
let lastScrollY = window.scrollY;
let velocity = 0;

function updateStretch() {
  const currentY = window.scrollY;
  // насколько быстро скроллим прямо сейчас
  const delta = currentY - lastScrollY;
  lastScrollY = currentY;
  // плавно тянемся к новой скорости и обратно к нулю
  velocity += (delta - velocity) * 0.12;
  const skew = Math.max(-10, Math.min(10, velocity * 0.45));
  const stretch = 1 + Math.min(0.12, Math.abs(velocity) * 0.004);
  marqueeTrack.style.transform = `skewX(${-skew}deg) scaleX(${stretch})`;
  requestAnimationFrame(updateStretch);
}
requestAnimationFrame(updateStretch);

// ===== Лёгкий параллакс главной картинки (только на десктопе) =====
const heroImg = document.getElementById('heroImg');
window.addEventListener('scroll', () => {
  if (window.innerWidth <= 820) return;
  const y = window.scrollY;
  if (y < window.innerHeight * 1.5) {
    heroImg.style.transform = `translateY(${y * 0.08}px) scale(${1 + y * 0.00004})`;
  }
}, { passive: true });
