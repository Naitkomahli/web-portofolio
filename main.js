// ===== LOADING SCREEN =====
(function () {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  let seenLoader = null;
  try {
    seenLoader = sessionStorage.getItem("io-visited");
  } catch (e) {
    seenLoader = null;
  }

  // Skip the loader on repeat visits and for reduced-motion users
  if (reduceMotion || seenLoader) {
    const screen = document.getElementById("loading-screen");
    if (screen) screen.remove();
    document.body.classList.remove("loading");
    requestAnimationFrame(function () {
      document.body.classList.add("is-ready");
    });
    return;
  }
  try {
    sessionStorage.setItem("io-visited", "1");
  } catch (e) {
    /* storage blocked: load the intro anyway */
  }

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
      color: Math.random() > 0.45 ? "#818cf8" : "#ffffff"
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
          ctx.strokeStyle = star.color === "#818cf8" ? `rgba(129, 140, 248, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = radius * 1.3;
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(px, py);
          ctx.stroke();
        } else {
          // Slow floating stars
          ctx.fillStyle = star.color === "#818cf8" ? `rgba(129, 140, 248, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
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
  }, 80);

  setTimeout(() => {
    introText.classList.remove("active");
    introText.classList.add("fade-away");
  }, 420);

  setTimeout(() => {
    introText.remove();
    // Phase 2: Lightsaber Progress Bar
    loaderContent.classList.remove("hidden");
    startProgressAnimation();
  }, 520);

  function startProgressAnimation() {
    const totalDuration = 560;
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
    let warpDuration = 240;

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
        setTimeout(function () {
          document.body.classList.add("is-ready");
        }, 120);

        setTimeout(() => {
          loadingScreen.remove();
          window.removeEventListener("resize", resizeCanvas);
        }, 200);
      }
    }
    requestAnimationFrame(warpRamp);
  }
})();


