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
  }, 800);

  setTimeout(() => {
    introText.remove();
    // Phase 2: Lightsaber Progress Bar
    loaderContent.classList.remove("hidden");
    startProgressAnimation();
  }, 1000);

  function startProgressAnimation() {
    const totalDuration = 1200;
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
    let warpDuration = 400;

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
        }, 300);
      }
    }
    requestAnimationFrame(warpRamp);
  }
})();


// ===== NAVBAR AUTOHIDE =====
const navbar = document.querySelector(".navbar");
let lastScrollTop = 0;
let scrollUpDistance = 0;
let mouseTimeout = null;

function startMouseTimeout(scrollTop) {
  if (scrollTop > 100 && !mouseTimeout) {
    mouseTimeout = setTimeout(function () {
      navbar.classList.add("navbar-hidden");
    }, 2000);
  }
}

window.addEventListener("scroll", function () {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  if (scrollTop > lastScrollTop && scrollTop > 100) {
    navbar.classList.add("navbar-hidden");
    scrollUpDistance = 0;
  } else if (scrollTop < lastScrollTop) {
    scrollUpDistance += lastScrollTop - scrollTop;
    if (scrollUpDistance > 150 || scrollTop <= 50) {
      navbar.classList.remove("navbar-hidden");
      startMouseTimeout(scrollTop);
    }
  }
  lastScrollTop = scrollTop;
});

