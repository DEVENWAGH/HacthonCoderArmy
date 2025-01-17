import { Header } from './components/Header.js';
import { BlogContent } from './components/BlogContent.js';
import { Footer } from './components/Footer.js';

class App {
  constructor() {
    this.app = document.getElementById('app');
    this.darkModeToggle = null;
    this.modeIcon = null;
    this.createBlogBtn = null;
    this.formContainer = null;
    this.blogs = JSON.parse(sessionStorage.getItem('blogs') || '[]');
    this.render();
    this.initializeEventListeners();
    this.renderBlogs(); // Render blogs from session storage on init
  }

  render() {
    this.app.innerHTML = `
      ${Header()}
      ${BlogContent()}
      ${Footer()}
    `;
    
    this.darkModeToggle = document.getElementById('darkModeToggle');
    this.modeIcon = document.getElementById('mode-icon');
    this.createBlogBtn = document.getElementById('createBlogBtn');
    this.formContainer = document.getElementById('createBlogFormContainer');
  }

  async optimizeImage(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 800;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to WebP format with 0.8 quality
          canvas.toBlob(
            (blob) => resolve(blob),
            'image/webp',
            0.8
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async handleImageUpload(file) {
    try {
      const optimizedBlob = await this.optimizeImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.getElementById('coverImagePreview');
        preview.style.backgroundImage = `url(${e.target.result})`;
        preview.classList.remove('hidden');
        document.getElementById('coverImagePlaceholder').classList.add('hidden');
      };
      reader.readAsDataURL(optimizedBlob);
      return optimizedBlob;
    } catch (error) {
      console.error('Image optimization failed:', error);
      this.showNotification('Image optimization failed', 'error');
      return null;
    }
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

    // Create blog form handlers
    this.createBlogBtn?.addEventListener('click', () => this.toggleCreateBlogForm());
    
    document.getElementById('closeFormBtn')?.addEventListener('click', () => this.toggleCreateBlogForm());
    document.getElementById('cancelBtn')?.addEventListener('click', () => this.toggleCreateBlogForm());
    
    document.getElementById('blogForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      // Handle form submission here
      const title = document.getElementById('title').value;
      const content = document.getElementById('content').value;
      console.log('Blog post:', { title, content });
      this.toggleCreateBlogForm();
    });

    // Close form when clicking outside
    this.formContainer?.addEventListener('click', (e) => {
      if (e.target === this.formContainer) {
        this.toggleCreateBlogForm();
      }
    });

    // Cover image preview - update to use label
    document.getElementById('coverImage')?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        await this.handleImageUpload(file);
      }
    });

    // Update remove cover image handler
    document.getElementById('removeImage')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const fileInput = document.getElementById('coverImage');
      const preview = document.getElementById('coverImagePreview');
      const placeholder = document.getElementById('coverImagePlaceholder');
      const label = document.querySelector('label[for="coverImage"]');
      
      // Reset file input and clear background
      fileInput.value = '';
      preview.style.backgroundImage = '';
      
      // Toggle visibility
      preview.classList.add('hidden');
      placeholder.classList.remove('hidden');
      
      // Prevent the label click event
      label.addEventListener('click', (e) => e.preventDefault(), { once: true });
    });

    // Tags handling
    let tags = new Set();
    document.getElementById('tagInput')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const tag = e.target.value.trim();
        if (tag && tags.size < 5) {
          tags.add(tag);
          this.updateTags(tags);
          e.target.value = '';
        }
      }
    });

    // Rich text formatting
    document.querySelectorAll('.format-btn')?.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const format = btn.dataset.format;
        const content = document.getElementById('content');
        content.focus();

        this.executeFormat(format);
      });
    });

    // Add content placeholder behavior
    const content = document.getElementById('content');
    if (content) {
      content.addEventListener('focus', function() {
        if (!this.textContent.trim()) {
          this.setAttribute('data-empty', 'true');
        }
      });

      content.addEventListener('blur', function() {
        if (!this.textContent.trim()) {
          this.removeAttribute('data-empty');
        }
      });

      // Set initial state
      if (!content.textContent.trim()) {
        content.removeAttribute('data-empty');
      }
    }

    // Keyboard shortcuts for formatting
    document.getElementById('content')?.addEventListener('keydown', (e) => {
      if (e.target.id === 'content') {
        const isCmdOrCtrl = e.ctrlKey || e.metaKey;
        
        if (isCmdOrCtrl) {
          let format = null;
          switch(e.key.toLowerCase()) {
            case 'b': format = 'bold'; break;
            case 'i': format = 'italic'; break;
            case 'u': format = 'underline'; break;
            case '1': format = 'number'; break;
            case '8': format = 'bullet'; break;
            case 'h': format = 'heading'; break;
          }
          
          if (format) {
            e.preventDefault();
            this.executeFormat(format);
          }
        }
      }
    });

    // Save draft functionality
    document.getElementById('saveDraftBtn')?.addEventListener('click', () => {
      const draftData = this.collectFormData();
      if (draftData.title || draftData.content) {
        localStorage.setItem('blogDraft', JSON.stringify({
          ...draftData,
          lastModified: new Date().toISOString()
        }));
        this.showNotification('Draft saved successfully!');
        document.getElementById('draftIndicator')?.classList.remove('hidden');
      }
    });

    // Load draft functionality
    document.getElementById('loadDraftBtn')?.addEventListener('click', () => {
      const draft = localStorage.getItem('blogDraft');
      if (draft) {
        this.loadDraftToForm(JSON.parse(draft));
        this.toggleCreateBlogForm();
      }
    });

    // Save as draft
    document.getElementById('saveAsDraft')?.addEventListener('click', () => {
      // Implement draft saving logic
      this.showNotification('Draft saved successfully!');
    });

    // Fix publish button functionality
    document.getElementById('publishBtn')?.addEventListener('click', async (e) => {
      e.preventDefault();
      const form = document.getElementById('blogForm');
      if (form.checkValidity()) {
        const blogData = this.collectFormData();
        if (blogData.title && blogData.content) {
          this.publishBlog(blogData);
          localStorage.removeItem('blogDraft'); // Clear draft after publishing
          document.getElementById('draftIndicator')?.classList.add('hidden');
          form.reset();
          this.toggleCreateBlogForm();
        }
      } else {
        form.reportValidity();
      }
    });

    // Check for existing draft
    const draft = localStorage.getItem('blogDraft');
    if (draft) {
      document.getElementById('draftIndicator')?.classList.remove('hidden');
    }

    this.loadSavedTheme();
  }

  executeFormat(format) {
    const content = document.getElementById('content');
    content.focus();

    switch(format) {
      case 'heading':
        // Get current selection
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        
        // Find the current block element
        const currentBlock = container.nodeType === 1 ? container : container.parentElement;
        
        // Toggle between h2 and p
        if (currentBlock.tagName === 'H2') {
          document.execCommand('formatBlock', false, 'p');
        } else {
          document.execCommand('formatBlock', false, 'h2');
        }
        break;

      case 'bullet':
        document.execCommand('insertUnorderedList', false, null);
        break;

      case 'number':
        document.execCommand('insertOrderedList', false, null);
        break;

      default:
        document.execCommand(format, false, null);
    }

    // Ensure focus stays in editor
    content.focus();
  }

  isFormatActive(tag) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;
    
    const parent = selection.getRangeAt(0).commonAncestorContainer.parentNode;
    return parent.tagName.toLowerCase() === tag;
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

  toggleCreateBlogForm() {
    const nav = document.querySelector('nav');
    const formContainer = this.formContainer;
    
    if (formContainer?.classList.contains('hidden')) {
      // Opening form
      formContainer.classList.remove('hidden');
      nav?.classList.add('hidden');
      // Allow scrolling within the form container
      document.body.style.overflow = 'hidden';
      const contentArea = formContainer.querySelector('.overflow-y-auto');
      if (contentArea) {
        contentArea.style.height = 'calc(100vh - 144px)'; // 24px nav + 96px footer
      }
    } else {
      // Closing form
      formContainer?.classList.add('hidden');
      nav?.classList.remove('hidden');
      document.body.style.overflow = 'auto';
      
      // Clear form when closing if no draft is saved
      if (!localStorage.getItem('blogDraft')) {
        this.clearForm();
      }
    }
  }

  updateTags(tags) {
    const container = document.getElementById('tagContainer');
    container.innerHTML = Array.from(tags).map(tag => `
      <span class="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 rounded">
        ${tag}
        <button type="button" class="remove-tag" data-tag="${tag}">
          <i class="fas fa-times"></i>
        </button>
      </span>
    `).join('');

    // Add remove tag handlers
    container.querySelectorAll('.remove-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        tags.delete(btn.dataset.tag);
        this.updateTags(tags);
      });
    });
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
    notification.className = `fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 translate-y-0`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('translate-y-full');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  collectFormData() {
    const backgroundImage = document.getElementById('coverImagePreview').style.backgroundImage;
    // Extract the actual URL from the backgroundImage string
    const imageUrl = backgroundImage.replace(/^url\(['"](.+)['"]\)$/, '$1');
    
    return {
      title: document.getElementById('title').value,
      content: document.getElementById('content').innerHTML,
      category: document.getElementById('category').value,
      tags: Array.from(document.querySelectorAll('#tagContainer span')).map(span => 
        span.textContent.trim().replace(/×$/, '')),
      coverImage: imageUrl, // Store just the URL
      timestamp: new Date().toISOString()
    };
  }

  loadDraftToForm(draft) {
    this.clearForm(); // Clear form before loading draft
    document.getElementById('title').value = draft.title || '';
    document.getElementById('content').innerHTML = draft.content || '';
    document.getElementById('category').value = draft.category || '';
    if (draft.coverImage) {
      const preview = document.getElementById('coverImagePreview');
      preview.style.backgroundImage = draft.coverImage;
      preview.classList.remove('hidden');
      document.getElementById('coverImagePlaceholder').classList.add('hidden');
    }
    if (draft.tags?.length) {
      const tags = new Set(draft.tags);
      this.updateTags(tags);
    }
  }

  publishBlog(blogData) {
    const blogWithMetadata = {
      ...blogData,
      id: Date.now().toString(),
      publishedAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    this.blogs.unshift(blogWithMetadata);
    sessionStorage.setItem('blogs', JSON.stringify(this.blogs));
    this.renderBlogs();
    this.showNotification('Blog published successfully!');
  }

  renderBlogs() {
    const blogsContainer = document.getElementById('blogsList');
    if (!blogsContainer) return;

    blogsContainer.innerHTML = this.blogs.map(blog => `
      <article class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        ${blog.coverImage ? `
          <div class="h-56 bg-cover bg-center" 
               style="background-image: url('${blog.coverImage}')"
               role="img" 
               aria-label="Cover image for ${blog.title}">
          </div>
        ` : ''}
        <div class="p-6 space-y-4">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">${blog.title}</h2>
          <div class="prose dark:prose-invert line-clamp-4 text-gray-600 dark:text-gray-300">
            ${blog.content}
          </div>
          <div class="flex flex-wrap gap-2">
            ${blog.tags.map(tag => `
              <span class="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 rounded-full text-sm">
                ${tag}
              </span>
            `).join('')}
          </div>
          <div class="text-sm text-gray-500">
            Published ${new Date(blog.publishedAt).toLocaleDateString()}
          </div>
        </div>
      </article>
    `).join('');
  }

  stripHtml(html) {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  clearForm() {
    const form = document.getElementById('blogForm');
    form.reset();
    document.getElementById('content').innerHTML = '';
    const preview = document.getElementById('coverImagePreview');
    preview.style.backgroundImage = '';
    preview.classList.add('hidden');
    document.getElementById('coverImagePlaceholder').classList.remove('hidden');
    document.getElementById('tagContainer').innerHTML = '';
    // Reset any stored tags
    this.currentTags = new Set();
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
