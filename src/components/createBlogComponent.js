import { gsap } from "gsap";

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
                        <input type="hidden" id="tags-hidden" name="tags" value="[]">
                    </div>
                </div>
                <div class="form-group">
                    <label for="editor">Content</label>
                    <div class="editor-toolbar">
                        <button type="button" class="editor-btn" data-command="bold" title="Bold (Ctrl+B)"><i class="fas fa-bold"></i></button>
                        <button type="button" class="editor-btn" data-command="italic" title="Italic (Ctrl+I)"><i class="fas fa-italic"></i></button>
                        <button type="button" class="editor-btn" data-command="underline" title="Underline (Ctrl+U)"><i class="fas fa-underline"></i></button>
                        <button type="button" class="editor-btn" data-command="insertOrderedList" title="Numbered List (Ctrl+1)"><i class="fas fa-list-ol"></i></button>
                        <button type="button" class="editor-btn" data-command="insertUnorderedList" title="Bullet List (Ctrl+8)"><i class="fas fa-list-ul"></i></button>
                        <button type="button" class="editor-btn" data-command="formatBlock" data-value="h2" title="Toggle Heading (Ctrl+H)"><i class="fas fa-heading"></i></button>
                        <button type="button" class="editor-btn save-draft-btn" id="saveDraftBtn"><i class="fas fa-save"></i> Save Draft</button>
                    </div>
                    <div id="editor" contenteditable="true" data-placeholder="What's on your mind?"></div>
                    <textarea id="content" name="content" style="display: none;"></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="submit-btn">Publish Blog</button>
                    <button type="button" class="cancel-btn" id="cancelBtn">Cancel</button>
                </div>
            </form>
        </div>
    `;

  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
      #editor[contenteditable=true]:empty:before {
          content: attr(data-placeholder);
          color: #aaa;
          font-style: italic;
      }
  `;
  document.head.appendChild(styleSheet);

  const initializeCreateBlog = () => {
    const form = document.getElementById("createBlogForm");
    const editor = document.getElementById("editor");
    const formContainer = document.getElementById("createBlogFormContainer");
    const isDarkMode = document.body.classList.contains("dark-mode");
    const initialLogoSrc = isDarkMode ? "./logo.svg" : "./dark-logo.svg";
    const logoImage = document.getElementById("logoImage");
    if (logoImage) {
      logoImage.src = initialLogoSrc;
    }
    // Set initial states for animation
    gsap.set(formContainer, {
      opacity: 0,
      y: 50,
    });

    gsap.set(".form-group", {
      opacity: 0,
      y: 20,
    });

    gsap.set(".editor-toolbar button", {
      opacity: 0,
      scale: 0.8,
    });

    gsap.set("#editor", {
      opacity: 0,
      y: 20,
    });

    gsap.set(".form-actions button", {
      opacity: 0,
      y: 20,
    });

    // Entrance animation timeline
    const tl = gsap.timeline();

    tl.to(formContainer, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power3.out",
    })
      .to(
        ".form-group",
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.2"
      )
      .to(
        ".editor-toolbar button",
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          stagger: 0.05,
          ease: "back.out(1.7)",
        },
        "-=0.2"
      )
      .to(
        "#editor",
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.2"
      )
      .to(
        ".form-actions button",
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.2"
      );

    // Prevent form submission on Enter key
    form.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && e.target.id === "tags-input") {
        e.preventDefault();
      }
    });

    // Get the blog ID if we're editing
    const blogId = document.getElementById("createBlogFormContainer").dataset
      .editBlogId;

    // Ensure form exists before adding event listeners
    if (!form || !editor) {
      console.error("Required elements not found");
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
          createdAt: blogId
            ? document.getElementById("createBlogFormContainer").dataset
                .createdAt
            : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: "Anonymous",
        };

        // Get existing blogs
        let blogs = JSON.parse(sessionStorage.getItem("blogs") || "[]");

        // If editing, remove the old version
        if (blogId) {
          blogs = blogs.filter((blog) => blog.id !== parseInt(blogId));
        }

        // Add new/updated blog
        blogs.push(formData);

        // Save to session storage
        sessionStorage.setItem("blogs", JSON.stringify(blogs));

        // Reset edit state
        document
          .getElementById("createBlogFormContainer")
          .removeAttribute("data-edit-blog-id");
        document
          .getElementById("createBlogFormContainer")
          .removeAttribute("data-created-at");

        // Reset form and update UI
        form.reset();
        editor.innerHTML = "";

        // Reset other elements
        const coverImagePreview = document.getElementById("coverImagePreview");
        const coverImagePlaceholder = document.getElementById(
          "coverImagePlaceholder"
        );
        const removeCoverImageBtn = document.getElementById("removeCoverImage");
        const tagsList = document.getElementById("tags-list");

        if (coverImagePreview) coverImagePreview.style.display = "none";
        if (coverImagePlaceholder) coverImagePlaceholder.style.display = "flex";
        if (removeCoverImageBtn) removeCoverImageBtn.style.display = "none";
        if (tagsList) tagsList.innerHTML = "";

        // Update UI
        const createBlogFormContainer = document.getElementById(
          "createBlogFormContainer"
        );
        const navbar = document.querySelector(".navbar");
        const content = document.getElementById("content");

        if (createBlogFormContainer)
          createBlogFormContainer.style.display = "none";
        if (navbar) navbar.style.display = "block";
        if (content) content.style.display = "block";

        // Exit animation
        gsap.to(formContainer, {
          opacity: 0,
          y: -50,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: () => {
            formContainer.style.display = "none";
            document.querySelector(".navbar").style.display = "block";
            document.getElementById("content").style.display = "block";

            // Animate navbar and content back in
            gsap.from([".navbar", "#content"], {
              opacity: 0,
              y: -20,
              duration: 0.5,
              stagger: 0.1,
              ease: "power2.out",
              onComplete: () => {
                // Only call displayBlogs once here, remove other calls
                if (typeof window.displayBlogs === "function") {
                  window.displayBlogs();
                }
              },
            });
          },
        });

        // After successfully saving the blog, clear the draft
        localStorage.removeItem("blog-draft");
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
    coverImageContainer.addEventListener("click", (e) => {
      // Check if click target is the remove button or its children
      if (e.target.closest(".remove-cover-image-btn")) {
        return; // Exit if remove button was clicked
      }

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

    // Add separate handler for remove button
    if (removeCoverImageBtn) {
      removeCoverImageBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent event from bubbling up to container
        const coverImagePreview = document.getElementById("coverImagePreview");
        const coverImagePlaceholder = document.getElementById(
          "coverImagePlaceholder"
        );

        if (coverImagePreview) {
          coverImagePreview.src = "";
          coverImagePreview.style.display = "none";
        }
        if (coverImagePlaceholder) {
          coverImagePlaceholder.style.display = "flex";
        }
        removeCoverImageBtn.style.display = "none";
      });
    }

    // Remove content image related code and functions
    const insertImageBtn = document.getElementById("insertImageBtn");
    if (insertImageBtn) {
      insertImageBtn.remove(); // Remove the button completely
    }

    // Remove uploaded images container since we won't use it
    const uploadedImagesContainer = document.getElementById(
      "uploadedImagesContainer"
    );
    if (uploadedImagesContainer) {
      uploadedImagesContainer.remove();
    }

    // Cancel button
    const cancelBtn = document.getElementById("cancelBtn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        const hasDraft = localStorage.getItem("blog-draft");

        if (!hasDraft) {
          // No draft saved - check for unsaved changes
          const hasContent = hasFormContent();
          if (hasContent) {
            if (
              confirm(
                "Are you sure you want to leave? All unsaved changes will be lost."
              )
            ) {
              closeForm();
            }
          } else {
            closeForm();
          }
        } else {
          // Draft exists - just close without warning
          closeForm();
        }
      });
    }

    // Helper function to check if form has content
    function hasFormContent() {
      return (
        document.getElementById("title").value ||
        editor.innerHTML ||
        document.getElementById("category").value ||
        JSON.parse(document.getElementById("tags-hidden").value || "[]")
          .length > 0 ||
        document.getElementById("coverImagePreview").src
      );
    }

    // Helper function to close form without clearing draft
    function closeForm() {
      gsap.to(formContainer, {
        opacity: 0,
        y: -50,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          formContainer.style.display = "none";
          document.querySelector(".navbar").style.display = "block";
          document.getElementById("content").style.display = "block";

          // Animate navbar and content back in
          gsap.from([".navbar", "#content"], {
            opacity: 0,
            y: -20,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
          });
        },
      });
    }

    // Initialize tags input with correct scope
    const tagsInput = document.getElementById("tags-input");
    const tagsList = document.getElementById("tags-list");
    const tagsHidden = document.getElementById("tags-hidden");
    let tags = [];

    if (tagsInput) {
      tagsInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && tagsInput.value.trim()) {
          e.preventDefault();
          const tag = tagsInput.value
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "");
          if (tag && !tags.includes(tag) && tags.length < 5) {
            tags.push(tag);
            updateTags();
            tagsInput.value = "";
          }
        }
      });
    }

    function updateTags() {
      tagsHidden.value = JSON.stringify(tags);
      tagsList.innerHTML = tags
        .map(
          (tag) => `
        <span class="tag-item">
          <i class="fas fa-hashtag"></i>${tag}
          <span class="tag-remove" data-tag="${tag}">×</span>
        </span>
      `
        )
        .join("");

      // Add click handlers for remove buttons
      document.querySelectorAll(".tag-remove").forEach((button) => {
        button.addEventListener("click", (e) => {
          const tagToRemove = e.target.dataset.tag;
          tags = tags.filter((t) => t !== tagToRemove);
          updateTags();
        });
      });

      // Animate new tag
      gsap.from(tagsList.lastElementChild, {
        opacity: 0,
        scale: 0.5,
        duration: 0.3,
        ease: "back.out(1.7)",
      });
    }
  };

  // Move editor initialization into a separate function
  function initializeEditor(editor) {
    if (!editor) return;

    // Add keyboard shortcut handler
    editor.addEventListener("keydown", (e) => {
      // Check if ctrl or cmd key is pressed
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "b": // Bold
            e.preventDefault();
            document.execCommand("bold", false, null);
            updateButtonStates();
            break;
          case "i": // Italic
            e.preventDefault();
            document.execCommand("italic", false, null);
            updateButtonStates();
            break;
          case "u": // Underline
            e.preventDefault();
            document.execCommand("underline", false, null);
            updateButtonStates();
            break;
          case "1": // Ordered List
            e.preventDefault();
            document.execCommand("insertOrderedList", false, null);
            updateButtonStates();
            break;
          case "8": // Unordered List (Ctrl + 8 for bullet point)
            e.preventDefault();
            document.execCommand("insertUnorderedList", false, null);
            updateButtonStates();
            break;
          case "h": {
            // Heading
            e.preventDefault();
            const selection = window.getSelection();
            const closestBlock = selection.focusNode?.parentElement;
            const isHeading = closestBlock?.tagName?.toLowerCase() === "h2";
            document.execCommand("formatBlock", false, isHeading ? "p" : "h2");
            updateButtonStates();
            break;
          }
        }
      }
    });

    // Add global keyboard shortcut for saving draft
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveDraft();
      }
    });

    // Add toolbar buttons click handlers
    const commands = [
      "bold",
      "italic",
      "underline",
      "insertOrderedList",
      "insertUnorderedList",
      "formatBlock",
    ];

    const toolbarButtons = document.querySelectorAll(".editor-toolbar button");

    toolbarButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const command = button.getAttribute("data-command");
        const value = button.getAttribute("data-value") || "";

        if (commands.includes(command)) {
          if (command === "formatBlock") {
            const isHeading =
              document.queryCommandValue("formatBlock") === "h2";
            document.execCommand("formatBlock", false, isHeading ? "p" : "h2");
            button.classList.toggle("active", !isHeading);
          } else {
            document.execCommand(command, false, value);
            button.classList.toggle(
              "active",
              document.queryCommandState(command)
            );
          }
        }
        editor.focus();
      });
    });

    // Update button states
    function updateButtonStates() {
      toolbarButtons.forEach((button) => {
        const command = button.getAttribute("data-command");
        if (command === "formatBlock") {
          const isHeading = document.queryCommandValue("formatBlock") === "h2";
          button.classList.toggle("active", isHeading);
        } else if (commands.includes(command)) {
          button.classList.toggle(
            "active",
            document.queryCommandState(command)
          );
        }
      });
    }

    // Update button states on selection change
    editor.addEventListener("click", updateButtonStates);
    editor.addEventListener("keyup", updateButtonStates);

    // Add tooltips
    toolbarButtons.forEach((button) => {
      const command = button.getAttribute("data-command");
      switch (command) {
        case "bold":
          button.title = "Bold (Ctrl+B)";
          break;
        case "italic":
          button.title = "Italic (Ctrl+I)";
          break;
        case "underline":
          button.title = "Underline (Ctrl+U)";
          break;
        case "insertOrderedList":
          button.title = "Numbered List (Ctrl+1)";
          break;
        case "insertUnorderedList":
          button.title = "Bullet List (Ctrl+8)";
          break;
        case "formatBlock":
          button.title = "Toggle Heading (Ctrl+H)";
          break;
      }
    });

    function saveDraft() {
      // Get all form values
      const title = document.getElementById("title").value.trim();
      const content = editor.innerHTML.trim();
      const category = document.getElementById("category").value.trim();
      const tags = JSON.parse(
        document.getElementById("tags-hidden").value || "[]"
      );
      const coverImage = document.getElementById("coverImagePreview").src || "";

      // Check if draft has any meaningful content
      const hasContent =
        title || content || category || tags.length > 0 || coverImage;

      if (!hasContent) {
        showNotification("Cannot save an empty draft.");
        return;
      }

      const draftData = {
        title,
        content,
        category,
        tags,
        coverImage,
        lastSaved: new Date().toISOString(),
      };

      localStorage.setItem("blog-draft", JSON.stringify(draftData));
      showNotification("Draft saved successfully!");
    }

    // Manual save draft button
    const saveDraftBtn = document.querySelector(".save-draft-btn");
    if (saveDraftBtn) {
      saveDraftBtn.title = "Save Draft (Ctrl+S)";
      saveDraftBtn.addEventListener("click", saveDraft);
    }

    // Only load draft when creating new blog
    function loadDraft() {
      const savedDraft = localStorage.getItem("blog-draft");
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);

        document.getElementById("title").value = draft.title || "";
        editor.innerHTML = draft.content || "";
        document.getElementById("category").value = draft.category || "";

        // Restore cover image properly
        if (draft.coverImage) {
          const coverPreview = document.getElementById("coverImagePreview");
          const coverPlaceholder = document.getElementById(
            "coverImagePlaceholder"
          );
          const removeCoverBtn = document.getElementById("removeCoverImage");

          if (coverPreview && coverPlaceholder && removeCoverBtn) {
            coverPreview.src = draft.coverImage;
            coverPreview.style.display = "block";
            coverPlaceholder.style.display = "none";
            removeCoverBtn.style.display = "flex";
          }
        }

        // Restore tags
        if (draft.tags && draft.tags.length > 0) {
          document.getElementById("tags-hidden").value = JSON.stringify(
            draft.tags
          );
          window.tags = draft.tags;
          const tagsList = document.getElementById("tags-list");
          if (tagsList) {
            tagsList.innerHTML = draft.tags
              .map(
                (tag) => `
                        <span class="tag-item">
                            <i class="fas fa-hashtag"></i>${tag}
                            <span class="tag-remove" data-tag="${tag}">×</span>
                        </span>
                    `
              )
              .join("");

            document.querySelectorAll(".tag-remove").forEach((button) => {
              button.addEventListener("click", (e) => {
                const tagToRemove = e.target.dataset.tag;
                window.tags = window.tags.filter((t) => t !== tagToRemove);
                updateTags();
              });
            });
          }
        }

        showNotification("Draft restored");
      }
    }

    // Only call loadDraft when creating new blog (not editing)
    const isEditing = document.getElementById("createBlogFormContainer").dataset
      .editBlogId;
    if (!isEditing) {
      loadDraft();
    }

    // Update the function to show notification with auto-hide timer and better styling
    function showNotification(message) {
      // Remove any existing notifications first
      const existingNotification = document.querySelector(
        ".editor-notification"
      );
      if (existingNotification) {
        existingNotification.remove();
      }

      const notification = document.createElement("div");
      notification.className = "editor-notification";
      notification.textContent = message;

      // Add progress bar element
      const progress = document.createElement("div");
      progress.className = "notification-progress";
      notification.appendChild(progress);

      document.body.appendChild(notification);

      // Animate progress bar
      gsap.to(progress, {
        width: "100%",
        duration: 3,
        ease: "none",
        onComplete: () => {
          gsap.to(notification, {
            opacity: 0,
            y: -10,
            duration: 0.3,
            onComplete: () => notification.remove(),
          });
        },
      });

      // Add hover pause functionality
      notification.addEventListener("mouseenter", () => {
        gsap.getTweensOf(progress).forEach((t) => t.pause());
      });

      notification.addEventListener("mouseleave", () => {
        gsap.getTweensOf(progress).forEach((t) => t.resume());
      });
    }
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

// Add notification function
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "editor-notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function handleCoverImage(file) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const optimizedImage = await optimizeImageData(e.target.result);
      const coverImagePreview = document.getElementById("coverImagePreview");
      const coverImagePlaceholder = document.getElementById(
        "coverImagePlaceholder"
      );
      const removeCoverImageBtn = document.getElementById("removeCoverImage");

      if (coverImagePreview) {
        coverImagePreview.src = optimizedImage;
        coverImagePreview.style.display = "block";
      }

      if (coverImagePlaceholder) {
        coverImagePlaceholder.style.display = "none";
      }

      if (removeCoverImageBtn) {
        removeCoverImageBtn.style.display = "flex";
      }
    } catch (error) {
      console.error("Error optimizing image:", error);
    }
  };
  reader.readAsDataURL(file);
}
