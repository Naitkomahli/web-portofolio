// ===== LOADING SCREEN =====
(function () {
  const terminalBody = document.getElementById("terminal-body");
  const fill         = document.getElementById("loader-fill");
  const pctLabel     = document.getElementById("loader-pct");
  const emoji        = document.getElementById("loader-emoji");

  /* ---- Floating Particles ---- */
  const emojis = ["✨", "💻", "🤖", "📊", "⚡", "🎨", "🔥", "🧠"];
  for (let i = 0; i < 18; i++) {
    const p    = document.createElement("span");
    p.className = "loader-particle";
    const left = Math.random() * 90; // max 90% to avoid edge overflow on mobile
    const dur  = (4 + Math.random() * 6).toFixed(1) + "s";
    const del  = (Math.random() * 5).toFixed(1) + "s";
    p.style.cssText = `left:${left}vw;--dur:${dur};--delay:${del};width:${4 + Math.random() * 6}px;height:${4 + Math.random() * 6}px;`;
    if (Math.random() > 0.6) {
      p.textContent    = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.fontSize = "14px";
      p.style.background = "transparent";
    }
    document.getElementById("loading-screen").insertBefore(p, document.getElementById("loading-screen").firstChild);
  }

  /* ---- Typing Sequence ---- */
  const steps = [
    { type: "cmd", text: "npm install portfolio@latest", delay: 0 },
    { type: "out", text: "✔ Loading modules...",         delay: 600,  dim: true },
    { type: "out", text: "✔ Bundling assets...",         delay: 1100, dim: true },
    { type: "cmd", text: "git clone ilham/projects",    delay: 1600 },
    { type: "out", text: "✔ 4 projects cloned",         delay: 2200 },
    { type: "cmd", text: "python train_model.py --fast", delay: 2700 },
    { type: "out", text: "✔ Model ready  acc: 97.3%",   delay: 3300 },
    { type: "cmd", text: "serve portfolio --open",       delay: 3800 },
    { type: "out", text: "🎉 Ready at http://localhost:3000", delay: 4400 },
  ];

  const emojiFrames = ["🚀", "💻", "🤖", "🎨", "🧠", "✨", "🔥", "🚀"];
  let eIdx = 0;
  const emojiInterval = setInterval(() => {
    eIdx = (eIdx + 1) % emojiFrames.length;
    emoji.textContent = emojiFrames[eIdx];
  }, 600);

  /* ---- Progress Bar ---- */
  const totalDuration = 5100;
  const startTime     = performance.now();
  let raf;

  function animateProgress(now) {
    const pct = Math.min(100, Math.round(((now - startTime) / totalDuration) * 100));
    fill.style.width      = pct + "%";
    pctLabel.textContent  = pct + "%";
    if (pct < 100) raf = requestAnimationFrame(animateProgress);
  }
  raf = requestAnimationFrame(animateProgress);

  /* ---- Render Terminal Line ---- */
  function addLine(step) {
    const line      = document.createElement("div");
    line.className  = "terminal-line";
    if (step.type === "cmd") {
      line.innerHTML = `<span class="terminal-prompt">❯</span><span class="terminal-cmd">${step.text}</span>`;
    } else {
      line.innerHTML = `<span class="terminal-output${step.dim ? " dim" : ""}">${step.text}</span>`;
    }
    terminalBody.appendChild(line);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  steps.forEach((step) => {
    setTimeout(() => addLine(step), step.delay);
  });

  /* ---- Dismiss Loading Screen ---- */
  function dismiss() {
    cancelAnimationFrame(raf);
    clearInterval(emojiInterval);
    fill.style.width                                     = "100%";
    pctLabel.textContent                                 = "100%";
    pctLabel.previousElementSibling.textContent          = "Done!";
    emoji.textContent                                    = "🎉";

    setTimeout(() => {
      const loadingScreen = document.getElementById("loading-screen");
      loadingScreen.classList.add("fade-out");
      document.body.classList.remove("loading");
      setTimeout(() => loadingScreen.remove(), 750);
    }, 400);
  }

  setTimeout(dismiss, totalDuration + 200);
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