window.addEventListener("mousemove", function (e) {
  if (e.clientY <= 120) {
    navbar.classList.remove("navbar-hidden");
    if (mouseTimeout) {
      clearTimeout(mouseTimeout);
      mouseTimeout = null;
    }
  } else if (!navbar.classList.contains("navbar-hidden")) {
    startMouseTimeout(window.pageYOffset || document.documentElement.scrollTop);
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


// ===== I18N TRANSLATION (EN ↔ ID) =====
(function () {
  const i18n = {
    en: {
      "nav-about": "About",
      "nav-skills": "Skills",
      "nav-experience": "Experience",
      "nav-projects": "Projects",
      "nav-contact": "Contact",
      "hero-subtitle": "Junior Web Developer | Machine Learning Enthusiast",
      "hero-desc":
        "Crafting elegant, functional, and user-centric web experiences with a focus on clean code.",
      "about-label": "Discover",
      "about-title": "About Me",
      "about-lead":
        "I am a Junior Web Developer and Machine Learning Enthusiast based in Indonesia.",
      "about-text":
        "I have a strong passion for building elegant, functional, and user-centric web experiences. I prioritize writing clean, maintainable code and always strive to stay ahead of the curve by exploring the latest technologies in web development and data science.",
      "about-dl-btn": "Download CV",
      "exp-education": "Education",
      "exp-edu-degree": "Bachelor of Informatics Engineering",
      "exp-edu-desc-pre":
        "Currently pursuing a bachelor's degree. Consistently maintaining strong academic performance with a GPA of",
      "exp-experience": "Experience",
      "exp-job1-title": "Web Developer Intern",
      "exp-job1-desc1":
        'Designed and built the "Aspirasi Masyarakat" web application end-to-end (Fullstack) to facilitate citizen reporting.',
      "exp-job1-desc2":
        "Developed a responsive web interface and robust backend data management system.",
      "exp-job1-desc3":
        "Executed independent feature testing to ensure flawless data input flow and user experience.",
      "exp-job2-title": "Operations & Sales Admin",
      "exp-job2-desc1":
        "Managed and logged daily customer order data into structured formats to ensure timely service delivery.",
      "exp-job2-desc2":
        "Secured the accuracy of transaction data and service schedules to reliably minimize operational errors.",
      "exp-job2-desc3":
        "Routinely archived order data securely to facilitate precise tracking of transaction history.",
      "exp-org": "Organization",
      "exp-org-title": "Design Staff",
      "exp-org-desc":
        "Led the creation of visual assets and promotional materials to support operational structure and events within the campus chess organization.",
      "skills-title": "My Technical Toolkit",
      "proj-title": "Projects",
      "proj-subtitle": "Explore my featured projects",
      "filter-all": "All",
      "filter-web": "Web Development",
      "filter-ml": "Machine Learning",
      "filter-mobile": "Mobile App",
      "proj-aspirasi-title":
        "Plamongan Sari Village Public Aspiration System",
      "proj-aspirasi-desc":
        "A PHP and Bootstrap-based web platform to digitize and streamline public feedback for local village administration.",
      "proj-churn-title": "Churn Prediction using Logistic Regression",
      "proj-churn-desc":
        "A predictive model using Logistic Regression to analyze and identify customer retention risks.",
      "proj-mental-title": "Mental Health Detection using SVM",
      "proj-mental-desc":
        "Undergraduate thesis project using SVM and SMOTE to classify student mental health status from imbalanced data.",
      "proj-ikn-title":
        "Sentiment Analysis of IKN Discussions Using Naive Bayes",
      "proj-ikn-desc":
        "Sentiment classification of Twitter data regarding Indonesia's New Capital (IKN) using the Naive Bayes algorithm.",
      "proj-todo-title": "To Do List Website",
      "proj-todo-desc":
        "A web-based to-do list application with Google authentication, daily-reset checklists, and a weekly habit tracker.",
      "proj-spendscan-title": "SpendScan — AI-Powered Expense Tracker",
      "proj-spendscan-desc":
        "A mobile expense tracker built with React Native & Expo. Scan receipts with your camera — AI (Groq Vision) automatically reads items & prices. Features dashboard, transaction history, financial reports, and secure authentication.",
      "contact-title": "Contact Me",
      "contact-subtitle":
        "Feel free to reach out for collaborations or just a friendly hello!",
      "contact-form-title": "Send a Message",
      "contact-name-label": "Your Name",
      "contact-name-placeholder": "Enter your full name",
      "contact-email-label": "Your Email",
      "contact-email-placeholder": "name@example.com",
      "contact-msg-label": "Message",
      "contact-msg-placeholder": "Let's build something amazing...",
      "contact-send-btn": "Send Message",
      "contact-direct": "Direct Contact",
      "contact-social": "Social Media",
      "contact-autoresponse":
        "Thank you for reaching out! I have received your message and will get back to you shortly.",
      "footer-copyright":
        "\u00a9 2026 Ilham Oktian Ramadhan. All rights reserved.",
      "lang-label": "EN",
    },
    id: {
      "nav-about": "Tentang",
      "nav-skills": "Keahlian",
      "nav-experience": "Pengalaman",
      "nav-projects": "Proyek",
      "nav-contact": "Kontak",
      "hero-subtitle":
        "Junior Web Developer | Penggemar Machine Learning",
      "hero-desc":
        "Membangun pengalaman web yang elegan, fungsional, dan berpusat pada pengguna dengan fokus pada kode yang bersih.",
      "about-label": "Kenali",
      "about-title": "Tentang Saya",
      "about-lead":
        "Saya adalah Junior Web Developer dan Penggemar Machine Learning yang berbasis di Indonesia.",
      "about-text":
        "Saya memiliki passion kuat dalam membangun pengalaman web yang elegan, fungsional, dan berpusat pada pengguna. Saya mengutamakan penulisan kode yang bersih dan mudah dirawat, serta selalu berusaha mengikuti perkembangan teknologi terbaru di bidang pengembangan web dan data sains.",
      "about-dl-btn": "Unduh CV",
      "exp-education": "Pendidikan",
      "exp-edu-degree": "S1 Teknik Informatika",
      "exp-edu-desc-pre":
        "Sedang menempuh pendidikan sarjana. Konsisten mempertahankan performa akademik yang baik dengan IPK",
      "exp-experience": "Pengalaman",
      "exp-job1-title": "Web Developer Intern",
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
      "exp-org": "Organisasi",
      "exp-org-title": "Staf Desain",
      "exp-org-desc":
        "Memimpin pembuatan aset visual dan materi promosi untuk mendukung struktur operasional dan acara di organisasi catur kampus.",
      "skills-title": "Keahlian Teknis Saya",
      "proj-title": "Proyek",
      "proj-subtitle": "Jelajahi proyek-proyek pilihan saya",
      "filter-all": "Semua",
      "filter-web": "Web",
      "filter-ml": "Machine Learning",
      "filter-mobile": "Aplikasi Mobile",
      "proj-aspirasi-title":
        "Sistem Aspirasi Masyarakat Desa Plamongan Sari",
      "proj-aspirasi-desc":
        "Platform web berbasis PHP dan Bootstrap untuk mendigitalisasi dan menyederhanakan umpan balik publik bagi administrasi desa.",
      "proj-churn-title": "Prediksi Churn menggunakan Logistic Regression",
      "proj-churn-desc":
        "Model prediktif menggunakan Logistic Regression untuk menganalisis dan mengidentifikasi risiko retensi pelanggan.",
      "proj-mental-title": "Deteksi Kesehatan Mental menggunakan SVM",
      "proj-mental-desc":
        "Proyek skripsi menggunakan SVM dan SMOTE untuk mengklasifikasikan status kesehatan mental mahasiswa dari data tidak seimbang.",
      "proj-ikn-title":
        "Analisis Sentimen Diskusi IKN menggunakan Naive Bayes",
      "proj-ikn-desc":
        "Klasifikasi sentimen data Twitter mengenai Ibu Kota Negara (IKN) baru Indonesia menggunakan algoritma Naive Bayes.",
      "proj-todo-title": "Website To Do List",
      "proj-todo-desc":
        "Aplikasi to-do list berbasis web dengan autentikasi Google, daftar tugas harian, dan pelacak kebiasaan mingguan.",
      "proj-spendscan-title": "SpendScan — Pelacak Pengeluaran Berbasis AI",
      "proj-spendscan-desc":
        "Pelacak pengeluaran mobile berbasis React Native & Expo. Pindai struk dengan kamera — AI (Groq Vision) otomatis membaca item & harga. Dilengkapi dashboard, riwayat transaksi, laporan keuangan, dan autentikasi aman.",
      "contact-title": "Hubungi Saya",
      "contact-subtitle":
        "Jangan ragu untuk menghubungi saya untuk kolaborasi atau sekadar menyapa!",
      "contact-form-title": "Kirim Pesan",
      "contact-name-label": "Nama Anda",
      "contact-name-placeholder": "Masukkan nama lengkap Anda",
      "contact-email-label": "Email Anda",
      "contact-email-placeholder": "nama@contoh.com",
      "contact-msg-label": "Pesan",
      "contact-msg-placeholder":
        "Mari bangun sesuatu yang luar biasa...",
      "contact-send-btn": "Kirim Pesan",
      "contact-direct": "Kontak Langsung",
      "contact-social": "Media Sosial",
      "contact-autoresponse":
        "Terima kasih telah menghubungi! Pesan Anda telah saya terima dan akan segera saya balas.",
      "footer-copyright":
        "\u00a9 2026 Ilham Oktian Ramadhan. Hak cipta dilindungi.",
      "lang-label": "ID",
    },
  };

  let currentLang = localStorage.getItem("lang") || "en";

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (i18n[lang] && i18n[lang][key]) {
        el.textContent = i18n[lang][key];
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      if (i18n[lang] && i18n[lang][key]) {
        el.placeholder = i18n[lang][key];
      }
    });

    document.querySelectorAll("[data-i18n-value]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-value");
      if (i18n[lang] && i18n[lang][key]) {
        el.value = i18n[lang][key];
      }
    });

    var toggleBtn = document.getElementById("lang-toggle");
    if (toggleBtn) {
      var labelKey = "lang-label";
      toggleBtn.textContent = i18n[lang] && i18n[lang][labelKey] ? i18n[lang][labelKey] : lang.toUpperCase();
    }

    document.documentElement.setAttribute("lang", lang === "id" ? "id" : "en");
  }

  function initI18n() {
    applyLanguage(currentLang);

    var toggleBtn = document.getElementById("lang-toggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", function () {
        var newLang = currentLang === "en" ? "id" : "en";
        applyLanguage(newLang);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initI18n);
  } else {
    initI18n();
  }
})();
