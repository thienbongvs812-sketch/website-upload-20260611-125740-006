(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (navButton && nav) {
        navButton.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startHero() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        var next = hero.querySelector('[data-hero-next]');
        var prev = hero.querySelector('[data-hero-prev]');

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startHero();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startHero();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startHero();
            });
        });

        showSlide(0);
        startHero();
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.style.opacity = '0';
        }, { once: true });
    });

    function readQuery() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    var liveSearch = document.querySelector('[data-live-search]');
    var regionFilter = document.querySelector('[data-filter-region]');
    var typeFilter = document.querySelector('[data-filter-type]');
    var yearFilter = document.querySelector('[data-filter-year]');
    var results = document.querySelector('[data-search-results]');
    var empty = document.querySelector('[data-search-empty]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applySearchFilters() {
        if (!results) {
            return;
        }

        var query = normalize(liveSearch ? liveSearch.value : '');
        var region = regionFilter ? regionFilter.value : '';
        var type = typeFilter ? typeFilter.value : '';
        var year = yearFilter ? yearFilter.value : '';
        var visible = 0;

        results.querySelectorAll('.movie-card').forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' '));
            var matchesQuery = !query || haystack.indexOf(query) !== -1;
            var matchesRegion = !region || card.getAttribute('data-region') === region;
            var matchesType = !type || card.getAttribute('data-type') === type;
            var matchesYear = !year || card.getAttribute('data-year') === year;
            var show = matchesQuery && matchesRegion && matchesType && matchesYear;
            card.hidden = !show;
            if (show) {
                visible += 1;
            }
        });

        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    if (liveSearch) {
        liveSearch.value = readQuery();
        liveSearch.addEventListener('input', applySearchFilters);
        applySearchFilters();
    }

    [regionFilter, typeFilter, yearFilter].forEach(function (filter) {
        if (filter) {
            filter.addEventListener('change', applySearchFilters);
        }
    });

    var quickFilters = document.querySelector('[data-quick-filters]');
    if (quickFilters && liveSearch) {
        quickFilters.querySelectorAll('button').forEach(function (button) {
            button.addEventListener('click', function () {
                var value = button.getAttribute('data-filter-value') || '';
                liveSearch.value = value;
                quickFilters.querySelectorAll('button').forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applySearchFilters();
            });
        });
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var triggers = player.querySelectorAll('[data-player-start]');
        var hlsInstance = null;

        function attachStream() {
            if (!video || video.getAttribute('data-ready') === 'true') {
                return;
            }

            var streamUrl = video.getAttribute('data-stream-url');
            if (!streamUrl) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            video.setAttribute('data-ready', 'true');
        }

        function playVideo(event) {
            if (event) {
                event.preventDefault();
            }
            attachStream();
            if (!video) {
                return;
            }
            video.controls = true;
            player.classList.add('is-started');
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    video.controls = true;
                });
            }
        }

        triggers.forEach(function (trigger) {
            trigger.addEventListener('click', playVideo);
        });

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });
            window.addEventListener('pagehide', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    });

    document.querySelectorAll('[data-scroll-play]').forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            var player = document.querySelector('[data-player]');
            var trigger = player ? player.querySelector('[data-player-start]') : null;
            if (player) {
                player.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            if (trigger) {
                trigger.click();
            }
        });
    });

})();
