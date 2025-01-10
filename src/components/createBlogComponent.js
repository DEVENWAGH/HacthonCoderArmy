export function createBlogComponent(blogData = {}) {
  const template = `
        <div class="create-blog-container">
            <div class="logo-container">
                <a href="/"><img class="darklogo" id="logoImage" src="./logo.svg" alt="Logo"></a>
            </div>
            <form id="createBlogForm">
                <div class="form-group">
                    <div class="cover-image-container" id="coverImageContainer">
                        <div class="cover-image-placeholder" id="coverImagePlaceholder">
                            <i class="fas fa-image"></i>
                            <span>Click or drag image to add cover image</span>
                        </div>
                        <img id="coverImagePreview" class="cover-image-preview" style="display: none;">
                        <button type="button" class="remove-cover-image-btn" id="removeCoverImage" style="display: none;">×</button>
                    </div>
                </div>
                <div class="form-group">
                    <input type="text" id="title" name="title" placeholder="Blog Title" required>
                </div>
                <div class="form-group">
                    <label for="category">Category <span class="required">*</span></label>
                    <select id="category" name="category" required>
                        <option value="">Select a category</option>
                        <option value="technology">Technology</option>
                        <option value="lifestyle">Lifestyle</option>
                        <option value="travel">Travel</option>
                        <option value="food">Food</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="tags-input">Tags (up to 5)</label>
                    <div class="tags-input-container">
                        <input type="text" id="tags-input" placeholder="Type to add tags">
                        <div id="tags-list" class="tags-list"></div>
                        <div id="tag-suggestions" class="tag-suggestions"></div>
                        <input type="hidden" id="tags-hidden" name="tags" value="[]">
                    </div>
                </div>
                <div class="form-group">
                    <label for="editor">Content</label>
                    <div class="editor-toolbar">
                        <button type="button" class="editor-btn" data-command="bold"><i class="fas fa-bold"></i></button>
                        <button type="button" class="editor-btn" data-command="italic"><i class="fas fa-italic"></i></button>
                        <button type="button" class="editor-btn" data-command="insertOrderedList"><i class="fas fa-list-ol"></i></button>
                        <button type="button" class="editor-btn" data-command="insertUnorderedList"><i class="fas fa-list-ul"></i></button>
                        <button type="button" class="editor-btn" data-command="formatBlock" data-value="h2"><i class="fas fa-heading"></i></button>
                    </div>
                    <div id="editor" contenteditable="true"></div>
                    <textarea id="content" name="content" style="display: none;"></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="submit-btn">Publish Blog</button>
                    <button type="button" class="cancel-btn" id="cancelBtn">Cancel</button>
                </div>
            </form>
        </div>
    `;

  const initializeCreateBlog = () => {
    const form = document.getElementById("createBlogForm");
    const editor = document.getElementById("editor");
    
    // Get the blog ID if we're editing
    const blogId = document.getElementById('createBlogFormContainer').dataset.editBlogId;

    // Ensure form exists before adding event listeners
    if (!form || !editor) {
        console.error('Required elements not found');
        return;
    }

    // Add form submit handler
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const formData = {
                id: blogId ? parseInt(blogId) : Date.now(), // Use existing ID if editing
                title: document.getElementById("title").value.trim(),
                content: editor.innerHTML.trim(),
                category: document.getElementById("category").value,
                tags: JSON.parse(
                    document.getElementById("tags-hidden").value || "[]"
                ),
                coverImage: document.getElementById("coverImagePreview").src || "",
                createdAt: blogId ? document.getElementById('createBlogFormContainer').dataset.createdAt : new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                author: window.Clerk?.user?.fullName || "Anonymous",
            };

            // Get existing blogs
            let blogs = JSON.parse(sessionStorage.getItem('blogs') || '[]');
            
            // If editing, remove the old version
            if (blogId) {
                blogs = blogs.filter(blog => blog.id !== parseInt(blogId));
            }
            
            // Add new/updated blog
            blogs.push(formData);

            // Save to session storage
            sessionStorage.setItem('blogs', JSON.stringify(blogs));

            // Reset edit state
            document.getElementById('createBlogFormContainer').removeAttribute('data-edit-blog-id');
            document.getElementById('createBlogFormContainer').removeAttribute('data-created-at');

            // Reset form and update UI
            form.reset();
            editor.innerHTML = '';
            
            // Reset other elements
            const coverImagePreview = document.getElementById('coverImagePreview');
            const coverImagePlaceholder = document.getElementById('coverImagePlaceholder');
            const removeCoverImageBtn = document.getElementById('removeCoverImage');
            const tagsList = document.getElementById('tags-list');

            if (coverImagePreview) coverImagePreview.style.display = 'none';
            if (coverImagePlaceholder) coverImagePlaceholder.style.display = 'flex';
            if (removeCoverImageBtn) removeCoverImageBtn.style.display = 'none';
            if (tagsList) tagsList.innerHTML = '';

            // Update UI
            const createBlogFormContainer = document.getElementById('createBlogFormContainer');
            const navbar = document.querySelector('.navbar');
            const content = document.getElementById('content');

            if (createBlogFormContainer) createBlogFormContainer.style.display = 'none';
            if (navbar) navbar.style.display = 'block';
            if (content) content.style.display = 'block';

            // Refresh blogs display
            if (typeof window.displayBlogs === 'function') {
                window.displayBlogs();
            }

        } catch (error) {
            console.error("Error publishing blog:", error);
            // Remove alert and silently handle the error
            // Optionally add visual feedback to the form if needed
        }
    });

    // Initialize editor functionality
    initializeEditor(editor);
    
    // Initialize cover image upload
    const coverImageContainer = document.getElementById("coverImageContainer");

    // Handle drag and drop
    coverImageContainer.addEventListener("dragover", (e) => {
      e.preventDefault();
      coverImageContainer.classList.add("drag-over");
    });

    coverImageContainer.addEventListener("dragleave", () => {
      coverImageContainer.classList.remove("drag-over");
    });

    coverImageContainer.addEventListener("drop", (e) => {
      e.preventDefault();
      coverImageContainer.classList.remove("drag-over");
      const file = e.dataTransfer.files[0];
      if (file?.type?.startsWith("image/")) {
        handleCoverImage(file);
      }
    });

    // Handle click to upload
    coverImageContainer.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        if (e.target.files[0]) {
          handleCoverImage(e.target.files[0]);
        }
      };
      input.click();
    });

    // Handle image function
    function handleCoverImage(file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
            const optimizedImage = await optimizeImageData(e.target.result);
            const coverImagePreview = document.getElementById("coverImagePreview");
            const coverImagePlaceholder = document.getElementById("coverImagePlaceholder");
            const removeCoverImageBtn = document.getElementById("removeCoverImage");

            coverImagePreview.src = optimizedImage;
            coverImagePreview.style.display = "block";
            coverImagePlaceholder.style.display = "none";
            removeCoverImageBtn.style.display = "flex";
        } catch (error) {
            console.error("Error optimizing image:", error);
        }
    };
    reader.readAsDataURL(file);
    }

    // Remove content image related code and functions
    const insertImageBtn = document.getElementById("insertImageBtn");
    if (insertImageBtn) {
        insertImageBtn.remove(); // Remove the button completely
    }

    // Remove uploaded images container since we won't use it
    const uploadedImagesContainer = document.getElementById("uploadedImagesContainer");
    if (uploadedImagesContainer) {
        uploadedImagesContainer.remove();
    }

    // Cancel button
    const cancelBtn = document.getElementById("cancelBtn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        document.getElementById("createBlogFormContainer").style.display =
          "none";
        document.querySelector(".navbar").style.display = "block";
        document.getElementById("content").style.display = "block";
      });
    }
  };

  // Move editor initialization into a separate function
  function initializeEditor(editor) {
    if (!editor) return;

    const toolbarButtons = document.querySelectorAll(".editor-toolbar button");
    toolbarButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const command = button.getAttribute("data-command");
            const value = button.getAttribute("data-value") || "";
            if (["bold", "italic", "insertOrderedList", "insertUnorderedList", "formatBlock"].includes(command)) {
                document.execCommand(command, false, value);
            }
            editor.focus();
        });
    });

    // ... rest of editor initialization code ...
  }

  return { template, initializeCreateBlog };
}

