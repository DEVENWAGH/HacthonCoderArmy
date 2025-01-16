import { Header } from './components/Header.js';
import { BlogContent } from './components/BlogContent.js';
import { Footer } from './components/Footer.js';

class App {
  constructor() {
    this.app = document.getElementById('app');
    this.darkModeToggle = null;
    this.modeIcon = null;
    this.render();
    this.initializeEventListeners();
  }

  render() {
    this.app.innerHTML = `
      ${Header()}
      ${BlogContent()}
      ${Footer()}
    `;
    
    this.darkModeToggle = document.getElementById('darkModeToggle');
    this.modeIcon = document.getElementById('mode-icon');
  }

  initializeEventListeners() {
    // Dark mode toggle
    this.darkModeToggle?.addEventListener("click", () => {
      console.log("Dark mode toggle clicked");
      this.toggleDarkMode();
    });

    // Search functionality 
    document
      .getElementById("search-input")
      ?.addEventListener("input", (e) => this.handleSearch(e.target.value));

    this.loadSavedTheme();
  }

  loadSavedTheme() {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      this.modeIcon.className = "text-2xl fas fa-sun dark:text-white";
    } else {
      document.documentElement.classList.remove("dark"); 
      document.documentElement.removeAttribute("data-theme");
      this.modeIcon.className = "text-2xl fas fa-moon dark:text-white";
    }
  }

  toggleDarkMode() {
    const isDark = document.documentElement.classList.contains("dark");

    if (isDark) {
      document.documentElement.classList.remove("dark");
      document.documentElement.removeAttribute("data-theme");
      this.modeIcon.className = "text-2xl fas fa-moon dark:text-white";
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      this.modeIcon.className = "text-2xl fas fa-sun dark:text-white";
      localStorage.setItem("theme", "dark");
    }
  }

  handleSearch(query) {
    // Add search functionality here
    console.log("Search query:", query);
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
