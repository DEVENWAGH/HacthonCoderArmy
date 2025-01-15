import { gsap } from "gsap";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Initialize smooth scroll
const lenis = new Lenis();
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

class BlogManager {
  constructor() {
    this.initializeEventListeners();
    this.setupAnimations();
  }

  initializeEventListeners() {
    // Create blog button
    document.querySelector('.create-blog-btn')?.addEventListener('click', () => this.showCreateBlogForm());
    
    // Dark mode toggle 
    document.querySelector('.dark-mode-toggle')?.addEventListener('click', () => this.toggleDarkMode());
    
    // Search functionality
    document.getElementById('search-input')?.addEventListener('input', (e) => this.handleSearch(e.target.value));
    
    this.loadSavedTheme();
    this.displayBlogs();
  }

  loadSavedTheme() {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
      document.getElementById('mode-icon').classList.replace('fa-moon', 'fa-sun');
    }
  }

  toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    document.getElementById('mode-icon').classList.toggle('fa-moon', !isDark);
    document.getElementById('mode-icon').classList.toggle('fa-sun', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  setupAnimations() {
    gsap.fromTo('.blog-card', 
      { y: 50, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.6,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: '.blog-card',
          start: "top bottom-=100",
          toggleActions: "play none none reverse"
        }
      }
    );
  }

  showCreateBlogForm() {
    const content = document.getElementById('content');
    const form = document.getElementById('createBlogFormContainer');

    gsap.to(content, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      onComplete: () => {
        content.style.display = 'none';
        form.style.display = 'block';
        form.innerHTML = this.getCreateBlogFormTemplate();
        this.initializeCreateBlogForm();
        gsap.from(form, {
          opacity: 0,
          y: 20,
          duration: 0.3
        });
      }
    });
  }

  getCreateBlogFormTemplate() {
    return `
      <form class="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <input type="text" id="title" placeholder="Blog Title" 
               class="w-full p-3 text-xl bg-transparent border-b-2 border-gray-200 dark:border-gray-700 focus:border-orange-500">
        
        <div class="prose-editor min-h-[200px] border rounded-lg p-4" contenteditable="true">
        </div>
        
        <div class="flex justify-end gap-4">
          <button type="button" class="cancel-btn px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
            Cancel
          </button>
          <button type="submit" class="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            Publish
          </button>
        </div>
      </form>
    `;
  }

  initializeCreateBlogForm() {
    const form = document.querySelector('form');
    form.addEventListener('submit', (e) => this.handleBlogSubmit(e));
    form.querySelector('.cancel-btn').addEventListener('click', () => this.hideCreateBlogForm());
  }

  handleBlogSubmit(e) {
    e.preventDefault();
    
    const blog = {
      id: Date.now(),
      title: document.getElementById('title').value,
      content: document.querySelector('.prose-editor').innerHTML,
      createdAt: new Date().toISOString(),
      author: "Anonymous"
    };

    let blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
    blogs.push(blog);
    localStorage.setItem('blogs', JSON.stringify(blogs));

    this.hideCreateBlogForm();
    this.displayBlogs();
  }

  hideCreateBlogForm() {
    const content = document.getElementById('content');
    const form = document.getElementById('createBlogFormContainer');

    gsap.to(form, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      onComplete: () => {
        form.style.display = 'none';
        content.style.display = 'block';
        gsap.from(content, {
          opacity: 0,
          y: 20,
          duration: 0.3
        });
      }
    });
  }

  displayBlogs() {
    const content = document.getElementById('content');
    const blogs = JSON.parse(localStorage.getItem('blogs') || '[]');

    if (blogs.length === 0) {
      content.innerHTML = `
        <div class="text-center py-16">
          <h2 class="text-2xl font-bold mb-2">No blogs found</h2>
          <p class="text-gray-600 dark:text-gray-400">Be the first one to create a blog!</p>
        </div>
      `;
      return;
    }

    content.innerHTML = blogs.map(blog => `
      <article class="blog-card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all duration-200 hover:shadow-xl">
        <h2 class="text-2xl font-bold mb-4">${blog.title}</h2>
        <div class="prose dark:prose-invert">${blog.content}</div>
        <div class="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Posted by ${blog.author} on ${new Date(blog.createdAt).toLocaleDateString()}
        </div>
      </article>
    `).join('');

    this.setupAnimations();
  }

  handleSearch(query) {
    if (!query.trim()) {
      this.displayBlogs();
      return;
    }

    const blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
    const results = blogs.filter(blog => {
      const searchText = `${blog.title} ${blog.content}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    this.displayBlogs(results);
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new BlogManager();
});
