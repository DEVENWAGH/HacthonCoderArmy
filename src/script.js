class BlogManager {
  constructor() {
    this.darkModeToggle = document.getElementById("darkModeToggle");
    this.modeIcon = document.getElementById("mode-icon");
    console.log("Dark mode toggle button:", this.darkModeToggle);
    console.log("Mode icon:", this.modeIcon);
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Create blog button
    document
      .querySelector(".create-blog-btn")
      ?.addEventListener("click", () => this.showCreateBlogForm());

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
    this.displayBlogs();
  }

  loadSavedTheme() {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      this.modeIcon.className = "text-4xl fas fa-sun dark:text-white";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.removeAttribute("data-theme");
      this.modeIcon.className = "text-4xl fas fa-moon dark:text-white";
    }
  }

  toggleDarkMode() {
    const isDark = document.documentElement.classList.contains("dark");

    if (isDark) {
      document.documentElement.classList.remove("dark");
      document.documentElement.removeAttribute("data-theme");
      this.modeIcon.className = "text-4xl fas fa-moon dark:text-white";
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      this.modeIcon.className = "text-4xl fas fa-sun dark:text-white";
      localStorage.setItem("theme", "dark");
    }
  }

  showCreateBlogForm() {
    const content = document.getElementById("content");
    const form = document.getElementById("createBlogFormContainer");

    content.style.display = "none";
    form.style.display = "block";
    form.innerHTML = this.getCreateBlogFormTemplate();
    this.initializeCreateBlogForm();
  }

  getCreateBlogFormTemplate() {
    return `
      <form class="space-y-6 p-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold dark:text-white">Create New Blog</h2>
          <button type="button" class="cancel-btn text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Cover Image Upload -->
          <div class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
            <input type="file" id="coverImage" accept="image/*" class="hidden">
            <label for="coverImage" class="cursor-pointer">
              <div class="space-y-2">
                <i class="fas fa-cloud-upload-alt text-3xl text-gray-400"></i>
                <p class="text-sm text-gray-500 dark:text-gray-400">Drop your cover image here or click to upload</p>
              </div>
            </label>
          </div>

          <!-- Title Input -->
          <input type="text" 
                 id="title" 
                 placeholder="Enter your blog title" 
                 class="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-orange-500">

          <!-- Category Selection -->
          <select id="category" class="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <option value="">Select Category</option>
            <option value="technology">Technology</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="travel">Travel</option>
            <option value="food">Food</option>
          </select>

          <!-- Rich Text Editor -->
          <div class="min-h-[300px] bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
            <div class="flex gap-2 mb-4 border-b pb-4">
              <button type="button" class="editor-btn" data-command="bold"><i class="fas fa-bold"></i></button>
              <button type="button" class="editor-btn" data-command="italic"><i class="fas fa-italic"></i></button>
              <button type="button" class="editor-btn" data-command="underline"><i class="fas fa-underline"></i></button>
              <button type="button" class="editor-btn" data-command="insertOrderedList"><i class="fas fa-list-ol"></i></button>
              <button type="button" class="editor-btn" data-command="insertUnorderedList"><i class="fas fa-list-ul"></i></button>
              <button type="button" class="editor-btn" data-command="createLink"><i class="fas fa-link"></i></button>
            </div>
            <div id="editor" class="prose-editor min-h-[250px] focus:outline-none" contenteditable="true"></div>
          </div>

          <!-- Tags Input -->
          <div class="flex flex-wrap gap-2" id="tags-container">
            <input type="text" 
                   id="tag-input" 
                   placeholder="Add tags (press Enter)"
                   class="flex-grow p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          </div>
        </div>

        <div class="flex justify-end gap-4 pt-4 border-t">
          <button type="button" 
                  class="cancel-btn px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
            Cancel
          </button>
          <button type="submit" 
                  class="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            Publish
          </button>
        </div>
      </form>
    `;
  }

  initializeCreateBlogForm() {
    const form = document.querySelector("form");
    const tagInput = document.getElementById("tag-input");
    const tagsContainer = document.getElementById("tags-container");
    const tags = new Set();

    const getElementForCommand = (command) => {
      const commandMap = {
        bold: "strong",
        italic: "em",
        underline: "u",
        insertOrderedList: "ol",
        insertUnorderedList: "ul",
      };
      return commandMap[command] || "span";
    };

    // Initialize rich text editor buttons
    const editor = document.getElementById("editor");
    editor.designMode = "on";
    document.querySelectorAll(".editor-btn").forEach((button) => {
      const command = button.getAttribute("data-command");
      button.addEventListener("click", () => {
        try {
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const element = document.createElement(
              getElementForCommand(command)
            );
            range.surroundContents(element);
          } else {
            console.warn("No text selected for formatting");
          }
        } catch (e) {
          console.warn(`Format command ${command} not supported: ${e}`);
        }
        try {
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (command === "createLink") {
              const url = prompt("Enter URL:");
              if (url) {
                const link = document.createElement("a");
                link.href = url;
                range.surroundContents(link);
              }
            } else {
              const element = document.createElement(
                getElementForCommand(command)
              );
              range.surroundContents(element);
            }
          } else {
            console.warn("No text selected for formatting");
          }
        } catch (e) {
          console.warn(`Format command ${command} not supported: ${e}`);
        }
      });
    });

    // Handle image upload
    const coverImageInput = document.getElementById("coverImage");
    if (coverImageInput) {
      coverImageInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = document.createElement("img");
            img.src = event.target.result;
            img.classList.add("w-full", "h-48", "object-cover", "rounded-lg");
            const uploadArea = e.target.parentElement;
            uploadArea.innerHTML = "";
            uploadArea.appendChild(img);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Handle tags
    tagInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const tag = tagInput.value.trim();
        if (tag && !tags.has(tag)) {
          tags.add(tag);
          const tagElement = document.createElement("span");
          tagElement.classList.add(
            "inline-flex",
            "items-center",
            "gap-1",
            "px-3",
            "py-1",
            "bg-gray-200",
            "dark:bg-gray-700",
            "rounded-full"
          );
          tagElement.innerHTML = `
            ${tag}
            <button type="button" class="text-gray-500 hover:text-gray-700">×</button>
          `;
          tagElement.querySelector("button").addEventListener("click", () => {
            tags.delete(tag);
            tagElement.remove();
          });
          tagsContainer.insertBefore(tagElement, tagInput);
          tagInput.value = "";
        }
      }
    });

    // Handle form submission with enhanced data
    form.addEventListener("submit", (e) =>
      this.handleBlogSubmit(e, Array.from(tags))
    );

    // Handle cancel
    form.querySelectorAll(".cancel-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.hideCreateBlogForm());
    });
  }

  handleBlogSubmit(e, tags) {
    e.preventDefault();

    const coverImageInput = document.getElementById("coverImage");
    const coverImage = coverImageInput.files[0]
      ? coverImageInput.parentElement.querySelector("img").src
      : null;

    const blog = {
      id: Date.now(),
      title: document.getElementById("title").value,
      category: document.getElementById("category").value,
      content: document.querySelector(".prose-editor").innerHTML,
      coverImage,
      tags,
      createdAt: new Date().toISOString(),
      author: "Anonymous",
      likes: 0,
      comments: [],
    };

    let blogs = JSON.parse(localStorage.getItem("blogs") || "[]");
    blogs.unshift(blog); // Add new blog at the beginning
    localStorage.setItem("blogs", JSON.stringify(blogs));

    this.hideCreateBlogForm();
    this.displayBlogs();
  }

  hideCreateBlogForm() {
    const content = document.getElementById("content");
    const form = document.getElementById("createBlogFormContainer");

    form.style.display = "none";
    content.style.display = "block";
  }

  displayBlogs(blogsToShow) {
    const content = document.getElementById("content");
    const blogs =
      blogsToShow || JSON.parse(localStorage.getItem("blogs") || "[]");

    if (blogs.length === 0) {
      content.innerHTML = `
        <div class="text-center py-16">
          <h2 class="text-2xl font-bold mb-2">No blogs found</h2>
          <p class="text-gray-600 dark:text-gray-400">Be the first one to create a blog!</p>
        </div>
      `;
      return;
    }

    content.innerHTML = blogs
      .map(
        (blog) => `
      <article class="blog-card bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl">
        ${
          blog.coverImage
            ? `<img src="${blog.coverImage}" class="w-full h-48 object-cover">`
            : ""
        }
        <div class="p-6">
          <div class="flex items-center gap-4 mb-4">
            <span class="px-3 py-1 text-sm bg-orange-100 text-orange-800 rounded-full">
              ${blog.category || "Uncategorized"}
            </span>
            <div class="flex items-center text-gray-500">
              <i class="fas fa-heart mr-1"></i>
              ${blog.likes}
            </div>
          </div>
          
          <h2 class="text-2xl font-bold mb-4">${blog.title}</h2>
          <div class="prose dark:prose-invert mb-4">${blog.content}</div>
          
          ${
            blog.tags && blog.tags.length > 0
              ? `
            <div class="flex flex-wrap gap-2 mb-4">
              ${blog.tags
                .map(
                  (tag) => `
                <span class="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-full">
                  ${tag}
                </span>
              `
                )
                .join("")}
            </div>
          `
              : ""
          }

          <div class="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Posted by ${blog.author}</span>
            <span>${new Date(blog.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </article>
    `
      )
      .join("");
  }

  handleSearch(query) {
    if (!query.trim()) {
      this.displayBlogs();
      return;
    }

    const blogs = JSON.parse(localStorage.getItem("blogs") || "[]");
    const results = blogs.filter((blog) => {
      const searchText = `${blog.title} ${blog.content}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    this.displayBlogs(results);
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  const blogManager = new BlogManager();
});
