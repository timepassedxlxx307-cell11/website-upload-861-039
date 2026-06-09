window.initMoviePlayer = function (sourceUrl) {
    var video = document.querySelector(".movie-player-video");
    var overlay = document.querySelector(".player-overlay");
    var startButton = document.querySelector(".player-start");
    var attached = false;
    var hlsInstance = null;

    if (!video || !sourceUrl) {
        return;
    }

    function attachSource() {
        if (attached) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            attached = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
            attached = true;
        }
    }

    function startPlayback() {
        attachSource();
        if (overlay) {
            overlay.hidden = true;
        }
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", startPlayback);
    }

    if (startButton) {
        startButton.addEventListener("click", function (event) {
            event.stopPropagation();
            startPlayback();
        });
    }

    video.addEventListener("click", function () {
        if (!attached) {
            startPlayback();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
};
