(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMobileNav() {
        var toggle = document.querySelector('.menu-toggle');
        var nav = document.querySelector('.mobile-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            var opened = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', opened ? 'false' : 'true');
            nav.hidden = opened;
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
        var prev = root.querySelector('.hero-prev');
        var next = root.querySelector('.hero-next');
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function play() {
            stop();
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                play();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', play);
        play();
    }

    function initYearTabs() {
        var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-year-tab]'));
        if (!tabs.length) {
            return;
        }
        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                var value = tab.getAttribute('data-year-tab');
                tabs.forEach(function (item) {
                    item.classList.toggle('active', item === tab);
                });
                Array.prototype.slice.call(document.querySelectorAll('[data-year-panel]')).forEach(function (panel) {
                    panel.classList.toggle('active', panel.getAttribute('data-year-panel') === value);
                });
            });
        });
    }

    function initFilters() {
        var panel = document.querySelector('.filter-panel');
        if (!panel) {
            applyUrlSearch();
            return;
        }
        var searchInput = panel.querySelector('.site-search');
        var yearSelect = panel.querySelector('.year-filter');
        var sortSelect = panel.querySelector('.sort-filter');
        var container = document.querySelector('.listing-grid') || document.querySelector('.full-rank-list');
        if (!container) {
            return;
        }
        var items = Array.prototype.slice.call(container.querySelectorAll('.searchable-item'));

        function apply() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            items.forEach(function (item) {
                var text = (item.getAttribute('data-search') || '').toLowerCase();
                var itemYear = item.getAttribute('data-year') || '';
                var matched = (!query || text.indexOf(query) !== -1) && (!year || itemYear === year);
                item.classList.toggle('is-hidden', !matched);
            });
            if (sortSelect) {
                sortItems(container, items, sortSelect.value);
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', apply);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', apply);
        }
        if (sortSelect) {
            sortSelect.addEventListener('change', apply);
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && searchInput) {
            searchInput.value = q;
        }
        apply();
    }

    function sortItems(container, items, mode) {
        var sorted = items.slice();
        if (mode === 'year-desc') {
            sorted.sort(function (a, b) {
                return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
            });
        } else if (mode === 'rating-desc') {
            sorted.sort(function (a, b) {
                return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
            });
        } else if (mode === 'heat-desc') {
            sorted.sort(function (a, b) {
                return Number(b.getAttribute('data-heat')) - Number(a.getAttribute('data-heat'));
            });
        }
        if (mode !== 'default') {
            sorted.forEach(function (item) {
                container.appendChild(item);
            });
        }
    }

    function applyUrlSearch() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (!q) {
            return;
        }
        var input = document.querySelector('.site-search');
        if (input) {
            input.value = q;
            input.dispatchEvent(new Event('input'));
        }
    }

    function initPlayer() {
        var video = document.getElementById('movie-player');
        if (!video) {
            return;
        }
        var overlay = document.querySelector('.play-overlay');
        var stream = video.getAttribute('data-stream');
        var attached = false;

        function attach() {
            if (attached || !stream) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function start() {
            attach();
            if (overlay) {
                overlay.hidden = true;
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (overlay) {
                        overlay.hidden = false;
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.hidden = true;
            }
        });
        video.addEventListener('pause', function () {
            if (overlay && video.currentTime === 0) {
                overlay.hidden = false;
            }
        });
    }

    ready(function () {
        initMobileNav();
        initHero();
        initYearTabs();
        initFilters();
        initPlayer();
    });
})();
