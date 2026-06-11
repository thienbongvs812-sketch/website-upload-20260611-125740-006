(function () {
  var shell = document.querySelector('.watch-player');
  if (!shell) {
    return;
  }
  var video = shell.querySelector('video');
  var cover = shell.querySelector('.player-cover');
  var stream = shell.getAttribute('data-stream');
  var started = false;

  function attachStream() {
    if (!video || !stream || started) {
      return;
    }
    started = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }
    video.src = stream;
  }

  function begin() {
    attachStream();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', begin);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      }
    });
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
  }
})();