// ===== NAV, SCROLLSPY, HERO PARALLAX, REVEALS =====
// The floating dock hides on downward scroll and returns on upward scroll.
// The hero drifts apart while the about curtain covers it. Copy is unmasked by
// clip-path, never by fading its color away.
(function () {
  const nav = document.getElementById("site-nav");
  const dock = document.querySelector("[data-nav-dock]");
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu");
  const links = Array.from(document.querySelectorAll(".nav-link"));
  const stars = document.querySelector(".hero-stars");
  const copy = document.querySelector(".hero-copy");
  const portrait = document.querySelector(".hero-portrait");
  const hero = document.querySelector(".hero");
  const marqueeWrap = document.querySelector("[data-marquee-wrap]");
  const marqueeTrack = document.querySelector("[data-marquee]");
  const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = window.matchMedia("(min-width: 900px)");

  let ticking = false;
  let activeLink = null;
  let lastY = window.scrollY || 0;

  // If the loader ever stalls, the page still becomes readable.
  setTimeout(function () {
    document.body.classList.add("is-ready");
  }, 2600);

  function setMenu(open) {
    if (!menu || !toggle) return;
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (dock) dock.classList.toggle("is-menu-open", open);
  }

  function showNav() {
    if (nav) nav.classList.remove("is-hidden");
  }

  function hideNav() {
    if (!nav) return;
    if (menu && menu.classList.contains("is-open")) return;
    nav.classList.add("is-hidden");
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(!menu.classList.contains("is-open"));
      showNav();
    });

    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });

    document.addEventListener("click", function (event) {
      if (!event.target.closest(".site-nav") && menu.classList.contains("is-open")) {
        setMenu(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        setMenu(false);
        toggle.focus();
      }
    });

    desktop.addEventListener("change", function (event) {
      if (event.matches) setMenu(false);
    });
  }

  if (nav) nav.addEventListener("focusin", showNav);

  // Liquid glass highlight follows the pointer inside the dock.
  if (dock) {
    dock.addEventListener("pointermove", function (event) {
      if (event.pointerType === "touch") return;
      dock.classList.add("has-pointer");
      const rect = dock.getBoundingClientRect();
      dock.style.setProperty("--mx", (event.clientX - rect.left).toFixed(1) + "px");
      dock.style.setProperty("--my", (event.clientY - rect.top).toFixed(1) + "px");
    });
  }

  // Reveal by geometry, not by observing the clipped element. A fully clipped
  // target reports zero intersection in Chrome, so the curtain would never open.
  function revealOnScroll(vh) {
    revealEls.forEach(function (el) {
      if (el.classList.contains("is-in")) return;
      if (reduce.matches) {
        el.classList.add("is-in");
        return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.94 && rect.bottom > 0) {
        el.classList.add("is-in");
      }
    });
  }

  function update() {
    ticking = false;

    const y = window.scrollY || window.pageYOffset || 0;
    const vh = window.innerHeight;

    revealOnScroll(vh);

    if (nav) {
      nav.classList.toggle("is-scrolled", y > 8);

      if (reduce.matches || y < 80) {
        showNav();
      } else {
        const delta = y - lastY;
        if (delta > 6) hideNav();
        else if (delta < -6) showNav();
      }
    }
    lastY = y;

    // Scene 1: the field lags, the portrait sinks, the copy lifts away.
    const heroHeight = hero ? hero.offsetHeight || vh : vh;
    const progress = Math.min(1, Math.max(0, y / heroHeight));

    if (reduce.matches) {
      if (stars) stars.style.transform = "";
      if (copy) copy.style.transform = "";
      if (portrait) portrait.style.transform = "";
    } else {
      if (stars) {
        stars.style.transform = `translate3d(0, ${(-140 * progress).toFixed(2)}px, 0)`;
      }
      if (copy) {
        copy.style.transform = `translate3d(0, ${(-48 * progress).toFixed(2)}px, 0)`;
      }
      if (portrait) {
        const drift = desktop.matches ? 64 : -24;
        portrait.style.transform = `translate3d(0, ${(drift * progress).toFixed(2)}px, 0)`;
      }
    }

    // The capability strip slides horizontally as it crosses the viewport.
    if (marqueeWrap && marqueeTrack) {
      if (reduce.matches) {
        marqueeTrack.style.transform = "";
      } else {
        const rect = marqueeWrap.getBoundingClientRect();
        const span = vh + rect.height;
        const p = Math.min(
          1,
          Math.max(0, (vh - rect.top) / (span > 0 ? span : 1))
        );
        marqueeTrack.style.transform = `translate3d(${(-p * 50).toFixed(2)}%, 0, 0)`;
      }
    }

    // Scrollspy: the section whose top has crossed the upper quarter wins.
    const line = y + vh * 0.25;
    let current = null;

    links.forEach(function (link) {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      if (target.getBoundingClientRect().top + y <= line) current = link;
    });

    if (current !== activeLink) {
      links.forEach(function (link) {
        const on = link === current;
        link.classList.toggle("active", on);
        if (on) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
      activeLink = current;
    }
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  reduce.addEventListener("change", requestUpdate);
  update();
})();


// ===== PORTFOLIO: PLATE CROSSFADE, COUNTER, PINNED RAIL =====
// Wide screens read a sticky browser plate beside ten scrolling text scenes.
// Stacked screens pin the plate and slide one text rail underneath it, so the
// copy can never sit behind the image on a short viewport.
(function () {
  const stage = document.querySelector("[data-work-stage]");
  const sequence = document.querySelector("[data-work-sequence]");
  const rail = document.querySelector("[data-work-rail]");
  const scenes = Array.from(document.querySelectorAll("[data-work-scene]"));
  const images = Array.from(document.querySelectorAll("[data-work-image]"));
  const counter = document.querySelector("[data-work-counter]");
  const urlLabel = document.querySelector("[data-work-url]");
  const progressBar = document.querySelector("[data-work-progress]");
  const narrow = window.matchMedia("(max-width: 899px)");

  if (!stage || !sequence || !scenes.length || !images.length) return;

  const bodies = scenes
    .map(function (scene) {
      return scene.querySelector(".scene-body") || scene;
    })
    .filter(Boolean);

  const total = String(scenes.length).padStart(2, "0");
  const urls = scenes.map(function (scene) {
    return scene.getAttribute("data-work-url") || "";
  });

  let active = 0;
  let observer = null;
  let ticking = false;

  function clamp(value) {
    return Math.min(1, Math.max(0, value));
  }

  function setSceneInteractive(scene, on) {
    if (on) {
      scene.removeAttribute("inert");
      scene.removeAttribute("aria-hidden");
    } else {
      scene.setAttribute("inert", "");
      scene.setAttribute("aria-hidden", "true");
    }

    scene.querySelectorAll("a").forEach(function (link) {
      if (on) {
        link.removeAttribute("tabindex");
      } else {
        link.setAttribute("tabindex", "-1");
      }
    });
  }

  function clearInteractivity() {
    scenes.forEach(function (scene) {
      scene.removeAttribute("inert");
      scene.removeAttribute("aria-hidden");
      scene.querySelectorAll("a").forEach(function (link) {
        link.removeAttribute("tabindex");
      });
    });
  }

  function setActive(index, force) {
    if (index < 0 || index >= scenes.length) return;
    if (!force && index === active) return;
    active = index;

    images.forEach(function (image, i) {
      image.classList.toggle("is-active", i === index);
    });

    if (counter) {
      counter.textContent = `[${String(index + 1).padStart(2, "0")} / ${total}]`;
    }
    if (urlLabel) {
      urlLabel.textContent = urls[index] || "";
    }

    scenes.forEach(function (scene, i) {
      const on = i === index;
      scene.classList.toggle("is-active", on);
      scene.classList.toggle("is-current", on);
    });

    if (narrow.matches) {
      if (rail) {
        rail.style.transform = `translate3d(0, -${index * 100}%, 0)`;
      }
      scenes.forEach(function (scene, i) {
        setSceneInteractive(scene, i === index);
      });
    }
  }

  function buildObserver() {
    if (observer) observer.disconnect();
    observer = null;

    if (narrow.matches) return;

    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const scene = entry.target.closest("[data-work-scene]");
          if (scene) {
            setActive(Number(scene.getAttribute("data-work-scene")));
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );

    bodies.forEach(function (body) {
      observer.observe(body);
    });
  }

  function readProgress() {
    const rect = stage.getBoundingClientRect();

    if (narrow.matches) {
      const topOffset = parseFloat(getComputedStyle(sequence).top) || 0;
      const travel = stage.offsetHeight - sequence.offsetHeight;
      if (travel <= 0) return 0;
      return clamp((topOffset - rect.top) / travel);
    }

    const vh = window.innerHeight;
    const height = stage.offsetHeight || 1;
    const start = vh * 0.5;
    const travel = height - start;
    return clamp((start - rect.top) / (travel > 0 ? travel : 1));
  }

  function updateStage() {
    ticking = false;

    const progress = readProgress();
    if (progressBar) {
      progressBar.style.transform = `scaleX(${progress.toFixed(4)})`;
    }

    if (!narrow.matches) return;

    const index = Math.min(
      scenes.length - 1,
      Math.floor(progress * scenes.length)
    );
    setActive(index);
  }

  function requestStageUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateStage);
  }

  function applyMode() {
    clearInteractivity();

    if (narrow.matches) {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      setActive(active, true);
      updateStage();
    } else {
      if (rail) rail.style.transform = "";
      setActive(active, true);
      buildObserver();
      updateStage();
    }
  }

  window.addEventListener("scroll", requestStageUpdate, { passive: true });
  window.addEventListener("resize", requestStageUpdate);
  narrow.addEventListener("change", applyMode);

  applyMode();
})();


