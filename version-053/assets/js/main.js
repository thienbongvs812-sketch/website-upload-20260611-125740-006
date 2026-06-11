(function () {
    var ready = function (callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    };

    ready(function () {
        initMobileMenu();
        initHeroCarousel();
        initFilters();
        initPlayers();
    });

    function initMobileMenu() {
        var button = document.querySelector('.mobile-menu-button');
        var menu = document.getElementById('mobileMenu');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            var isOpen = menu.classList.toggle('is-open');
            button.setAttribute('aria-expanded', String(isOpen));
        });
    }

    function initHeroCarousel() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        if (!slides.length) {
            return;
        }

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

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

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                play();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', play);
        show(0);
        play();
    }

    function initFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('.js-filter-form'));
        forms.forEach(function (form) {
            var input = form.querySelector('[data-filter-input]');
            var region = form.querySelector('[data-filter-region]');
            var year = form.querySelector('[data-filter-year]');
            var type = form.querySelector('[data-filter-type]');
            var status = form.querySelector('[data-filter-status]');
            var list = document.querySelector('[data-filter-list]');
            var params = new URLSearchParams(window.location.search);

            if (input && params.get('q')) {
                input.value = params.get('q');
            }

            function currentValue(element) {
                return element ? element.value.trim().toLowerCase() : '';
            }

            function apply() {
                if (!list) {
                    return;
                }
                var query = currentValue(input);
                var selectedRegion = currentValue(region);
                var selectedYear = currentValue(year);
                var selectedType = currentValue(type);
                var cards = Array.prototype.slice.call(list.querySelectorAll('[data-search]'));
                var visible = 0;

                cards.forEach(function (card) {
                    var search = (card.getAttribute('data-search') || '').toLowerCase();
                    var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
                    var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
                    var cardType = (card.getAttribute('data-type') || '').toLowerCase();
                    var match = true;

                    if (query && search.indexOf(query) === -1) {
                        match = false;
                    }
                    if (selectedRegion && cardRegion !== selectedRegion) {
                        match = false;
                    }
                    if (selectedYear && cardYear !== selectedYear) {
                        match = false;
                    }
                    if (selectedType && cardType !== selectedType) {
                        match = false;
                    }

                    card.classList.toggle('is-hidden', !match);
                    if (match) {
                        visible += 1;
                    }
                });

                if (status) {
                    status.textContent = visible > 0 ? '筛选结果已更新，可直接进入详情页观看' : '没有匹配内容，请调整筛选条件';
                }
            }

            ['input', 'change'].forEach(function (eventName) {
                [input, region, year, type].forEach(function (element) {
                    if (element) {
                        element.addEventListener(eventName, apply);
                    }
                });
            });

            form.addEventListener('submit', function (event) {
                if (list) {
                    event.preventDefault();
                    apply();
                }
            });

            apply();
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
        players.forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('.player-start');
            var source = shell.getAttribute('data-video-url');
            var initialized = false;
            var hlsInstance = null;

            if (!video || !source) {
                return;
            }

            function setup() {
                if (initialized) {
                    return;
                }
                initialized = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            function start() {
                setup();
                var playPromise = video.play();
                if (playPromise && typeof playPromise.then === 'function') {
                    playPromise.then(function () {
                        shell.classList.add('is-playing');
                    }).catch(function () {
                        shell.classList.remove('is-playing');
                    });
                } else {
                    shell.classList.add('is-playing');
                }
            }

            if (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    start();
                });
            }

            shell.addEventListener('click', function (event) {
                if (event.target === video && !video.paused) {
                    return;
                }
                start();
            });

            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });

            video.addEventListener('pause', function () {
                shell.classList.remove('is-playing');
            });

            window.addEventListener('pagehide', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }
}());
