/**
 * Visitor Counter & Like Button
 * 
 * Uses Firebase Realtime Database for cross-user persistence.
 * Falls back to localStorage if Firebase is not configured.
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │  Firebase 설정 방법 (Setup Guide)                            │
 * │                                                             │
 * │  1. https://console.firebase.google.com 에 접속              │
 * │  2. "프로젝트 추가" 클릭 → 프로젝트 이름 입력 → 생성           │ 
 * │  3. 좌측 메뉴 "빌드" → "Realtime Database" → "데이터베이스 만들기" │
 * │     → 위치 선택 → "테스트 모드에서 시작" 선택                   │
 * │  4. 좌측 "프로젝트 설정" (⚙️) → "일반" 탭 → 아래로 스크롤       │
 * │     → "내 앱" 섹션에서 </> (웹) 아이콘 클릭                    │
 * │     → 앱 이름 입력 후 "앱 등록"                                │
 * │  5. 표시되는 firebaseConfig 값을 아래에 붙여넣기                │
 * │  6. Realtime Database → "규칙" 탭에서 아래와 같이 설정:         │
 * │     {                                                       │
 * │       "rules": {                                            │
 * │         "portfolio-stats": {                                │
 * │           ".read": true,                                    │
 * │           ".write": true                                    │
 * │         }                                                   │
 * │       }                                                     │
 * │     }                                                       │
 * └─────────────────────────────────────────────────────────────┘
 */

