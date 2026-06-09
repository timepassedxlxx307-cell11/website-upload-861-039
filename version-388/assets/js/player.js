var MoviePlayer = (function () {
    function mount(videoId, overlayId, sourceUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var hls = null;
        var loaded = false;

        if (!video || !overlay || !sourceUrl) {
            return;
        }

        function playVideo() {
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    video.addEventListener("canplay", function () {
                        video.play().catch(function () {});
                    }, { once: true });
                });
            }
        }

        function load() {
            if (loaded) {
                overlay.classList.add("is-hidden");
                playVideo();
                return;
            }

            loaded = true;
            overlay.classList.add("is-hidden");
            video.setAttribute("controls", "controls");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                playVideo();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                playVideo();
                return;
            }

            video.src = sourceUrl;
            playVideo();
        }

        overlay.addEventListener("click", load);
        video.addEventListener("click", function () {
            if (!loaded || video.paused) {
                load();
            }
        });
        video.addEventListener("play", function () {
            overlay.classList.add("is-hidden");
        });
        video.addEventListener("ended", function () {
            if (hls) {
                hls.stopLoad();
            }
        });
    }

    return {
        mount: mount
    };
})();
