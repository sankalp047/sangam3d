// ===================================
// Radio Sangam - Main JavaScript
// ===================================

// =====  Loading Screen =====
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 1500);
});

// ===== Three.js Sound Wave Animation =====
function initThreeJS() {
    const canvas = document.getElementById('threejs-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 50;
    
    // Create particle system for sound waves
    const particleCount = 3000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    // Light luxury colors - blue, gold, sage
    const color1 = new THREE.Color(0x457b9d); // Primary blue
    const color2 = new THREE.Color(0xd4af37); // Gold
    const color3 = new THREE.Color(0x81b29a); // Sage green
    
    for (let i = 0; i < particleCount; i++) {
        // Spread particles in a wave pattern
        const i3 = i * 3;
        const radius = Math.random() * 80;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);
        
        // Gradient colors
        const mixFactor = Math.random();
        const color = mixFactor < 0.33 ? color1 : mixFactor < 0.66 ? color2 : color3;
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // Animation variables
    let scrollY = window.scrollY;
    let time = 0;
    
    // Update scroll position
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        time += 0.001;
        
        // Rotate particle system
        particleSystem.rotation.x = time * 0.2 + scrollY * 0.0001;
        particleSystem.rotation.y = time * 0.3 + scrollY * 0.0002;
        
        // Wave animation based on scroll
        const positions = particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            // Create wave effect
            positions[i + 1] = y + Math.sin(time * 2 + x * 0.1 + scrollY * 0.001) * 0.1;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
        
        // Camera movement based on scroll
        camera.position.y = -scrollY * 0.01;
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Initialize Three.js
initThreeJS();

// ===== Navigation =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

// Scroll effect for navbar
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
hamburger?.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Active nav link based on scroll
const sections = document.querySelectorAll('section[id]');
function highlightNavLink() {
    const scrollY = window.scrollY;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            navLink?.classList.add('active');
        }
    });
}

window.addEventListener('scroll', highlightNavLink);

// ===== Carousel =====
const carouselTrack = document.getElementById('carousel-track');
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');
const dotsContainer = document.getElementById('carousel-dots');

if (carouselTrack) {
    const cards = Array.from(carouselTrack.children);
    let currentIndex = 0;
    let cardsPerView = 3;
    let autoPlayInterval;
    
    // Calculate cards per view based on screen size
    function updateCardsPerView() {
        const width = window.innerWidth;
        if (width < 768) {
            cardsPerView = 1;
        } else if (width < 1024) {
            cardsPerView = 2;
        } else {
            cardsPerView = 3;
        }
        updateCarousel();
    }
    
    // Create dots
    function createDots() {
        dotsContainer.innerHTML = '';
        const totalSlides = Math.ceil(cards.length / cardsPerView);
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }
    
    // Update carousel position
function updateCarousel() {
    const cardWidth = cards[0].offsetWidth;
    const gap = 32; // 2rem gap

    // One slide = cardsPerView cards
    const slideWidth = (cardWidth + gap) * cardsPerView;

    const offset = -(currentIndex * slideWidth);
    carouselTrack.style.transform = `translateX(${offset}px)`;

    // Update dots
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
    });
}

    
    // Go to specific slide
    function goToSlide(index) {
        const maxIndex = Math.ceil(cards.length / cardsPerView) - 1;
        currentIndex = Math.max(0, Math.min(index, maxIndex));
        updateCarousel();
        resetAutoPlay();
    }
    
    // Next slide
    function nextSlide() {
        const maxIndex = Math.ceil(cards.length / cardsPerView) - 1;
        currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
        updateCarousel();
    }
    
    // Previous slide
    function prevSlide() {
        const maxIndex = Math.ceil(cards.length / cardsPerView) - 1;
        currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
        updateCarousel();
    }
    
    // Auto play
    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 5000);
    }
    
    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }
    
    function resetAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }
    
    // Event listeners
    nextBtn?.addEventListener('click', () => {
        nextSlide();
        resetAutoPlay();
    });
    
    prevBtn?.addEventListener('click', () => {
        prevSlide();
        resetAutoPlay();
    });
    
    // Pause auto play on hover
    carouselTrack.addEventListener('mouseenter', stopAutoPlay);
    carouselTrack.addEventListener('mouseleave', startAutoPlay);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        updateCardsPerView();
    });
    
    // Initialize
    updateCardsPerView();
    createDots();
    startAutoPlay();
}