// ===== I18N TRANSLATION (EN / ID) =====
(function () {
  const i18n = {
    en: {
      "skip-link": "Skip to content",
      "nav-about": "About",
      "nav-experience": "Experience",
      "nav-skills": "Toolkit",
      "nav-projects": "Portfolio",
      "nav-contact": "Contact",
      "hero-subtitle": "Junior Web Developer / Machine Learning Enthusiast",
      "hero-desc":
        "Crafting elegant, functional, and user-centric web experiences with a focus on clean code.",
      "about-title": "About",
      "about-lead":
        "I am a Junior Web Developer and Machine Learning Enthusiast based in Indonesia.",
      "about-text":
        "I have a strong passion for building elegant, functional, and user-centric web experiences. I prioritize writing clean, maintainable code and always strive to stay ahead of the curve by exploring the latest technologies in web development and data science.",
      "about-note":
        "Informatics Engineering / Universitas Dian Nuswantoro",
      "exp-title": "Experience",
      "exp-group-education": "Education",
      "exp-group-work": "Work",
      "exp-group-org": "Organization",
      "exp-edu-degree": "Bachelor of Informatics Engineering",
      "exp-edu-org": "Universitas Dian Nuswantoro",
      "exp-edu-desc": "GPA 3.72 / 4.00",
      "exp-job1-title": "Web Developer Intern",
      "exp-job1-org": "Dinas Komunikasi dan Informatika (Diskominfo)",
      "exp-job1-desc1":
        "Designed and built the Aspirasi Masyarakat web application end to end, from interface to database.",
      "exp-job1-desc2":
        "Built a responsive interface and the backend data management behind it.",
      "exp-job1-desc3":
        "Tested features independently to keep the reporting flow reliable.",
      "exp-job2-title": "Operations & Sales Admin",
      "exp-job2-desc1":
        "Logged daily customer orders into structured formats so deliveries stayed on schedule.",
      "exp-job2-desc2":
        "Kept transaction data and service schedules accurate to reduce operational errors.",
      "exp-job2-desc3":
        "Archived order data so transaction history could be traced reliably.",
      "exp-org-title": "Design Staff",
      "exp-org-desc":
        "Produced visual assets and promotional material for the campus chess organization.",
      "skills-title": "Toolkit",
      "skills-frontend": "Frontend",
      "skills-backend": "Backend & Database",
      "skills-data": "Data & AI",
      "proj-title": "Portfolio",
      "proj-intro":
        "Ten projects, from client websites to machine learning experiments.",
      "plate-label": "Portfolio",
      "proj-toelip-title": "Toelip Interior: Studio Website",
      "proj-toelip-desc":
        "Company profile for an interior and custom furniture studio in Semarang. Astro keeps the pages static and fast, while portfolio works come from Supabase through one cached API endpoint, complete with category filters and a gallery lightbox.",
      "proj-aspirasi-title": "Plamongan Sari Village Public Aspiration System",
      "proj-aspirasi-desc":
        "A PHP and Bootstrap platform that digitizes public feedback for a village administration.",
      "proj-spendscan-title": "SpendScan: Receipt Scanner and Expense Tracker",
      "proj-spendscan-desc":
        "A React Native expense tracker that reads receipts with Groq Vision and turns them into reports.",
      "proj-rfm-title": "Customer Segmentation: RFM + K-Means",
      "proj-rfm-desc":
        "Segmented 5,878 customers across 800K retail transactions with RFM and K-Means.",
      "proj-toelip-admin-title": "Toelip Interior: Owner Dashboard",
      "proj-toelip-admin-desc":
        "The owner dashboard behind Toelip: publish portfolio work, manage categories, and keep the public site in sync.",
      "proj-mental-title": "Mental Health Detection using SVM",
      "proj-mental-desc":
        "A Streamlit app that screens mental health risk from questionnaire answers with a support vector machine.",
      "proj-churn-title": "Churn Prediction using Logistic Regression",
      "proj-churn-desc":
        "Predicts customer churn from account behaviour and shows which signals push each customer toward leaving.",
      "proj-jobtracker-title": "JobTracker: Fullstack Job Application Tracker",
      "proj-jobtracker-desc":
        "A fullstack board for applications, interviews, and offers, with authentication and a Postgres-backed API.",
      "proj-ikn-title":
        "Sentiment Analysis of IKN Discussions Using Naive Bayes",
      "proj-ikn-desc":
        "Classified public discussion about Indonesia's new capital with a Naive Bayes pipeline, from collection to evaluation.",
      "proj-todo-title": "To Do List Website",
      "proj-todo-desc":
        "A small vanilla JavaScript task list with local persistence, filters, and keyboard-friendly controls.",
      "proj-meta-web": "Web",
      "proj-meta-mobile": "Mobile",
      "proj-meta-ml": "Machine Learning",
      "proj-link-live": "Visit site",
      "proj-link-repo": "Repository",
      "proj-link-apk": "Download APK",
      "contact-title": "Tell me what you are building.",
      "contact-form-title": "Send a message",
      "contact-name-label": "Your name",
      "contact-name-placeholder": "Enter your full name",
      "contact-email-label": "Your email",
      "contact-email-placeholder": "name@example.com",
      "contact-msg-label": "Message",
      "contact-msg-placeholder":
        "Tell me about the project or role you have in mind",
      "contact-send-btn": "Send message",
      "contact-autoresponse":
        "Thank you for reaching out! I have received your message and will get back to you shortly.",
      "footer-copyright": "\u00a9 2026 Ilham Oktian Ramadhan",
      "footer-location": "Indonesia",
      "footer-top": "Back to top",
      "lang-label": "EN",
    },
    id: {
      "skip-link": "Lewati ke konten",
      "nav-about": "Tentang",
      "nav-experience": "Pengalaman",
      "nav-skills": "Keahlian",
      "nav-projects": "Portofolio",
      "nav-contact": "Kontak",
      "hero-subtitle": "Junior Web Developer / Penggemar Machine Learning",
      "hero-desc":
        "Membangun pengalaman web yang elegan, fungsional, dan berpusat pada pengguna dengan fokus pada kode yang bersih.",
      "about-title": "Tentang",
      "about-lead":
        "Saya adalah Junior Web Developer dan Penggemar Machine Learning yang berbasis di Indonesia.",
      "about-text":
        "Saya memiliki passion kuat dalam membangun pengalaman web yang elegan, fungsional, dan berpusat pada pengguna. Saya mengutamakan penulisan kode yang bersih dan mudah dirawat, serta selalu berusaha mengikuti perkembangan teknologi terbaru di bidang pengembangan web dan data sains.",
      "about-note":
        "Teknik Informatika / Universitas Dian Nuswantoro",
      "exp-title": "Pengalaman",
      "exp-group-education": "Pendidikan",
      "exp-group-work": "Pengalaman",
      "exp-group-org": "Organisasi",
      "exp-edu-degree": "S1 Teknik Informatika",
      "exp-edu-org": "Universitas Dian Nuswantoro",
      "exp-edu-desc": "IPK 3.72 / 4.00",
      "exp-job1-title": "Web Developer Intern",
      "exp-job1-org": "Dinas Komunikasi dan Informatika (Diskominfo)",
      "exp-job1-desc1":
        'Merancang dan membangun aplikasi web "Aspirasi Masyarakat" secara end-to-end (Fullstack) untuk memfasilitasi pelaporan warga.',
      "exp-job1-desc2":
        "Mengembangkan antarmuka web yang responsif dan sistem manajemen data backend yang kokoh.",
      "exp-job1-desc3":
        "Melakukan pengujian fitur secara mandiri untuk memastikan alur input data dan pengalaman pengguna yang sempurna.",
      "exp-job2-title": "Admin Operasional & Penjualan",
      "exp-job2-desc1":
        "Mengelola dan mencatat data pesanan pelanggan harian ke dalam format terstruktur untuk memastikan layanan tepat waktu.",
      "exp-job2-desc2":
        "Menjaga akurasi data transaksi dan jadwal layanan untuk meminimalkan kesalahan operasional.",
      "exp-job2-desc3":
        "Mengarsipkan data pesanan secara rutin dan aman untuk memudahkan pelacakan riwayat transaksi.",
      "exp-org-title": "Staf Desain",
      "exp-org-desc":
        "Memproduksi aset visual dan materi promosi untuk organisasi catur kampus.",
      "skills-title": "Keahlian",
      "skills-frontend": "Frontend",
      "skills-backend": "Backend & Basis Data",
      "skills-data": "Data & AI",
      "proj-title": "Portofolio",
      "proj-intro":
        "Sepuluh proyek, dari situs klien hingga eksperimen machine learning.",
      "plate-label": "Portofolio",
      "proj-toelip-title": "Toelip Interior: Situs Studio",
      "proj-toelip-desc":
        "Situs profil perusahaan studio desain interior dan furnitur kustom di Semarang. Halaman Astro tetap statis dan cepat, sementara karya portofolio diambil dari Supabase lewat satu endpoint API ber-cache, lengkap dengan filter kategori dan lightbox galeri.",
      "proj-aspirasi-title":
        "Sistem Aspirasi Masyarakat Desa Plamongan Sari",
      "proj-aspirasi-desc":
        "Platform web berbasis PHP dan Bootstrap untuk mendigitalisasi dan menyederhanakan umpan balik publik bagi administrasi desa.",
      "proj-spendscan-title":
        "SpendScan: Pemindai Struk dan Pelacak Pengeluaran",
      "proj-spendscan-desc":
        "Pelacak pengeluaran React Native yang membaca struk dengan Groq Vision dan mengubahnya menjadi laporan.",
      "proj-rfm-title": "Segmentasi Pelanggan: RFM + K-Means",
      "proj-rfm-desc":
        "Membagi 5.878 pelanggan dari 800K transaksi ritel dengan RFM dan K-Means.",
      "proj-toelip-admin-title": "Toelip Interior: Dasbor Pemilik",
      "proj-toelip-admin-desc":
        "Dasbor pemilik di balik Toelip: menerbitkan karya portofolio, mengelola kategori, dan menjaga situs publik tetap sinkron.",
      "proj-mental-title": "Deteksi Kesehatan Mental menggunakan SVM",
      "proj-mental-desc":
        "Aplikasi Streamlit yang menyaring risiko kesehatan mental dari jawaban kuesioner dengan support vector machine.",
      "proj-churn-title":
        "Prediksi Churn menggunakan Logistic Regression",
      "proj-churn-desc":
        "Memprediksi churn pelanggan dari perilaku akun dan menunjukkan sinyal yang mendorong tiap pelanggan untuk pergi.",
      "proj-jobtracker-title":
        "JobTracker: Pelacak Lamaran Kerja Fullstack",
      "proj-jobtracker-desc":
        "Papan fullstack untuk lamaran, wawancara, dan tawaran kerja, dengan autentikasi dan API berbasis Postgres.",
      "proj-ikn-title":
        "Analisis Sentimen Diskusi IKN menggunakan Naive Bayes",
      "proj-ikn-desc":
        "Mengklasifikasikan diskusi publik tentang ibu kota baru Indonesia dengan pipeline Naive Bayes, dari pengumpulan hingga evaluasi.",
      "proj-todo-title": "Website To Do List",
      "proj-todo-desc":
        "Daftar tugas JavaScript vanilla kecil dengan penyimpanan lokal, filter, dan kontrol yang ramah keyboard.",
      "proj-meta-web": "Web",
      "proj-meta-mobile": "Mobile",
      "proj-meta-ml": "Machine Learning",
      "proj-link-live": "Kunjungi situs",
      "proj-link-repo": "Repositori",
      "proj-link-apk": "Unduh APK",
      "contact-title": "Ceritakan apa yang sedang Anda bangun.",
      "contact-form-title": "Kirim pesan",
      "contact-name-label": "Nama Anda",
      "contact-name-placeholder": "Masukkan nama lengkap Anda",
      "contact-email-label": "Email Anda",
      "contact-email-placeholder": "nama@contoh.com",
      "contact-msg-label": "Pesan",
      "contact-msg-placeholder":
        "Ceritakan proyek atau peran yang Anda cari",
      "contact-send-btn": "Kirim pesan",
      "contact-autoresponse":
        "Terima kasih telah menghubungi! Pesan Anda telah saya terima dan akan segera saya balas.",
      "footer-copyright": "\u00a9 2026 Ilham Oktian Ramadhan",
      "footer-location": "Indonesia",
      "footer-top": "Kembali ke atas",
      "lang-label": "ID",
    },
  };

  let currentLang = "en";
  try {
    currentLang = localStorage.getItem("lang") || "en";
  } catch (e) {
    currentLang = "en";
  }
  if (!i18n[currentLang]) currentLang = "en";

  function applyLanguage(lang) {
    currentLang = lang;
    try {
      localStorage.setItem("lang", lang);
    } catch (e) {
      /* storage blocked: keep the switch for this page only */
    }

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      const key = el.getAttribute("data-i18n");
      if (i18n[lang] && i18n[lang][key]) {
        el.textContent = i18n[lang][key];
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      const key = el.getAttribute("data-i18n-placeholder");
      if (i18n[lang] && i18n[lang][key]) {
        el.placeholder = i18n[lang][key];
      }
    });

    document.querySelectorAll("[data-i18n-value]").forEach(function (el) {
      const key = el.getAttribute("data-i18n-value");
      if (i18n[lang] && i18n[lang][key]) {
        el.value = i18n[lang][key];
      }
    });

    const toggleBtn = document.getElementById("lang-toggle");
    if (toggleBtn) {
      const labelKey = "lang-label";
      toggleBtn.textContent =
        i18n[lang] && i18n[lang][labelKey]
          ? i18n[lang][labelKey]
          : lang.toUpperCase();
    }

    document.documentElement.setAttribute("lang", lang === "id" ? "id" : "en");
  }

  function initI18n() {
    applyLanguage(currentLang);

    const toggleBtn = document.getElementById("lang-toggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", function () {
        applyLanguage(currentLang === "en" ? "id" : "en");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initI18n);
  } else {
    initI18n();
  }
})();
