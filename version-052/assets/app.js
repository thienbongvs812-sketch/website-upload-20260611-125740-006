(function () {
  function closestBase() {
    return document.body.getAttribute('data-base') || './';
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupGlobalSearch() {
    var forms = document.querySelectorAll('.global-search-form');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var base = form.getAttribute('data-base') || closestBase();
        var target = base + 'search.html';
        if (value) {
          target += '?q=' + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupLocalFilter() {
    var input = document.querySelector('.local-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.local-card-grid .movie-card'));
    if (!input || !cards.length) {
      return;
    }
    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-query') || card.textContent || '').toLowerCase();
        card.classList.toggle('is-filtered-out', query && text.indexOf(query) === -1);
      });
    });
  }

  function createResultCard(movie) {
    var card = document.createElement('a');
    card.className = 'movie-card';
    card.href = movie.url;
    card.innerHTML = [
      '<span class="poster-frame">',
      '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="play-chip">播放</span>',
      '</span>',
      '<span class="card-body">',
      '<strong>' + escapeHtml(movie.title) + '</strong>',
      '<span class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span>',
      '<span class="card-line compact">' + escapeHtml(movie.line) + '</span>',
      '<span class="card-tags"><span>' + escapeHtml(movie.genre) + '</span></span>',
      '</span>'
    ].join('');
    return card;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function setupSearchPage() {
    var input = document.getElementById('searchInput');
    var results = document.getElementById('searchResults');
    var status = document.getElementById('searchStatus');
    var panel = document.querySelector('.search-panel');
    var data = window.SEARCH_MOVIES || [];
    if (!input || !results || !status || !data.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render() {
      var query = input.value.trim().toLowerCase();
      var matched = data.filter(function (movie) {
        if (!query) {
          return true;
        }
        return movie.search.indexOf(query) !== -1;
      }).slice(0, 120);
      results.innerHTML = '';
      matched.forEach(function (movie) {
        results.appendChild(createResultCard(movie));
      });
      status.textContent = query ? '匹配结果：' + matched.length : '热门推荐';
    }

    if (panel) {
      panel.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
        var value = input.value.trim();
        var nextUrl = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
        history.replaceState(null, '', nextUrl);
      });
    }
    input.addEventListener('input', render);
    render();
  }

  setupMenu();
  setupGlobalSearch();
  setupHero();
  setupLocalFilter();
  setupSearchPage();
})();