// ===== Audio Player =====
const audioPlayer = document.getElementById('audio-player');
const radioStream = document.getElementById('radio-stream');
const playPauseBtn = document.getElementById('play-pause-btn');
const playIcon = document.getElementById('play-icon');
const playerStatus = document.getElementById('player-status');
const volumeSlider = document.getElementById('volume-slider');
const volumeBtn = document.getElementById('volume-btn');
const volumeIcon = document.getElementById('volume-icon');
const heroListenBtn = document.getElementById('hero-listen-btn');

let isPlaying = false;

// Set initial volume
radioStream.volume = 0.7;

// Play/Pause functionality
function togglePlay() {
    if (isPlaying) {
        radioStream.pause();
        playIcon.classList.replace('fa-pause', 'fa-play');
        playerStatus.textContent = 'Paused';
        isPlaying = false;
    } else {
        radioStream.play()
            .then(() => {
                playIcon.classList.replace('fa-play', 'fa-pause');
                playerStatus.textContent = 'Now Playing - Live';
                isPlaying = true;
            })
            .catch(error => {
                console.error('Playback failed:', error);
                playerStatus.textContent = 'Error playing stream';
            });
    }
}

playPauseBtn?.addEventListener('click', togglePlay);
heroListenBtn?.addEventListener('click', togglePlay);

// Volume control
volumeSlider?.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    radioStream.volume = volume;
    
    // Update icon based on volume
    if (volume === 0) {
        volumeIcon.classList.replace('fa-volume-up', 'fa-volume-mute');
        volumeIcon.classList.replace('fa-volume-down', 'fa-volume-mute');
    } else if (volume < 0.5) {
        volumeIcon.classList.replace('fa-volume-up', 'fa-volume-down');
        volumeIcon.classList.replace('fa-volume-mute', 'fa-volume-down');
    } else {
        volumeIcon.classList.replace('fa-volume-down', 'fa-volume-up');
        volumeIcon.classList.replace('fa-volume-mute', 'fa-volume-up');
    }
});

// Mute/Unmute
let previousVolume = 0.7;
volumeBtn?.addEventListener('click', () => {
    if (radioStream.volume > 0) {
        previousVolume = radioStream.volume;
        radioStream.volume = 0;
        volumeSlider.value = 0;
        volumeIcon.classList.remove('fa-volume-up', 'fa-volume-down');
        volumeIcon.classList.add('fa-volume-mute');
    } else {
        radioStream.volume = previousVolume;
        volumeSlider.value = previousVolume * 100;
        volumeIcon.classList.remove('fa-volume-mute');
        if (previousVolume < 0.5) {
            volumeIcon.classList.add('fa-volume-down');
        } else {
            volumeIcon.classList.add('fa-volume-up');
        }
    }
});

// Handle stream errors
radioStream?.addEventListener('error', () => {
    playerStatus.textContent = 'Connection error';
    playIcon.classList.replace('fa-pause', 'fa-play');
    isPlaying = false;
});

// Handle stream loading
radioStream?.addEventListener('loadstart', () => {
    if (isPlaying) {
        playerStatus.textContent = 'Connecting...';
    }
});

radioStream?.addEventListener('canplay', () => {
    if (isPlaying) {
        playerStatus.textContent = 'Now Playing - Live';
    }
});

// ===== Login Modal =====
const loginBtn = document.getElementById('login-btn');
const loginModal = document.getElementById('login-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');

function openLoginModal() {
    loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
    loginModal.classList.remove('active');
    document.body.style.overflow = '';
}

loginBtn?.addEventListener('click', openLoginModal);
modalClose?.addEventListener('click', closeLoginModal);
modalOverlay?.addEventListener('click', closeLoginModal);

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && loginModal.classList.contains('active')) {
        closeLoginModal();
    }
});

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ===== Intersection Observer for Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
const animateElements = document.querySelectorAll('.rj-card, .feature-card, .contact-item');
animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ===== Advertising Carousel =====
const advertisingTrack = document.getElementById('advertising-track');
const advertisingIndicators = document.getElementById('advertising-indicators');
let currentAdIndex = 0;
let adData = [];
let adAutoPlayInterval;