(function () {
    'use strict';

    // ============================================================
    // 🔧 Firebase Configuration - 아래 값을 본인의 Firebase 프로젝트 값으로 교체하세요
    // ============================================================
    const firebaseConfig = {
        apiKey: "AIzaSyDBHc4y7Oo-5u3cRSsmZESluLibZQUhmck",
        authDomain: "portfolio-counter-fef27.firebaseapp.com",
        databaseURL: "https://portfolio-counter-fef27-default-rtdb.firebaseio.com",
        projectId: "portfolio-counter-fef27",
        storageBucket: "portfolio-counter-fef27.firebasestorage.app",
        messagingSenderId: "728303502359",
        appId: "1:728303502359:web:03eae7f3f8139773674852"
    };
    // ============================================================

    const DB_ROOT = 'portfolio-stats';
    const STORAGE_KEYS = {
        lastVisit: 'portfolio_last_visit',
        visitorId: 'portfolio_visitor_id',
        liked: 'portfolio_liked',
        localLikes: 'portfolio_local_likes',
        localTotal: 'portfolio_local_total',
    };

    let db = null;
    let isFirebaseReady = false;

    // -----------------------------------------------------------
    // Initialization
    // -----------------------------------------------------------
    function init() {
        initFirebase();
        setupLikeButton();
    }

    function initFirebase() {
        try {
            if (!firebaseConfig.apiKey || firebaseConfig.apiKey === '') {
                console.info(
                    '%c🔥 Firebase 미설정 — 로컬 모드로 동작합니다.\n' +
                    'js/visitor-counter.js 파일 상단의 firebaseConfig를 설정해주세요.',
                    'color: #ff9800; font-weight: bold; font-size: 13px;'
                );
                initLocalMode();
                return;
            }

            firebase.initializeApp(firebaseConfig);
            db = firebase.database();
            isFirebaseReady = true;

            trackVisitor();
            loadLikes();
        } catch (error) {
            console.error('Firebase 초기화 오류:', error);
            initLocalMode();
        }
    }

    // -----------------------------------------------------------
    // Local Mode (when Firebase is not configured)
    // -----------------------------------------------------------
    function initLocalMode() {
        // Visitor: use localStorage-based counter
        const today = getTodayString();
        const lastVisit = localStorage.getItem(STORAGE_KEYS.lastVisit);
        let localTotal = parseInt(localStorage.getItem(STORAGE_KEYS.localTotal) || '0', 10);

        if (lastVisit !== today) {
            localTotal++;
            localStorage.setItem(STORAGE_KEYS.localTotal, localTotal);
            localStorage.setItem(STORAGE_KEYS.lastVisit, today);
        }

        animateNumber('total-visitors', 0, localTotal, 1200);
        animateNumber('today-visitors', 0, lastVisit === today ? 1 : 1, 800);

        // Likes: use localStorage
        const localLikes = parseInt(localStorage.getItem(STORAGE_KEYS.localLikes) || '0', 10);
        animateNumber('like-count', 0, localLikes, 1000);

        const hasLiked = localStorage.getItem(STORAGE_KEYS.liked) === 'true';
        if (hasLiked) {
            const likeBtn = document.getElementById('like-btn');
            if (likeBtn) likeBtn.classList.add('liked');
        }
    }

    // -----------------------------------------------------------
    // Visitor Tracking (Firebase)
    // -----------------------------------------------------------
    function getTodayString() {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function trackVisitor() {
        const today = getTodayString();
        const lastVisit = localStorage.getItem(STORAGE_KEYS.lastVisit);

        if (lastVisit !== today) {
            localStorage.setItem(STORAGE_KEYS.lastVisit, today);

            // Increment total visitors
            db.ref(`${DB_ROOT}/totalVisitors`).transaction(function (current) {
                return (current || 0) + 1;
            });

            // Increment today's visitors
            db.ref(`${DB_ROOT}/daily/${today}`).transaction(function (current) {
                return (current || 0) + 1;
            });
        }

        // Listen for real-time updates
        db.ref(`${DB_ROOT}/totalVisitors`).on('value', function (snapshot) {
            const total = snapshot.val() || 0;
            animateNumber('total-visitors', 0, total, 1200);
        });

        db.ref(`${DB_ROOT}/daily/${today}`).on('value', function (snapshot) {
            const todayCount = snapshot.val() || 0;
            animateNumber('today-visitors', 0, todayCount, 800);
        });
    }

    // -----------------------------------------------------------
    // Like System (Firebase)
    // -----------------------------------------------------------
    function loadLikes() {
        const hasLiked = localStorage.getItem(STORAGE_KEYS.liked) === 'true';
        const likeBtn = document.getElementById('like-btn');

        if (hasLiked && likeBtn) {
            likeBtn.classList.add('liked');
            likeBtn.style.cursor = 'default';
        }

        db.ref(`${DB_ROOT}/likes`).on('value', function (snapshot) {
            const likes = snapshot.val() || 0;
            animateNumber('like-count', 0, likes, 1000);
        });
    }

    function setupLikeButton() {
        const likeBtn = document.getElementById('like-btn');
        if (!likeBtn) return;

        likeBtn.addEventListener('click', function () {
            toggleLike(likeBtn);
        });
    }

    function toggleLike(likeBtn) {
        const hasLiked = localStorage.getItem(STORAGE_KEYS.liked) === 'true';

        // 이미 좋아요를 누른 사람은 되돌릴 수 없음!
        if (hasLiked) return;

        // Like (one-way, irreversible)
        localStorage.setItem(STORAGE_KEYS.liked, 'true');
        likeBtn.classList.add('liked');
        likeBtn.style.cursor = 'default';

        // Trigger animations
        likeBtn.classList.add('animate');
        setTimeout(function () {
            likeBtn.classList.remove('animate');
        }, 600);

        // Create floating heart particles
        createHeartParticles(likeBtn);

        if (isFirebaseReady) {
            db.ref(`${DB_ROOT}/likes`).transaction(function (current) {
                return (current || 0) + 1;
            });
        } else {
            // Local mode
            var localLikes = parseInt(localStorage.getItem(STORAGE_KEYS.localLikes) || '0', 10);
            localLikes++;
            localStorage.setItem(STORAGE_KEYS.localLikes, localLikes);
            animateNumber('like-count', 0, localLikes, 300);
        }
    }

    // -----------------------------------------------------------
    // Heart Particles Effect
    // -----------------------------------------------------------
    function createHeartParticles(button) {
        var symbols = ['❤', '♥', '💕', '💗', '✨'];
        var count = 8;

        for (var i = 0; i < count; i++) {
            var particle = document.createElement('span');
            particle.className = 'heart-particle';
            particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];

            var angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            var distance = 25 + Math.random() * 35;
            var tx = Math.cos(angle) * distance;
            var ty = Math.sin(angle) * distance - 15; // bias upward
            var rot = (Math.random() - 0.5) * 120;

            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            particle.style.setProperty('--rot', rot + 'deg');

            button.appendChild(particle);

            // Cleanup
            (function (p) {
                setTimeout(function () {
                    if (p.parentNode) p.parentNode.removeChild(p);
                }, 900);
            })(particle);
        }
    }

    // -----------------------------------------------------------
    // Number Animation (ease-out cubic)
    // -----------------------------------------------------------
    function animateNumber(elementId, start, end, duration) {
        var element = document.getElementById(elementId);
        if (!element) return;

        // Don't re-animate if already showing the correct number
        if (element.textContent === end.toLocaleString()) return;

        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var elapsed = timestamp - startTime;
            var progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.round(start + (end - start) * eased);

            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    // -----------------------------------------------------------
    // DOM Ready
    // -----------------------------------------------------------
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
