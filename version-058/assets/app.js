(function () {
  'use strict';

  function select(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initNavigation() {
    var toggle = select('[data-nav-toggle]');
    var nav = select('[data-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var slider = select('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', slider);
    var dots = selectAll('[data-hero-dot]', slider);
    var previous = select('[data-hero-prev]', slider);
    var next = select('[data-hero-next]', slider);
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5000);
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }

      startTimer();
    }

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        restartTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        restartTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  function initFilters() {
    selectAll('[data-filter-panel]').forEach(function (panel) {
      var container = panel.parentElement || document;
      var grid = select('[data-filter-grid]', container);
      var cards = selectAll('.searchable-card', grid || container);
      var searchInput = select('[data-filter-search]', panel);
      var typeSelect = select('[data-filter-type]', panel);
      var yearSelect = select('[data-filter-year]', panel);
      var categorySelect = select('[data-filter-category]', panel);
      var sortSelect = select('[data-filter-sort]', panel);
      var resetButton = select('[data-filter-reset]', panel);
      var countLabel = select('[data-filter-count]', panel);
      var noResults = select('[data-no-results]', container);
      var urlParams = new URLSearchParams(window.location.search);
      var initialQuery = urlParams.get('q');

      if (!grid || !cards.length) {
        return;
      }

      if (initialQuery && searchInput) {
        searchInput.value = initialQuery;
      }

      cards.forEach(function (card, index) {
        card.dataset.defaultIndex = String(index);
      });

      function applySort(visibleCards) {
        var sortValue = sortSelect ? sortSelect.value : 'default';
        var sortedCards = cards.slice();

        sortedCards.sort(function (a, b) {
          if (sortValue === 'year-desc') {
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          }

          if (sortValue === 'year-asc') {
            return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
          }

          if (sortValue === 'title-asc') {
            return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-CN');
          }

          return Number(a.dataset.defaultIndex || 0) - Number(b.dataset.defaultIndex || 0);
        });

        sortedCards.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      function applyFilters() {
        var query = normalize(searchInput && searchInput.value);
        var selectedType = normalize(typeSelect && typeSelect.value);
        var selectedYear = normalize(yearSelect && yearSelect.value);
        var selectedCategory = normalize(categorySelect && categorySelect.value);
        var visibleCount = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.dataset.search + ' ' + card.dataset.title);
          var cardType = normalize(card.dataset.type);
          var cardYear = normalize(card.dataset.year);
          var cardCategory = normalize(card.dataset.category);
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesType = !selectedType || cardType === selectedType;
          var matchesYear = !selectedYear || cardYear === selectedYear;
          var matchesCategory = !selectedCategory || cardCategory === selectedCategory;
          var visible = matchesQuery && matchesType && matchesYear && matchesCategory;

          card.classList.toggle('is-hidden', !visible);

          if (visible) {
            visibleCount += 1;
          }
        });

        applySort();

        if (countLabel) {
          countLabel.textContent = '当前显示 ' + visibleCount + ' 部影片，共 ' + cards.length + ' 部。';
        }

        if (noResults) {
          noResults.hidden = visibleCount !== 0;
        }
      }

      [searchInput, typeSelect, yearSelect, categorySelect, sortSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilters);
          control.addEventListener('change', applyFilters);
        }
      });

      if (resetButton) {
        resetButton.addEventListener('click', function () {
          [searchInput, typeSelect, yearSelect, categorySelect, sortSelect].forEach(function (control) {
            if (control) {
              control.value = control === sortSelect ? 'default' : '';
            }
          });

          applyFilters();
        });
      }

      applyFilters();
    });
  }

  function initPlayer() {
    var video = select('[data-player]');
    var startButton = select('[data-player-start]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-src');
    var hlsInstance = null;

    function attachSource() {
      if (!source || video.dataset.loaded === 'true') {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          backBufferLength: 30,
          enableWorker: true
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }

      video.dataset.loaded = 'true';
    }

    function playVideo() {
      attachSource();

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.controls = true;
        });
      }

      if (startButton) {
        startButton.classList.add('is-hidden');
      }
    }

    if (startButton) {
      startButton.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
      if (startButton) {
        startButton.classList.add('is-hidden');
      }
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHeroSlider();
    initFilters();
    initPlayer();
  });
})();
