function setupVideoPlayer(streamUrl, videoId, coverId) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var hlsInstance = null;
  if (!video) {
    return;
  }

  function attachStream() {
    if (video.getAttribute("data-ready") === "1") {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.setAttribute("data-ready", "1");
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (!data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
          return;
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
          return;
        }
        hlsInstance.destroy();
      });
      video.setAttribute("data-ready", "1");
      return;
    }
    video.src = streamUrl;
    video.setAttribute("data-ready", "1");
  }

  function playVideo() {
    attachStream();
    if (cover) {
      cover.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", playVideo);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    }
  });
  video.addEventListener("play", function () {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
