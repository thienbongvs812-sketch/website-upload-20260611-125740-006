const ready = (fn) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
};

const normal = (value) => (value || '').toString().trim().toLowerCase();

function initMenu() {
  const button = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-mobile-nav]');
  if (!button || !nav) return;
  button.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function initHero() {
  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  if (!slides.length) return;
  let index = 0;
  const show = (next) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, pos) => slide.classList.toggle('is-active', pos === index));
    dots.forEach((dot, pos) => dot.classList.toggle('is-active', pos === index));
  };
  dots.forEach((dot) => {
    dot.addEventListener('click', () => show(Number(dot.dataset.heroDot || 0)));
  });
  setInterval(() => show(index + 1), 6200);
}

function initFilters() {
  const panel = document.querySelector('.filter-panel');
  const cards = Array.from(document.querySelectorAll('.searchable-card'));
  if (!panel || !cards.length) return;
  const input = panel.querySelector('[data-filter-input]');
  const type = panel.querySelector('[data-filter-type]');
  const region = panel.querySelector('[data-filter-region]');
  const year = panel.querySelector('[data-filter-year]');
  const empty = document.querySelector('[data-empty-result]');
  const query = new URLSearchParams(window.location.search).get('q');
  if (query && input) input.value = query;
  const apply = () => {
    const text = normal(input && input.value);
    const typeValue = type ? type.value : '全部';
    const regionValue = region ? region.value : '全部';
    const yearValue = year ? year.value : '全部';
    let visible = 0;
    cards.forEach((card) => {
      const haystack = normal(`${card.dataset.title} ${card.dataset.genre} ${card.dataset.region} ${card.dataset.type} ${card.textContent}`);
      const cardYear = card.dataset.year || '';
      const okText = !text || haystack.includes(text);
      const okType = typeValue === '全部' || card.dataset.type === typeValue;
      const okRegion = regionValue === '全部' || card.dataset.region === regionValue;
      const yearNumber = Number((cardYear.match(/\d{4}/) || ['0'])[0]);
      const okYear = yearValue === '全部' || (yearValue === 'older' ? yearNumber > 0 && yearNumber <= 2022 : cardYear.includes(yearValue));
      const matched = okText && okType && okRegion && okYear;
      card.hidden = !matched;
      if (matched) visible += 1;
    });
    if (empty) empty.hidden = visible !== 0;
  };
  [input, type, region, year].filter(Boolean).forEach((node) => {
    node.addEventListener('input', apply);
    node.addEventListener('change', apply);
  });
  apply();
}

function initPlayers() {
  const shells = Array.from(document.querySelectorAll('.player-shell'));
  shells.forEach((shell) => {
    const video = shell.querySelector('video');
    const button = shell.querySelector('.play-overlay');
    const url = shell.dataset.videoUrl;
    let loaded = false;
    let hls = null;
    if (!video || !button || !url) return;
    const load = () => {
      if (loaded) return;
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    };
    const play = () => {
      load();
      video.controls = true;
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {
          shell.classList.remove('is-playing');
        });
      }
    };
    button.addEventListener('click', play);
    video.addEventListener('click', () => {
      if (!loaded) play();
    });
    video.addEventListener('play', () => shell.classList.add('is-playing'));
    video.addEventListener('pause', () => {
      if (!video.ended) shell.classList.remove('is-playing');
    });
    video.addEventListener('ended', () => shell.classList.remove('is-playing'));
    window.addEventListener('beforeunload', () => {
      if (hls && typeof hls.destroy === 'function') hls.destroy();
    });
  });
}

ready(() => {
  initMenu();
  initHero();
  initFilters();
  initPlayers();
});
