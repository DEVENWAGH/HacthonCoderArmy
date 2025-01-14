import { createBlogComponent } from "./createBlogComponent.js";
import { gsap } from "gsap";

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
        <button class="create-blog-btn" id="loadCreateBlogBtn">
          Create Blog
        </button>
        <div class="dark-mode-toggle">
          <i id="mode-icon" class="fas fa-moon"></i>
        </div>
      </div>
    </nav>
  `;

  const initializeNavbar = async () => {
    if (navbarInitialized) return;

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
          }
        } catch (error) {
          console.error("Error loading create blog component:", error);
        }
      });
    }

    // Add search functionality
    const searchInput = document.getElementById("search-input");
    const searchIcon = document.getElementById("search-icon");

    if (searchInput && searchIcon) {
      // Handle Enter key press
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          performSearch(searchInput.value);
        }
      });

      // Handle search icon click
      searchIcon.addEventListener("click", () => {
        performSearch(searchInput.value);
      });
    }

    // Function to perform search
    function performSearch(query) {
      if (!query.trim()) {
        displayBlogs(); // Show all blogs if search is empty
        return;
      }

      const blogs = JSON.parse(sessionStorage.getItem("blogs") || "[]");
      const filteredBlogs = blogs.filter((blog) => {
        const lowerQuery = query.toLowerCase();
        return (
          blog.title.toLowerCase().includes(lowerQuery) ||
          blog.category.toLowerCase().includes(lowerQuery) ||
          blog.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
      });

      displayBlogs(filteredBlogs); // Display filtered blogs
    }

    const runAnimation = () => {
      // Set initial states
      gsap.set(".navbar", {
        background: "transparent", // Start with transparent background
      });

      gsap.set(".navbar-container", {
        opacity: 0,
      });

      // Set specific initial positions
      gsap.set(".logo", {
        opacity: 0,
        x: -100, // Start from left
      });

      gsap.set(".search-bar", {
        opacity: 0,
        y: -50, // Start from top
      });
      if (window.innerWidth <= 768) {
        gsap.set([".user-profile", ".dark-mode-toggle"], {
          opacity: 0,
          y: -100,
        });
      } else {
        gsap.set([".user-profile", ".dark-mode-toggle"], {
          opacity: 0,
          y: -50,
        });
      }
      // Animation timeline
      const tl = gsap.timeline({
        defaults: {
          ease: "power3.out",
          duration: 1,
        },
        onComplete: () => {
          navbarInitialized = true;
        },
      });

      // Add background animation first
      tl.to(".navbar", {
        duration: 0.2,
        background: "#000000",
        ease: "power2.Out",
      })
        .to(".navbar-container", {
          opacity: 1,
          duration: 0.5,
        })
        .to(
          ".logo",
          {
            x: 0,
            opacity: 1,
            duration: 1.2,
            clearProps: "transform",
          },
          "-=0.3"
        )
        .to(
          ".search-bar",
          {
            y: 0,
            opacity: 1,
            duration: 1,
            clearProps: "transform",
          }
        )
        if (window.innerWidth <= 768) {
          tl.to([".user-profile", ".dark-mode-toggle"], {
            y: -60,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            clearProps: "transform",
          });
        } else {
          tl.to(
            [".user-profile", ".dark-mode-toggle"],
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.2,
              clearProps: "transform",
            },
            "-=0.4"
          );
        }
    };

    // Run animation only once
    if (document.readyState === "complete") {
      runAnimation();
    } else {
      window.addEventListener("load", runAnimation, { once: true });
    }

    // Simple hover effect for logo
    const logo = document.querySelector(".logo");
    if (logo) {
      logo.addEventListener("mouseenter", () => {
        gsap.to(".logo", {
          scale: 1.05,
          duration: 0.2,
          overwrite: true,
        });
      });

      logo.addEventListener("mouseleave", () => {
        gsap.to(".logo", {
          scale: 1,
          duration: 0.2,
          overwrite: true,
        });
      });
    }
  };

  // Function to toggle between dark and light mode
  function toggleDarkMode() {
    const body = document.body;
    const modeIcon = document.getElementById("mode-icon");
    const navbar = document.querySelector(".navbar");
    const createBlogContainer = document.querySelector(
      ".create-blog-container"
    );

    // Create animation timeline
    const tl = gsap.timeline({
      defaults: { duration: 0.5, ease: "power2.inOut" },
    });

    if (body.classList.contains("dark-mode")) {
      // Switching to light mode
      tl.to("body", {
        backgroundColor: "#ffffff",
        color: "#000000",
        duration: 0.5,
      })
        .to(
          ".blog-card",
          {
            backgroundColor: "#ffffff",
            color: "#000000",
            stagger: 0.05,
            duration: 0.3,
          },
          "-=0.3"
        )
        .to(
          modeIcon,
          {
            rotation: 180,
            duration: 0.5,
          },
          0
        );

      body.classList.remove("dark-mode");
      modeIcon.classList.remove("fa-sun");
      modeIcon.classList.add("fa-moon");
      localStorage.setItem("theme", "light");
    } else {
      // Switching to dark mode
      tl.to("body", {
        backgroundColor: "#121212",
        color: "#ffffff",
        duration: 0.5,
      })
        .to(
          navbar,
          {
            backgroundColor: "#000000",
            duration: 0.3,
          },
          "-=0.3"
        )
        .to(
          ".blog-card",
          {
            backgroundColor: "#1e1e1e",
            color: "#ffffff",
            stagger: 0.05,
            duration: 0.3,
          },
          "-=0.3"
        )
        .to(
          modeIcon,
          {
            rotation: -180,
            duration: 0.5,
          },
          0
        );

      body.classList.add("dark-mode");
      modeIcon.classList.remove("fa-moon");
      modeIcon.classList.add("fa-sun");
      localStorage.setItem("theme", "dark");
    }

    // Animate specific elements based on current page
    if (createBlogContainer) {
      tl.to(
        createBlogContainer,
        {
          backgroundColor: body.classList.contains("dark-mode")
            ? "#000000"
            : "#ffffff",
          color: body.classList.contains("dark-mode") ? "#ffffff" : "#000000",
          duration: 0.3,
        },
        "-=0.3"
      );
    }

    // Reset icon rotation after animation
    tl.set(modeIcon, { clearProps: "rotation" });
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

      // Initial dark mode styles without animation
      gsap.set("body", { backgroundColor: "#121212", color: "#ffffff" });
      gsap.set(".navbar", { backgroundColor: "#000000" });
      gsap.set(".blog-card", { backgroundColor: "#1e1e1e", color: "#ffffff" });
    } else {
      body.classList.remove("dark-mode");
      modeIcon.classList.remove("fa-sun");
      modeIcon.classList.add("fa-moon");

      // Initial light mode styles without animation
      gsap.set("body", { backgroundColor: "#ffffff", color: "#000000" });
      gsap.set(".navbar", { backgroundColor: "#ffffff" });
      gsap.set(".blog-card", { backgroundColor: "#ffffff", color: "#000000" });
    }
  }

  return { template, initializeNavbar };
}
