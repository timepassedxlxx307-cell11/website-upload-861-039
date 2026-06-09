const M3U8_SOURCES = [
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e398cb38b257828eeedbcaa0ae2856da/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/77ae15566dde5cfb920bae4712a38399/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/41cb67b47a3668efaea014219666e659/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/31227358d3c181b7168e28ad248cfb4e/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/d0af4221b8947fda8c23f4955947cb58/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e70b98acb53eb889d108057988609efb/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/86ea18f9954dbaf22eff5e16c41b4a25/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/2df81e778442675885257ce3e84c7173/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/af3d3f3b4940cee04efcd8ff2c9eef0a/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/60b4ddb3d166e1239abfc7adf611a6a3/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/a27121d514ff0079e1e81a6678f14e0c/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/f0d38b8679a1231eff816a8e04cc1a0c/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/c66b5309b3b64d15ed856810d6cc0b72/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/c99d86ece73a935b77e57d322461ddb5/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/fe0c41d994d01211debb24e84e3384a9/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/929fdb8e536c1fc43a83b32d1a838547/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/fbc04ae173a0e633458658e80ee78c2a/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/0ba4f146b0e6ea192526706f495d460f/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/1e53f0e1aef7ec2fb5f30ef5d309d69c/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/1116997bf50b78f22bbfaced8975a021/manifest/video.m3u8"
];

function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
}

function setupMobileMenu() {
    const button = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');

    if (!button || !nav) {
        return;
    }

    button.addEventListener('click', () => {
        nav.classList.toggle('is-open');
    });
}

function setupHeroSlider() {
    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    const prev = document.querySelector('[data-hero-prev]');
    const next = document.querySelector('[data-hero-next]');

    if (!slides.length) {
        return;
    }

    let currentIndex = 0;
    let timer = null;

    function showSlide(index) {
        currentIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === currentIndex);
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === currentIndex);
        });
    }

    function restartTimer() {
        if (timer) {
            window.clearInterval(timer);
        }

        timer = window.setInterval(() => showSlide(currentIndex + 1), 5200);
    }

    if (prev) {
        prev.addEventListener('click', () => {
            showSlide(currentIndex - 1);
            restartTimer();
        });
    }

    if (next) {
        next.addEventListener('click', () => {
            showSlide(currentIndex + 1);
            restartTimer();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            restartTimer();
        });
    });

    showSlide(0);
    restartTimer();
}

function getQueryValue(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
}

function setupFilters() {
    const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach((panel) => {
        const input = panel.querySelector('[data-filter-input]');
        const typeSelect = panel.querySelector('[data-filter-type]');
        const regionSelect = panel.querySelector('[data-filter-region]');
        const count = panel.querySelector('[data-filter-count]');
        const list = document.querySelector('[data-filter-list]');
        const emptyState = document.querySelector('[data-empty-state]');

        if (!list) {
            return;
        }

        const cards = Array.from(list.querySelectorAll('.movie-card'));

        if (input && getQueryValue('q')) {
            input.value = getQueryValue('q');
        }

        function cardMatches(card, keyword, typeValue, regionValue) {
            const haystack = normalizeText([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.category,
                card.dataset.tags,
                card.innerText
            ].join(' '));

            const typeText = normalizeText(card.dataset.type);
            const regionText = normalizeText(card.dataset.region);

            const keywordOk = !keyword || haystack.includes(keyword);
            const typeOk = !typeValue || typeText.includes(typeValue);
            const regionOk = !regionValue || regionText.includes(regionValue);

            return keywordOk && typeOk && regionOk;
        }

        function applyFilters() {
            const keyword = normalizeText(input ? input.value : '');
            const typeValue = normalizeText(typeSelect ? typeSelect.value : '');
            const regionValue = normalizeText(regionSelect ? regionSelect.value : '');
            let visible = 0;

            cards.forEach((card) => {
                const matches = cardMatches(card, keyword, typeValue, regionValue);
                card.hidden = !matches;
                if (matches) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = `共 ${visible} 部`;
            }

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        [input, typeSelect, regionSelect].forEach((control) => {
            if (!control) {
                return;
            }

            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        });

        applyFilters();
    });
}

function setupHlsPlayers() {
    const frames = Array.from(document.querySelectorAll('[data-player-frame]'));

    frames.forEach((frame, index) => {
        const video = frame.querySelector('video[data-hls-src]');
        const button = frame.querySelector('[data-play-button]');
        const status = frame.querySelector('[data-player-status]');

        if (!video || !button) {
            return;
        }

        const source = video.dataset.hlsSrc || M3U8_SOURCES[index % M3U8_SOURCES.length];
        let initialized = false;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function initializePlayer() {
            if (initialized) {
                return Promise.resolve();
            }

            initialized = true;
            setStatus('正在加载高清播放源...');

            if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hls.loadSource(source);
                hls.attachMedia(video);

                hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                    setStatus('播放源已就绪');
                });

                hls.on(window.Hls.Events.ERROR, (_event, data) => {
                    if (data && data.fatal) {
                        setStatus('播放源加载异常，请刷新页面重试');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                setStatus('播放源已就绪');
            } else {
                video.src = source;
                setStatus('浏览器不支持 HLS 时，请使用支持 HLS 的浏览器访问');
            }

            return Promise.resolve();
        }

        function playVideo() {
            initializePlayer()
                .then(() => video.play())
                .then(() => {
                    frame.classList.add('is-playing');
                    setStatus('正在播放');
                })
                .catch(() => {
                    setStatus('播放被浏览器阻止，请再次点击播放器');
                });
        }

        button.addEventListener('click', playVideo);
        video.addEventListener('play', () => frame.classList.add('is-playing'));
        video.addEventListener('pause', () => frame.classList.remove('is-playing'));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    setupHeroSlider();
    setupFilters();
    setupHlsPlayers();
});
