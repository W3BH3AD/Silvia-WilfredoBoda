/**
 * Premium Editorial Wedding Website Logic
 * Wilfredo & Silvia (14.11.2026)
 */

document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------
    // 1. Live Countdown Timer
    // Target date: Nov 14, 2026 at 18:00:00 (Argentinian ceremony time)
    // -------------------------------------------------------------
    const targetDate = new Date("2026-11-14T18:00:00-03:00").getTime(); // UTC-3 for Argentina

    const updateCountdown = () => {
        const now = new Date().getTime();
        const difference = targetDate - now;

        const daysEl = document.getElementById("daysValue");
        const hoursEl = document.getElementById("hoursValue");
        const minutesEl = document.getElementById("minutesValue");
        const secondsEl = document.getElementById("secondsValue");

        if (difference <= 0) {
            // Target date reached
            daysEl.textContent = "00";
            hoursEl.textContent = "00";
            minutesEl.textContent = "00";
            secondsEl.textContent = "00";
            document.querySelector(".countdown-label").textContent = "¡NUESTRA BODA COMPARTIDA!";
            return;
        }

        // Calculations for days, hours, minutes and seconds
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Format with leading zeros
        daysEl.textContent = String(days).padStart(3, "0");
        hoursEl.textContent = String(hours).padStart(2, "0");
        minutesEl.textContent = String(minutes).padStart(2, "0");
        secondsEl.textContent = String(seconds).padStart(2, "0");
    };

    // Run immediately and update every second
    updateCountdown();
    setInterval(updateCountdown, 1000);


    // -------------------------------------------------------------
    // 2. Scroll Reveal Animations (Intersection Observer)
    // -------------------------------------------------------------
    const revealElements = document.querySelectorAll(".scroll-reveal");

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target); // Reveal once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px" // Triggers slightly before entering fully
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    // Also trigger instant reveal for hero items in case they are above fold
    setTimeout(() => {
        const heroDate = document.querySelector(".hero-date-container");
        if (heroDate) heroDate.classList.add("visible");
    }, 150);


    // -------------------------------------------------------------
    // 3. Smart Header (Scroll-Up Reveal) & Mobile Drawer Menu
    // -------------------------------------------------------------
    const mainHeader = document.getElementById("mainHeader");
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const mobileDrawer = document.getElementById("mobileDrawer");
    const drawerBackdrop = document.getElementById("drawerBackdrop");
    const closeDrawerBtn = document.getElementById("closeDrawerBtn");
    const drawerLinks = document.querySelectorAll(".drawer-link");

    let lastScrollY = window.scrollY;

    window.addEventListener("scroll", () => {
        const currentScrollY = window.scrollY;

        // Apply glass background & shadow when scrolled
        if (currentScrollY > 40) {
            mainHeader.classList.add("scrolled");
        } else {
            mainHeader.classList.remove("scrolled");
        }

        // Hide header on Scroll DOWN, Reveal on Scroll UP
        if (currentScrollY > 120 && currentScrollY > lastScrollY) {
            mainHeader.classList.add("nav-hidden");
        } else if (currentScrollY < lastScrollY) {
            mainHeader.classList.remove("nav-hidden");
        }

        lastScrollY = currentScrollY;
    }, { passive: true });

    // Drawer Toggle Logic
    const openDrawer = () => {
        if (mobileDrawer && drawerBackdrop) {
            mobileDrawer.classList.add("active");
            drawerBackdrop.classList.add("active");
            document.body.style.overflow = "hidden";
        }
    };

    const closeDrawer = () => {
        if (mobileDrawer && drawerBackdrop) {
            mobileDrawer.classList.remove("active");
            drawerBackdrop.classList.remove("active");
            document.body.style.overflow = "auto";
        }
    };

    if (hamburgerBtn) hamburgerBtn.addEventListener("click", openDrawer);
    if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", closeDrawer);
    if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeDrawer);

    drawerLinks.forEach(link => {
        link.addEventListener("click", closeDrawer);
    });


    // -------------------------------------------------------------
    // 4. Map Modal Controller
    // -------------------------------------------------------------
    const mapModal = document.getElementById("mapModal");
    const closeMapBtn = document.getElementById("closeMapBtn");

    // -------------------------------------------------------------
    // Location Data & Multi-Venue Map Controller
    // -------------------------------------------------------------
    const locationsData = {
        ceremonia: {
            title: "CEREMONIA",
            venue: "Parroquia Jesús Mediador",
            address: "1000 Calle Demetrio Odaly, San Juan, PR 00924",
            lat: 18.3986,
            lng: -66.0150,
            googleMapsUrl: "https://maps.google.com/?q=Parroquia+Jes%C3%BAs+Mediador,+1000+Calle+Demetrio+Odaly,+San+Juan,+PR+00924"
        },
        recepcion: {
            title: "RECEPCIÓN",
            venue: "Fundación Luis Muñoz Marín",
            address: "877 Carretera Estatal, San Juan, PR 00926",
            lat: 18.3758,
            lng: -66.0332,
            googleMapsUrl: "https://maps.google.com/?q=Fundaci%C3%B3n+Luis+Mu%C3%B1oz+Mar%C3%ADn,+877+Carretera+Estatal,+San+Juan,+PR+00926"
        }
    };

    const mapTitle = document.getElementById("mapTitle");
    const mapSubtitle = document.getElementById("mapSubtitle");
    const mapAddressText = document.getElementById("mapAddressText");
    const mapNavBtn = document.getElementById("mapNavBtn");

    let map = null; // Leaflet map instance
    let marker = null;

    const openLocationMap = (locKey) => {
        const loc = locationsData[locKey] || locationsData.ceremonia;

        if (mapTitle) mapTitle.textContent = loc.title;
        if (mapSubtitle) mapSubtitle.textContent = loc.venue;
        if (mapAddressText) mapAddressText.textContent = loc.address;
        if (mapNavBtn) mapNavBtn.setAttribute("href", loc.googleMapsUrl);

        mapModal.classList.add("active");
        document.body.style.overflow = "hidden";

        setTimeout(() => {
            if (!map) {
                map = L.map("map", {
                    center: [loc.lat, loc.lng],
                    zoom: 15,
                    zoomControl: true
                });

                L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
                    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
                    subdomains: 'abcd',
                    maxZoom: 20
                }).addTo(map);

                const markerStyle = L.divIcon({
                    className: "custom-map-marker",
                    html: '<div style="background-color: #1a1a1a; width: 16px; height: 16px; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.35);"></div>',
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                });

                marker = L.marker([loc.lat, loc.lng], { icon: markerStyle }).addTo(map);
                marker.bindPopup(`
                    <div style="font-family: 'Montserrat', sans-serif; text-align: center; padding: 0.5rem 0.2rem;">
                        <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin-bottom: 0.4rem; font-style: italic;">${loc.venue}</h4>
                        <p style="font-size: 0.65rem; letter-spacing: 0.05em; color: #666;">${loc.title}</p>
                        <p style="font-size: 0.65rem; font-weight: 600; margin-top: 0.3rem;">¡Te esperamos aquí!</p>
                    </div>
                `).openPopup();
            } else {
                map.setView([loc.lat, loc.lng], 15);
                if (marker) {
                    marker.setLatLng([loc.lat, loc.lng]);
                    marker.setPopupContent(`
                        <div style="font-family: 'Montserrat', sans-serif; text-align: center; padding: 0.5rem 0.2rem;">
                            <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin-bottom: 0.4rem; font-style: italic;">${loc.venue}</h4>
                            <p style="font-size: 0.65rem; letter-spacing: 0.05em; color: #666;">${loc.title}</p>
                            <p style="font-size: 0.65rem; font-weight: 600; margin-top: 0.3rem;">¡Te esperamos aquí!</p>
                        </div>
                    `);
                    marker.openPopup();
                }
                map.invalidateSize();
            }
        }, 300);
    };

    document.querySelectorAll(".open-location-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const locKey = e.currentTarget.getAttribute("data-location");
            openLocationMap(locKey);
        });
    });

    // Close Modals
    const closeModal = (modal) => {
        if (modal) {
            modal.classList.remove("active");
            document.body.style.overflow = "auto";
        }
    };

    if (closeMapBtn) closeMapBtn.addEventListener("click", () => closeModal(mapModal));

    // Close on backdrop overlay click
    if (mapModal) {
        mapModal.addEventListener("click", (e) => {
            if (e.target === mapModal) {
                closeModal(mapModal);
            }
        });
    }

    // Close on Escape key press
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && mapModal && mapModal.classList.contains("active")) {
            closeModal(mapModal);
        }
    });


    // -------------------------------------------------------------
    // 5. Attire Inspiration Carousel Controller
    // -------------------------------------------------------------
    const attireTrack = document.getElementById("attireTrack");
    const attirePrevBtn = document.getElementById("attirePrevBtn");
    const attireNextBtn = document.getElementById("attireNextBtn");
    const attireDots = document.querySelectorAll("#attireDots .dot");
    
    let currentSlide = 0;
    const totalSlides = 5;

    const goToSlide = (index) => {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        
        currentSlide = index;
        if (attireTrack) {
            attireTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
        
        attireDots.forEach((dot, i) => {
            if (i === currentSlide) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });
    };

    if (attireNextBtn) attireNextBtn.addEventListener("click", () => goToSlide(currentSlide + 1));
    if (attirePrevBtn) attirePrevBtn.addEventListener("click", () => goToSlide(currentSlide - 1));

    attireDots.forEach((dot, i) => {
        dot.addEventListener("click", () => goToSlide(i));
    });

    // Touch & Swipe Support for Attire Carousel on Mobile / Tablets
    let touchStartX = 0;
    let touchEndX = 0;

    if (attireTrack) {
        attireTrack.addEventListener("touchstart", (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        attireTrack.addEventListener("touchend", (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    const handleSwipe = () => {
        const swipeThreshold = 35;
        if (touchEndX < touchStartX - swipeThreshold) {
            goToSlide(currentSlide + 1); // Swipe left -> Next slide
        } else if (touchEndX > touchStartX + swipeThreshold) {
            goToSlide(currentSlide - 1); // Swipe right -> Prev slide
        }
    };


    // -------------------------------------------------------------
    // 6. Floating Ambient Background Music Engine
    // -------------------------------------------------------------
    const bgAudio = document.getElementById("bgAudio");
    const musicPlayer = document.getElementById("musicPlayer");
    const musicStatusText = document.getElementById("musicStatusText");

    let isPlaying = false;
    if (bgAudio) {
        bgAudio.volume = 0.45; // Gentle ambient volume
    }

    const toggleMusic = () => {
        if (!bgAudio || !musicPlayer) return;

        if (isPlaying) {
            bgAudio.pause();
            musicPlayer.classList.remove("music-playing");
            if (musicStatusText) musicStatusText.textContent = "MÚSICA: OFF";
            isPlaying = false;
        } else {
            bgAudio.play().then(() => {
                musicPlayer.classList.add("music-playing");
                if (musicStatusText) musicStatusText.textContent = "MÚSICA: ON";
                isPlaying = true;
            }).catch(err => {
                console.log("Audio play blocked by browser policy:", err);
            });
        }
    };

    if (musicPlayer) {
        musicPlayer.addEventListener("click", toggleMusic);
    }

    // Auto-enable audio on user's first interaction anywhere on page
    const enableAudioOnInteraction = () => {
        if (!isPlaying && bgAudio) {
            bgAudio.play().then(() => {
                if (musicPlayer) musicPlayer.classList.add("music-playing");
                if (musicStatusText) musicStatusText.textContent = "MÚSICA: ON";
                isPlaying = true;
                removeInteractionListeners();
            }).catch(err => {
                console.log("Autoplay interactivo retenido:", err);
            });
        }
    };

    const removeInteractionListeners = () => {
        document.removeEventListener("click", enableAudioOnInteraction);
        document.removeEventListener("scroll", enableAudioOnInteraction);
        document.removeEventListener("touchstart", enableAudioOnInteraction);
    };

    document.addEventListener("click", enableAudioOnInteraction);
    document.addEventListener("scroll", enableAudioOnInteraction);
    document.addEventListener("touchstart", enableAudioOnInteraction);
});