// Enhanced image optimization function
async function optimizeImageData(dataUrl) {
    const maxWidth = 800; // Reduced from 1200
    const maxSize = 300000; // Reduced to 300KB
    const minQuality = 0.3; // Set minimum acceptable quality

    return new Promise((resolve) => {
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
            let quality = 0.7;
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Calculate dimensions
            let width = img.width;
            let height = img.height;
            
            // Scale down large images more aggressively
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            // Compress with progressive quality reduction
            let compressed = canvas.toDataURL("image/jpeg", quality);
            while (compressed.length > maxSize && quality > minQuality) {
                quality -= 0.1;
                compressed = canvas.toDataURL("image/jpeg", quality);
            }

            resolve(compressed);
        };
    });
}

// Function to compress image
function compressImage(dataUrl, maxWidth = 1200) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Use better quality settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG with 0.9 quality (higher quality)
      const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.9);

      // Check size and adjust if needed
      if (compressedDataUrl.length > 2000000) {
        // If larger than ~2MB
        // Try again with slightly lower quality
        const mediumQuality = canvas.toDataURL("image/jpeg", 0.8);
        resolve(mediumQuality);
      } else {
        resolve(compressedDataUrl);
      }
    };
  });
}

// Add storage management functions
const storageManager = {
  // Clean up old data to free space
  cleanup: () => {
    try {
      // Remove blogs older than 30 days
      const blogs = JSON.parse(sessionStorage.getItem('blogs') || '[]');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const filteredBlogs = blogs.filter(blog => 
        new Date(blog.createdAt) > thirtyDaysAgo
      );
      
      sessionStorage.setItem('blogs', JSON.stringify(filteredBlogs));
    } catch (error) {
      console.error('Storage cleanup failed:', error);
    }
  },

  // Save blog with optimized images
  saveBlog: async (blogData) => {
    try {
      // Optimize cover image if exists
      if (blogData.coverImage) {
        blogData.coverImage = await optimizeImageData(blogData.coverImage);
      }

      // Get and filter existing blogs
      let blogs = JSON.parse(sessionStorage.getItem('blogs') || '[]');
      
      // Limit to most recent 50 blogs
      blogs = blogs.slice(-49);
      blogs.push(blogData);
      
      sessionStorage.setItem('blogs', JSON.stringify(blogs));
      return true;
    } catch (error) {
      console.error('Failed to save blog:', error);
      return false;
    }
  }
};

// Add CSS for improved image layout
const style = document.createElement('style');
style.textContent = `
  .uploaded-images-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px 0;
  }

  .uploaded-image-container {
    position: relative;
    width: 150px;
    height: 150px;
  }

  .image-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 8px;
  }

  .thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .thumbnail:hover {
    transform: scale(1.05);
  }

  .remove-image-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(255, 0, 0, 0.8);
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .image-wrapper:hover .remove-image-btn {
    opacity: 1;
  }
`;

document.head.appendChild(style);

// Helper functions for form handling
function resetForm() {
  const form = document.getElementById('createBlogForm');
  const editor = document.getElementById('editor');
  form.reset();
  editor.innerHTML = '';
  document.getElementById('coverImagePreview').style.display = 'none';
  document.getElementById('coverImagePlaceholder').style.display = 'flex';
  document.getElementById('removeCoverImage').style.display = 'none';
  document.getElementById('tags-list').innerHTML = '';
}

function updateUIAfterSubmission() {
  document.getElementById('createBlogFormContainer').style.display = 'none';
  document.querySelector('.navbar').style.display = 'block';
  document.getElementById('content').style.display = 'block';
  if (typeof window.displayBlogs === 'function') {
    window.displayBlogs();
  }
}
