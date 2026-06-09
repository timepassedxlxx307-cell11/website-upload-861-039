import { H as Hls } from "./hls.js";

function setupVideoPlayer(container) {
    var video = container.querySelector("video");
    var playButton = container.querySelector("[data-play-button]");
    var message = container.querySelector("[data-player-message]");
    var primarySource = container.getAttribute("data-source");
    var fallbackSource = container.getAttribute("data-fallback-source");
    var hls = null;
    var initialized = false;
    var usingFallback = false;

    function setMessage(text) {
        if (message) {
            message.textContent = text;
        }
    }

    function destroyHls() {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    }

    function playWhenReady() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                setMessage("浏览器阻止了自动播放，请再次点击播放按钮。 ");
                if (playButton) {
                    playButton.classList.remove("is-hidden");
                }
            });
        }
    }

    function loadSource(source) {
        destroyHls();
        setMessage("正在加载播放源…");

        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                setMessage(usingFallback ? "备用播放源已就绪。" : "播放源已就绪。 ");
                playWhenReady();
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (!usingFallback && fallbackSource) {
                    usingFallback = true;
                    setMessage("主播放源暂不可用，正在切换备用播放源…");
                    loadSource(fallbackSource);
                    return;
                }
                setMessage("视频加载失败，请刷新页面后重试。 ");
            });
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.addEventListener("loadedmetadata", function () {
                setMessage("播放源已就绪。 ");
                playWhenReady();
            }, { once: true });
            video.addEventListener("error", function () {
                if (!usingFallback && fallbackSource) {
                    usingFallback = true;
                    video.src = fallbackSource;
                    playWhenReady();
                    return;
                }
                setMessage("当前浏览器无法播放该视频源。 ");
            }, { once: true });
            return;
        }

        setMessage("当前浏览器不支持 HLS 播放。 ");
    }

    function startPlayback() {
        if (!initialized) {
            initialized = true;
            loadSource(primarySource || fallbackSource);
        } else {
            playWhenReady();
        }
        if (playButton) {
            playButton.classList.add("is-hidden");
        }
    }

    if (playButton) {
        playButton.addEventListener("click", startPlayback);
    }
    video.addEventListener("play", function () {
        if (playButton) {
            playButton.classList.add("is-hidden");
        }
    });
    video.addEventListener("pause", function () {
        if (playButton && initialized) {
            playButton.classList.remove("is-hidden");
        }
    });
}

document.querySelectorAll("[data-video-player]").forEach(setupVideoPlayer);