// Fetch advertising data from API
async function fetchAdvertisingData() {
    try {
        const response = await fetch('https://funasiacrm.com/App/RadioSangam/advertising.json');
        if (!response.ok) {
            throw new Error('Failed to fetch advertising data');
        }
        const data = await response.json();
        adData = data.ads || [];
        
        if (adData.length > 0) {
            initializeAdvertisingCarousel();
        } else {
            console.warn('No advertising data available');
            // Hide advertising section if no ads
            document.querySelector('.advertising-section')?.remove();
        }
    } catch (error) {
        console.error('Error fetching advertising data:', error);
        // Hide advertising section on error
        document.querySelector('.advertising-section')?.remove();
    }
}

// Initialize advertising carousel
function initializeAdvertisingCarousel() {
    if (!advertisingTrack || !advertisingIndicators) return;
    
    // Clear existing content
    advertisingTrack.innerHTML = '';
    advertisingIndicators.innerHTML = '';
    
    // Create slides
    adData.forEach((ad, index) => {
        // Create slide
        const slide = document.createElement('div');
        slide.classList.add('advertising-slide');
        slide.innerHTML = `
            <a href="${ad.url}" target="_blank" rel="noopener noreferrer">
                <img src="https://funasiacrm.com/App/RadioSangam/${ad.image}" alt="Advertisement">
            </a>
        `;
        advertisingTrack.appendChild(slide);
        
        // Create indicator
        const indicator = document.createElement('div');
        indicator.classList.add('ad-indicator');
        if (index === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => goToAd(index));
        advertisingIndicators.appendChild(indicator);
    });
    
    // Start auto-play
    startAdAutoPlay();
    
    // Pause on hover
    advertisingTrack.addEventListener('mouseenter', stopAdAutoPlay);
    advertisingTrack.addEventListener('mouseleave', startAdAutoPlay);
}

// Navigate to specific ad
function goToAd(index) {
    if (!advertisingTrack) return;
    currentAdIndex = index;
    advertisingTrack.style.transform = `translateX(-${currentAdIndex * 100}%)`;
    
    // Update indicators
    const indicators = advertisingIndicators.querySelectorAll('.ad-indicator');
    indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === currentAdIndex);
    });
    
    resetAdAutoPlay();
}

// Next ad
function nextAd() {
    currentAdIndex = (currentAdIndex + 1) % adData.length;
    goToAd(currentAdIndex);
}

// Auto-play functions
function startAdAutoPlay() {
    if (adData.length <= 1) return;
    adAutoPlayInterval = setInterval(nextAd, 3000);
}

function stopAdAutoPlay() {
    clearInterval(adAutoPlayInterval);
}

function resetAdAutoPlay() {
    stopAdAutoPlay();
    startAdAutoPlay();
}

// Initialize advertising on page load
fetchAdvertisingData();

// ===== App Phone 3D Animation =====
const phone3d = document.getElementById('phone-3d');

if (phone3d) {
    // Add mouse move parallax effect
    document.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        
        const xRotation = ((clientY / innerHeight) - 0.5) * 10;
        const yRotation = ((clientX / innerWidth) - 0.5) * -10;
        
        phone3d.style.transform = `rotateX(${xRotation}deg) rotateY(${yRotation}deg) translateY(-10px)`;
    });
    
    // Reset on mouse leave
    document.addEventListener('mouseleave', () => {
        phone3d.style.transform = '';
    });
}

// ===== Console Welcome Message =====
console.log('%c🎵 Radio Sangam 📻', 'font-size: 24px; font-weight: bold; color: #d4af37;');
console.log('%cWelcome to Radio Sangam - Dallas\'s Premier Telugu Radio Station', 'font-size: 14px; color: #7c4dff;');
console.log('%c104.1 FM & 104.9 HD4', 'font-size: 12px; color: #1a0f5c;');
