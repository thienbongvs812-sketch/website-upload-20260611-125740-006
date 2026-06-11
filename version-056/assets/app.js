(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        setupMobileMenu();
        setupHeroCarousel();
        setupFilters();
        setupPlayers();
    });

    function setupMobileMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");

        if (!toggle || !mobileNav) {
            return;
        }

        toggle.addEventListener("click", function () {
            var isOpen = mobileNav.classList.toggle("open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector("[data-hero-carousel]");

        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var previous = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var grid = document.getElementById("movieGrid");
        var searchInput = document.getElementById("searchInput");
        var typeFilter = document.getElementById("typeFilter");
        var yearFilter = document.getElementById("yearFilter");
        var clearButton = document.getElementById("clearFilters");
        var emptyState = document.getElementById("emptyState");

        if (!grid || !searchInput) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(searchInput.value);
            var typeValue = normalize(typeFilter ? typeFilter.value : "");
            var yearValue = normalize(yearFilter ? yearFilter.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.category
                ].join(" "));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesType = !typeValue || normalize(card.dataset.type) === typeValue;
                var matchesYear = !yearValue || normalize(card.dataset.year) === yearValue;
                var shouldShow = matchesKeyword && matchesType && matchesYear;

                card.style.display = shouldShow ? "" : "none";

                if (shouldShow) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.style.display = visible ? "none" : "block";
            }
        }

        searchInput.addEventListener("input", applyFilters);

        if (typeFilter) {
            typeFilter.addEventListener("change", applyFilters);
        }

        if (yearFilter) {
            yearFilter.addEventListener("change", applyFilters);
        }

        if (clearButton) {
            clearButton.addEventListener("click", function () {
                searchInput.value = "";

                if (typeFilter) {
                    typeFilter.value = "";
                }

                if (yearFilter) {
                    yearFilter.value = "";
                }

                applyFilters();
            });
        }
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".video-play-button");

            if (!video) {
                return;
            }

            bindVideoSource(video);

            if (button) {
                button.addEventListener("click", function () {
                    playVideo(video, player);
                });
            }

            video.addEventListener("click", function () {
                playVideo(video, player);
            });

            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });

            video.addEventListener("pause", function () {
                if (video.currentTime === 0 || video.ended) {
                    player.classList.remove("is-playing");
                }
            });

            video.addEventListener("ended", function () {
                player.classList.remove("is-playing");
            });
        });
    }

    function bindVideoSource(video) {
        var hlsSource = video.dataset.hlsSrc;
        var mp4Source = video.dataset.mp4Src;
        var canPlayNativeHls = Boolean(video.canPlayType("application/vnd.apple.mpegurl"));

        if (hlsSource && canPlayNativeHls) {
            video.src = hlsSource;
            video.type = "application/vnd.apple.mpegurl";
            return;
        }

        if (mp4Source) {
            video.src = mp4Source;
        }
    }

    function playVideo(video, player) {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.then === "function") {
            playPromise.then(function () {
                player.classList.add("is-playing");
            }).catch(function () {
                player.classList.remove("is-playing");
            });
        } else {
            player.classList.add("is-playing");
        }
    }
})();
