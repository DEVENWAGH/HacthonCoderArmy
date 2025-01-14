import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function footerComponent() {
  const template = `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-content">
          <p>&copy; <span class="year">2024</span> <span class="brand">EchoBlogs</span>. <span class="rights">All rights reserved</span>.</p>
        </div>
      </div>
    </footer>
  `;

  const initializeFooter = () => {
    const footer = document.querySelector(".footer-container");
    const year = footer.querySelector(".year");
    const brand = footer.querySelector(".brand");
    const rights = footer.querySelector(".rights");

    // Initial state
    gsap.set([footer, year, brand, rights], {
      opacity: 0,
      y: 20,
    });

    gsap.set(footer, {
      borderTopWidth: "1px",
      borderTopStyle: "solid",
      borderTopColor: "transparent",
    });

    // Create main timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: footer,
        start: "top bottom",
        end: "top center",
        toggleActions: "play none none reverse",
      },
    });

    // Animate footer in with staggered text
    tl.to(footer, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
    }).to(
      [year, brand, rights],
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: "back.out(1.2)",
        onStart: () => {
          gsap.fromTo(
            [year, brand, rights],
            {
              scale: 0.8,
              rotation: -10,
            },
            {
              scale: 1,
              rotation: 0,
              duration: 0.6,
              stagger: 0.2,
              ease: "back.out(1.7)",
            }
          );
        },
      },
      "-=0.5"
    );

    // Hover animation for brand name
    brand.addEventListener("mouseenter", () => {
      gsap.to(brand, {
        scale: 1.1,
        color: "#ff8c00",
        duration: 0.3,
        ease: "power2.out",
      });
    });

    brand.addEventListener("mouseleave", () => {
      gsap.to(brand, {
        scale: 1,
        color: document.body.classList.contains("dark-mode")
          ? "#ffffff"
          : "#000000",
        duration: 0.3,
        ease: "power2.out",
      });
    });

    // Update footer theme animation with enhanced transitions
    const updateFooterTheme = () => {
      const isDarkMode = document.body.classList.contains("dark-mode");
      const timeline = gsap.timeline();

      timeline
        .to(footer, {
          backgroundColor: isDarkMode ? "#000000" : "#ffffff",
          color: isDarkMode ? "#ffffff" : "#000000",
          duration: 0.8,
          ease: "power2.inOut",
        })
        .to(
          footer,
          {
            borderTopColor: isDarkMode
              ? "rgba(255,255,255,0.15)"
              : "rgba(0,0,0,0.15)",
            duration: 0.5,
            ease: "power2.inOut",
          },
          "-=0.6"
        )
        .to(
          footer,
          {
            boxShadow: isDarkMode
              ? "0 -2px 10px rgba(255,255,255,0.07)"
              : "0 -2px 10px rgba(0,0,0,0.07)",
            duration: 0.7,
            ease: "power2.inOut",
          },
          "-=0.4"
        );
    };

    // Initial theme setup
    updateFooterTheme();

    // Listen for theme changes
    document.addEventListener("click", (e) => {
      if (e.target.closest(".dark-mode-toggle")) {
        updateFooterTheme();
      }
    });

    // Enhanced scroll animation with smoother transitions
    let lastScrollPosition = 0;
    let scrollTimeout;

    window.addEventListener("scroll", () => {
      if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
      }

      scrollTimeout = window.requestAnimationFrame(() => {
        const currentScrollPosition = window.scrollY;
        if (currentScrollPosition > lastScrollPosition) {
          // Scrolling down - smooth hide
          gsap.to(footer, {
            y: 15,
            opacity: 0.9,
            duration: 0.4,
            ease: "power3.out",
          });
        } else {
          // Scrolling up - smooth show
          gsap.to(footer, {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          });
        }

        lastScrollPosition = currentScrollPosition;
      });
    });

    // Add periodic subtle pulse animation to brand
    gsap.to(brand, {
      scale: 1.05,
      duration: 1.5,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1,
    });
  };

  return { template, initializeFooter };
}
