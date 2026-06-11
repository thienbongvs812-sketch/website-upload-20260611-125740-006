(function() {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  ready(function() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.main-nav');
    var search = document.querySelector('.search-bar');

    if (toggle && nav && search) {
      toggle.addEventListener('click', function() {
        var open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!open));
        nav.classList.toggle('is-open');
        search.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('img.cover-img').forEach(function(img) {
      img.addEventListener('error', function() {
        img.classList.add('image-missing');
      });
    });

    initHero();
    initFilters();
    initSearchPage();
  });

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function auto() {
      clearInterval(timer);
      timer = setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-hero-target')) || 0);
        auto();
      });
    });

    if (slides.length > 1) {
      auto();
    }
  }

  function initFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-area .filter-card'));
    if (!panel || cards.length === 0) {
      return;
    }

    var state = {
      query: '',
      category: 'all',
      year: 'all',
      type: 'all'
    };

    var input = panel.querySelector('[data-local-search]');
    if (input) {
      input.addEventListener('input', function() {
        state.query = normalize(input.value);
        apply();
      });
    }

    panel.querySelectorAll('[data-filter-category]').forEach(function(button) {
      button.addEventListener('click', function() {
        state.category = button.getAttribute('data-filter-category') || 'all';
        switchActive(panel.querySelectorAll('[data-filter-category]'), button);
        apply();
      });
    });

    panel.querySelectorAll('[data-filter-year]').forEach(function(button) {
      button.addEventListener('click', function() {
        state.year = button.getAttribute('data-filter-year') || 'all';
        switchActive(panel.querySelectorAll('[data-filter-year]'), button);
        apply();
      });
    });

    panel.querySelectorAll('[data-filter-type]').forEach(function(button) {
      button.addEventListener('click', function() {
        state.type = button.getAttribute('data-filter-type') || 'all';
        switchActive(panel.querySelectorAll('[data-filter-type]'), button);
        apply();
      });
    });

    function apply() {
      cards.forEach(function(card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year')
        ].join(' '));
        var matchQuery = !state.query || haystack.indexOf(state.query) !== -1;
        var matchCategory = state.category === 'all' || card.getAttribute('data-category') === state.category;
        var matchYear = state.year === 'all' || card.getAttribute('data-year') === state.year;
        var matchType = state.type === 'all' || card.getAttribute('data-type') === state.type;
        card.classList.toggle('is-hidden', !(matchQuery && matchCategory && matchYear && matchType));
      });
    }
  }

  function switchActive(buttons, activeButton) {
    Array.prototype.forEach.call(buttons, function(button) {
      button.classList.toggle('is-active', button === activeButton);
    });
  }

  function initSearchPage() {
    var area = document.querySelector('.search-area');
    if (!area) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get('q'));
    var title = document.querySelector('[data-search-title]');
    var cards = Array.prototype.slice.call(area.querySelectorAll('.filter-card'));
    var count = 0;

    cards.forEach(function(card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year')
      ].join(' '));
      var matched = !query || haystack.indexOf(query) !== -1;
      card.classList.toggle('is-hidden', !matched);
      if (matched) {
        count += 1;
      }
    });

    if (title) {
      title.textContent = query ? '搜索：' + params.get('q') + '，相关影片 ' + count + ' 部' : '影片搜索';
    }
  }
})();
