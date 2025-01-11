import { createBlogComponent } from "./createBlogComponent.js";
import { gsap } from 'gsap';

let navbarInitialized = false; // Add this flag at the top level

export function navbarComponent() {
  const template = `
        <nav class="navbar">
            <div class="navbar-container">
                <a href="/"><img class="logo" src="./logo.svg" alt="Logo" /></a>
                <div class="search-bar">
                    <input type="text" placeholder="Search posts..." id="search-input" />
                    <i class="fas fa-search" id="search-icon"></i>
                </div>
                <ul class="nav-links">
                    <li><a href="/blogs">Blog</a></li>
                    <li>
                        <button class="create-blog-btn" id="loadCreateBlogBtn">
                            Create Blog
                        </button>
                    </li>
                </ul>
                <div class="user-profile">
                    <div id="user-button"></div>
                </div>
                <div class="dark-mode-toggle">
                    <i id="mode-icon" class="fas fa-moon"></i>
                </div>
            </div>
        </nav>
    `;

  const initializeNavbar = async () => {
    if (navbarInitialized) return; // Skip if already initialized

    // Mount Clerk user button
    const userButtonDiv = document.getElementById("user-button");
    if (userButtonDiv) {
      Clerk.mountUserButton(userButtonDiv);
    }

    // Dark mode toggle
    const darkModeToggle = document.querySelector(".dark-mode-toggle");
    if (darkModeToggle) {
      darkModeToggle.addEventListener("click", toggleDarkMode);
    }

    // Set initial theme
    setInitialTheme();

    // Create blog button
    const createBlogBtn = document.getElementById("loadCreateBlogBtn");
    if (createBlogBtn) {
      createBlogBtn.addEventListener("click", async () => {
        try {
          const createBlogFormContainer = document.getElementById(
            "createBlogFormContainer"
          );
          if (createBlogFormContainer) {
            // Hide navbar and content
            const navbar = document.querySelector(".navbar");
            const content = document.getElementById("content");

            navbar.style.display = "none";
            content.style.display = "none";

            // Initialize create blog
            const { template, initializeCreateBlog } = createBlogComponent();
            createBlogFormContainer.innerHTML = template;
            createBlogFormContainer.style.display = "block";

            // Initialize blog form
            initializeCreateBlog();

            // Initialize editor is now part of createBlogComponent
            if (document.getElementById("editor")) {
              initializeTagsInput();
            }
          }
        } catch (error) {
          console.error("Error loading create blog component:", error);
        }
      });
    }

    const runAnimation = () => {
        // Set initial states
        gsap.set(".navbar", {
            background: "transparent"  // Start with transparent background
        });
        
        gsap.set(".navbar-container", { 
            opacity: 0
        });

        // Set specific initial positions
        gsap.set(".logo", {
            opacity: 0,
            x: -100  // Start from left
        });
        
        gsap.set(".search-bar", {
            opacity: 0,
            y: -50   // Start from top
        });
        
        gsap.set(".nav-links li", {
            opacity: 0,
            y: -50   // Start from top
        });
        
        gsap.set([".user-profile", ".dark-mode-toggle"], {
            opacity: 0,
            y: -50   // Start from top
        });

        // Animation timeline
        const tl = gsap.timeline({
            defaults: { 
                ease: "power3.out",
                duration: 1  // Increased base duration
            },
            onComplete: () => {
                navbarInitialized = true;
            }
        });

        // Add background animation first
        tl.to(".navbar", {
            duration: 0.8,
            background: "#000000",
            ease: "power2.inOut"
        })
        .to(".navbar-container", {
            opacity: 1,
            duration: 0.5
        })
        .to(".logo", {
            x: 0,
            opacity: 1,
            duration: 1.2,
            clearProps: "transform"
        }, "-=0.3")
        .to(".search-bar", {
            y: 0,
            opacity: 1,
            duration: 1,
            clearProps: "transform"
        }, "-=0.8")  // Overlap with logo animation
        .to(".nav-links li", {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            clearProps: "transform"
        }, "-=0.6")  // Overlap with search bar
        .to([".user-profile", ".dark-mode-toggle"], {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            clearProps: "transform"
        }, "-=0.4");  // Overlap with nav links
    };

    // Run animation only once
    if (document.readyState === 'complete') {
        runAnimation();
    } else {
        window.addEventListener('load', runAnimation, { once: true });
    }

    // Simple hover effect for logo
    const logo = document.querySelector(".logo");
    if (logo) {
        logo.addEventListener("mouseenter", () => {
            gsap.to(".logo", {
                scale: 1.05,
                duration: 0.2,
                overwrite: true
            });
        });

        logo.addEventListener("mouseleave", () => {
            gsap.to(".logo", {
                scale: 1,
                duration: 0.2,
                overwrite: true
            });
        });
    }
  };

  // Function to toggle between dark and light mode
  function toggleDarkMode() {
    const body = document.body;
    const modeIcon = document.getElementById("mode-icon");

    // Toggle dark mode and light mode classes on body
    if (body.classList.contains("dark-mode")) {
      // Switching to light mode
      body.classList.remove("dark-mode");
      modeIcon.classList.remove("fa-sun");
      modeIcon.classList.add("fa-moon");
      localStorage.setItem("theme", "light");
    } else {
      // Switching to dark mode
      body.classList.add("dark-mode");
      modeIcon.classList.remove("fa-moon");
      modeIcon.classList.add("fa-sun");
      localStorage.setItem("theme", "dark");
    }
  }

  // Function to set the initial theme based on local storage
  function setInitialTheme() {
    const savedTheme = localStorage.getItem("theme") || "light"; // Default to light theme
    const body = document.body;
    const modeIcon = document.getElementById("mode-icon");

    if (savedTheme === "dark") {
      body.classList.add("dark-mode");
      modeIcon.classList.remove("fa-moon");
      modeIcon.classList.add("fa-sun");
    } else {
      body.classList.remove("dark-mode");
      modeIcon.classList.remove("fa-sun");
      modeIcon.classList.add("fa-moon");
    }
  }

  return { template, initializeNavbar };
}
