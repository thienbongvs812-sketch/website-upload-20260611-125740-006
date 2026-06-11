(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length === 0) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function restart() {
      window.clearInterval(timer);
      start();
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });
    show(0);
    start();
  }

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var input = document.querySelector("[data-filter-input]");
    var region = document.querySelector("[data-filter-region]");
    var type = document.querySelector("[data-filter-type]");
    var year = document.querySelector("[data-filter-year]");
    var status = document.querySelector("[data-filter-status]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var query = getQueryValue("q");
    if (query && input) {
      input.value = query;
    }
    function value(el) {
      return el ? el.value.trim().toLowerCase() : "";
    }
    function filter() {
      var q = value(input);
      var r = value(region);
      var t = value(type);
      var y = value(year);
      var matched = 0;
      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-title") || "").toLowerCase();
        var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
        var cardType = (card.getAttribute("data-type") || "").toLowerCase();
        var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (r && cardRegion !== r) {
          ok = false;
        }
        if (t && cardType !== t) {
          ok = false;
        }
        if (y && cardYear !== y) {
          ok = false;
        }
        card.classList.toggle("is-hidden", !ok);
        if (ok) {
          matched += 1;
        }
      });
      if (status) {
        status.textContent = matched > 0 ? "已为你筛选出相关影片。" : "暂未找到匹配影片。";
      }
    }
    [input, region, type, year].forEach(function (el) {
      if (el) {
        el.addEventListener("input", filter);
        el.addEventListener("change", filter);
      }
    });
    filter();
  }

  function setupPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-movie-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var stream = player.getAttribute("data-stream");
      var loaded = false;
      var hls = null;
      if (!video || !stream) {
        return;
      }
      function load() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }
      function play() {
        load();
        if (button) {
          button.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            if (button) {
              button.classList.remove("is-hidden");
            }
          });
        }
      }
      if (button) {
        button.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });
      video.addEventListener("ended", function () {
        if (button) {
          button.classList.remove("is-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
