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
                        <button type="button" class="editor-btn" id="insertImageBtn"><i class="fas fa-image"></i></button>
                    </div>
                    <div id="editor" contenteditable="true"></div>
                    <textarea id="content" name="content" style="display: none;"></textarea>
                </div>
                <div id="uploadedImagesContainer" class="uploaded-images-container">
                    <div id="uploadedImagesList" class="uploaded-images-list"></div>
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
    const cancelBtn = document.getElementById("cancelBtn");
    const editor = document.getElementById("editor");

    // Initialize editor toolbar
    const toolbarButtons = document.querySelectorAll(".editor-toolbar button");
    toolbarButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const command = button.getAttribute("data-command");
        const value = button.getAttribute("data-value") || "";
        if (
          [
            "bold",
            "italic",
            "insertOrderedList",
            "insertUnorderedList",
            "formatBlock",
          ].includes(command)
        ) {
          const supportedCommands = [
            "bold",
            "italic",
            "insertOrderedList",
            "insertUnorderedList",
            "formatBlock",
          ];
          if (supportedCommands.includes(command)) {
            document.execCommand(command, false, value);
          }
        }
        editor.focus();
      });
    });

    // Initialize cover image upload
    const coverImageContainer = document.getElementById("coverImageContainer");
    const coverImagePreview = document.getElementById("coverImagePreview");
    const coverImagePlaceholder = document.getElementById(
      "coverImagePlaceholder"
    );
    const removeCoverImageBtn = document.getElementById("removeCoverImage");

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
      reader.onload = (e) => {
        coverImagePreview.src = e.target.result;
        coverImagePreview.style.display = "block";
        coverImagePlaceholder.style.display = "none";
        removeCoverImageBtn.style.display = "flex";
      };
      reader.readAsDataURL(file);
    }

    // Remove cover image
    removeCoverImageBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      coverImagePreview.src = "";
      coverImagePreview.style.display = "none";
      coverImagePlaceholder.style.display = "flex";
      removeCoverImageBtn.style.display = "none";
    });

    // Initialize content image upload
    const insertImageBtn = document.getElementById("insertImageBtn");
    const uploadedImagesList = document.getElementById("uploadedImagesList");

    const handleImageUpload = (file, uploadedImagesList) => {
      const reader = new FileReader();
      reader.onload = (event) =>
        createAndAppendImage(event.target.result, uploadedImagesList);
      reader.readAsDataURL(file);
    };

    const createAndAppendImage = (imageSrc, uploadedImagesList) => {
      const imageContainer = document.createElement("div");
      imageContainer.className = "uploaded-image-container";

      const imageWrapper = document.createElement("div");
      imageWrapper.className = "image-wrapper";

      const img = document.createElement("img");
      img.src = imageSrc;
      img.className = "thumbnail";
      img.addEventListener("click", () => showImageModal(imageSrc));

      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-image-btn";
      removeBtn.innerHTML = "×";
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        imageContainer.remove();
      });

      imageWrapper.appendChild(img);
      imageWrapper.appendChild(removeBtn);
      imageContainer.appendChild(imageWrapper);
      uploadedImagesList.appendChild(imageContainer);
    };

    insertImageBtn.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          handleImageUpload(file, uploadedImagesList);
        }
      };
      input.click();
    });

    // Create modal for full-size image preview
    function showImageModal(imageSrc) {
      const modal = document.createElement("div");
      modal.className = "image-modal";
      modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-image-container">
                        <img src="${imageSrc}" alt="Full size image">
                    </div>
                    <button class="close-modal">&times;</button>
                </div>
            `;

      document.body.appendChild(modal);

      // Show modal
      requestAnimationFrame(() => {
        modal.style.display = "flex";
      });

      // Close modal handlers
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.remove();
      });
      modal
        .querySelector(".close-modal")
        .addEventListener("click", () => modal.remove());
    }

    // Form submission
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {
          // Get form data
          const formData = {
            id: Date.now(),
            title: document.getElementById("title").value.trim(),
            content: editor.innerHTML.trim(),
            category: document.getElementById("category").value,
            tags: JSON.parse(
              document.getElementById("tags-hidden").value || "[]"
            ),
            coverImage: document.getElementById("coverImagePreview").src || "",
            createdAt: new Date().toISOString(),
            author: window.Clerk?.user?.fullName || "Anonymous",
          };

          // Get existing blogs
          let blogs = JSON.parse(sessionStorage.getItem("blogs") || "[]");

          // Add new blog
          blogs.push(formData);

          // Save to session storage
          sessionStorage.setItem("blogs", JSON.stringify(blogs));

          // Reset form
          form.reset();
          editor.innerHTML = "";
          document.getElementById("coverImagePreview").style.display = "none";
          document.getElementById("coverImagePlaceholder").style.display =
            "flex";
          document.getElementById("removeCoverImage").style.display = "none";
          document.getElementById("tags-list").innerHTML = "";
          document.getElementById("uploadedImagesList").innerHTML = "";
          // Form submission
          // Update UI
          document.getElementById("createBlogFormContainer").style.display =
            "none";
          document.querySelector(".navbar").style.display = "block";
          document.getElementById("content").style.display = "block";

          // Refresh blogs display
          if (typeof window.displayBlogs === "function") {
            window.displayBlogs();
          }
        } catch (error) {
          console.error("Error publishing blog:", error);
          alert("Error saving blog. Please try again.");
        }
      });
    }

    // Cancel button
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        document.getElementById("createBlogFormContainer").style.display =
          "none";
        document.querySelector(".navbar").style.display = "block";
        document.getElementById("content").style.display = "block";
      });
    }
  };

  return { template, initializeCreateBlog };
}

// Function to optimize image data
async function optimizeImageData(dataUrl) {
  return compressImage(dataUrl, 1200); // Compress image to a max width of 1200px
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
