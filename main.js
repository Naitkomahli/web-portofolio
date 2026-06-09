// ===== LOADING SCREEN =====
(function () {
  const canvas = document.getElementById("space-canvas");
  const ctx = canvas.getContext("2d");
  const introText = document.getElementById("starwars-intro");
  const loaderContent = document.getElementById("loader-content");
  const fill = document.getElementById("loader-fill");
  const pctLabel = document.getElementById("loader-pct");
  const statusLabel = document.getElementById("loader-status");

  // ---- 1. Canvas Starfield Simulation ----
  let width, height;
  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const numStars = 150;
  const stars = [];
  const maxDepth = 1000;

  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: (Math.random() - 0.5) * 1600,
      y: (Math.random() - 0.5) * 1600,
      z: Math.random() * maxDepth,
      size: 0.5 + Math.random() * 1.5,
      color: Math.random() > 0.45 ? "#38bdf8" : "#ffffff"
    });
  }

  let baseSpeed = 1.2;
  let currentSpeed = baseSpeed;
  let warpFactor = 1.0;

  function animateStars() {
    if (warpFactor > 5) {
      // Long warp trails in hyperdrive
      ctx.fillStyle = "rgba(0, 2, 5, 0.22)";
    } else {
      ctx.fillStyle = "#000205";
    }
    ctx.fillRect(0, 0, width, height);

    // Cosmic glow radial overlay
    const grad = ctx.createRadialGradient(width/2, height/2, 10, width/2, height/2, Math.max(width, height));
    grad.addColorStop(0, "rgba(8, 17, 30, 0.45)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0.96)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    currentSpeed = baseSpeed * warpFactor;

    stars.forEach(star => {
      // Previous coordinate projection for stretch line drawing
      const prevX = (star.x / star.z) * (width * 0.7) + width / 2;
      const prevY = (star.y / star.z) * (height * 0.7) + height / 2;

      // Bring star closer
      star.z -= currentSpeed;

      // Reset star if out of screen bounds or too close
      if (star.z <= 0) {
        star.z = maxDepth;
        star.x = (Math.random() - 0.5) * 1600;
        star.y = (Math.random() - 0.5) * 1600;
        return;
      }

      // New projected coordinates
      const px = (star.x / star.z) * (width * 0.7) + width / 2;
      const py = (star.y / star.z) * (height * 0.7) + height / 2;

      if (px >= 0 && px <= width && py >= 0 && py <= height) {
        const factor = (1 - star.z / maxDepth);
        const alpha = Math.min(1, factor * 1.5);
        const radius = star.size * factor * 2;

        ctx.beginPath();
        if (warpFactor > 2) {
          // Star Wars Hyperdrive streak lines
          ctx.strokeStyle = star.color === "#38bdf8" ? `rgba(56, 189, 248, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = radius * 1.3;
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(px, py);
          ctx.stroke();
        } else {
          // Slow floating stars
          ctx.fillStyle = star.color === "#38bdf8" ? `rgba(56, 189, 248, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    requestAnimationFrame(animateStars);
  }
  requestAnimationFrame(animateStars);

  // ---- 2. Preloader Lifecycle Orchestration ----

  // Phase 1: Star Wars Intro Text
  setTimeout(() => {
    introText.classList.add("active");
  }, 150);

  setTimeout(() => {
    introText.classList.remove("active");
    introText.classList.add("fade-away");
  }, 1700);

  setTimeout(() => {
    introText.remove();
    // Phase 2: Lightsaber Progress Bar
    loaderContent.classList.remove("hidden");
    startProgressAnimation();
  }, 2400);

  function startProgressAnimation() {
    const totalDuration = 2800; // Snappy progress speed
    const startTime = performance.now();
    let rafId;

    const statusTexts = [
      { maxPct: 20, text: "Initializing kyber crystal power core..." },
      { maxPct: 45, text: "Aligning magnetic plasma channels..." },
      { maxPct: 70, text: "Scanning space sector for hazards..." },
      { maxPct: 90, text: "Calculating hyperdrive jump coordinates..." },
      { maxPct: 99, text: "Engaging hyperdrive navi-computer..." },
      { maxPct: 100, text: "Punch it, Chewie!" }
    ];

    function animateProgress(now) {
      const elapsed = now - startTime;
      const pct = Math.min(100, Math.round((elapsed / totalDuration) * 100));

      fill.style.width = pct + "%";
      pctLabel.textContent = pct + "%";

      // Update themed progress message
      const currentStatus = statusTexts.find(s => pct <= s.maxPct);
      if (currentStatus) {
        statusLabel.textContent = currentStatus.text;
      }

      if (pct < 100) {
        rafId = requestAnimationFrame(animateProgress);
      } else {
        cancelAnimationFrame(rafId);
        triggerHyperdriveJump();
      }
    }
    rafId = requestAnimationFrame(animateProgress);
  }

  // Phase 3 & 4: Hyperdrive Warp & Exit Reveal
  function triggerHyperdriveJump() {
    // Rapidly ramp up speed warpFactor
    let startWarp = performance.now();
    let warpDuration = 900;

    function warpRamp(now) {
      const elapsed = now - startWarp;
      const progress = Math.min(1, elapsed / warpDuration);
      
      // Easing function to punch the speed up dramatically at the end
      warpFactor = 1.0 + Math.pow(progress, 3) * 34.0; 

      if (progress < 1) {
        requestAnimationFrame(warpRamp);
      } else {
        // Exit loading screen
        const loadingScreen = document.getElementById("loading-screen");
        loadingScreen.classList.add("fade-out");
        document.body.classList.remove("loading");

        setTimeout(() => {
          loadingScreen.remove();
          window.removeEventListener("resize", resizeCanvas);
        }, 800);
      }
    }
    requestAnimationFrame(warpRamp);
  }
})();


// ===== NAVBAR AUTOHIDE =====
let lastScrollTop    = 0;
let scrollUpDistance = 0;
let mouseTimeout     = null;
const navbar         = document.querySelector(".navbar");

function startMouseTimeout(scrollTop) {
  if (scrollTop > 100 && !mouseTimeout) {
    mouseTimeout = setTimeout(function () {
      navbar.classList.add("navbar-hidden");
      mouseTimeout = null;
    }, 2000);
  }
}

window.addEventListener("scroll", function () {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop) {
    // Scrolling down
    if (scrollTop > 100) {
      navbar.classList.add("navbar-hidden");
    }
    scrollUpDistance = 0;
  } else {
    // Scrolling up
    scrollUpDistance += lastScrollTop - scrollTop;
    if (scrollUpDistance > 150 || scrollTop <= 50) {
      navbar.classList.remove("navbar-hidden");
      startMouseTimeout(scrollTop);
    }
  }
  lastScrollTop = Math.max(scrollTop, 0);
});

// Deteksi posisi Mouse
document.addEventListener("mousemove", function (e) {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (e.clientY <= 120) {
    navbar.classList.remove("navbar-hidden");
    clearTimeout(mouseTimeout);
    mouseTimeout = null;
  } else {
    if (!navbar.classList.contains("navbar-hidden")) {
      startMouseTimeout(scrollTop);
    }
  }
});


// ===== SCROLL ANIMATIONS =====
function applyAnimation(element) {
  if (element.classList.contains("scroll-fade")) {
    element.style.animation = "fadeIn 0.8s ease-out forwards";
  } else if (element.classList.contains("scroll-slide-left")) {
    element.style.animation = "slideInLeft 0.8s ease-out forwards";
  } else if (element.classList.contains("scroll-slide-right")) {
    element.style.animation = "slideInRight 0.8s ease-out forwards";
  } else if (element.classList.contains("scroll-slide-up")) {
    element.style.animation = "slideInUp 0.8s ease-out forwards";
  } else if (element.classList.contains("scroll-scale")) {
    element.style.animation = "scaleIn 0.8s ease-out forwards";
  } else if (element.classList.contains("scroll-bounce")) {
    element.style.animation = "bounceIn 0.8s ease-out forwards";
  }

  for (let i = 1; i <= 6; i++) {
    if (element.classList.contains(`scroll-stagger-${i}`)) {
      element.style.animationDelay = `${i * 0.1}s`;
      break;
    }
  }
}

function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top < window.innerHeight &&
    rect.bottom > 0 &&
    rect.top < window.innerHeight - 100
  );
}

const observerOptions = {
  threshold:  0.1,
  rootMargin: "0px 0px -100px 0px",
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      applyAnimation(entry.target);
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

const animatedElements = document.querySelectorAll(
  ".scroll-fade, .scroll-slide-left, .scroll-slide-right, .scroll-slide-up, .scroll-scale, .scroll-bounce"
);

animatedElements.forEach((element) => {
  if (isElementInViewport(element)) {
    applyAnimation(element);
  } else {
    observer.observe(element);
  }
});

// ===== PROJECT FILTER =====
document.addEventListener("DOMContentLoaded", function () {
  const filterBtns = document.querySelectorAll("#project-filters .filter-btn");
  const projectItems = document.querySelectorAll("#project-grid .project-item");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Update active button
      filterBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      const filterValue = this.getAttribute("data-filter");

      projectItems.forEach((item) => {
        const category = item.getAttribute("data-category");

        // Add filtering class for transition effect
        item.classList.add("filtering");

        setTimeout(() => {
          if (filterValue === "all" || category === filterValue) {
            item.classList.remove("hidden");
            // Remove filtering class after a brief delay to allow transition
            requestAnimationFrame(() => {
              item.classList.remove("filtering");
            });
          } else {
            item.classList.add("hidden");
            item.classList.remove("filtering");
          }
        }, 300);
      });
    });
  });
});
