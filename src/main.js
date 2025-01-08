import './style.css';
import { createPostComponent } from './components/createPostComponent.js';

// Function to toggle between dark and light mode
function toggleDarkMode() {
    const body = document.body;
    const modeIcon = document.getElementById('mode-icon');

    // Toggle dark mode and light mode classes on body
    if (body.classList.contains('dark-mode')) {
        // Switching to light mode
        body.classList.remove('dark-mode');
        modeIcon.classList.remove('fa-sun');
        modeIcon.classList.add('fa-moon');
        localStorage.setItem('theme', 'light');
    } else {
        // Switching to dark mode
        body.classList.add('dark-mode');
        modeIcon.classList.remove('fa-moon');
        modeIcon.classList.add('fa-sun');
        localStorage.setItem('theme', 'dark');
    }
}

// Function to set the initial theme based on local storage
function setInitialTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark theme
    const body = document.body;
    const modeIcon = document.getElementById('mode-icon');

    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        modeIcon.classList.remove('fa-moon');
        modeIcon.classList.add('fa-sun');
    } else {
        body.classList.remove('dark-mode');
        modeIcon.classList.remove('fa-sun');
        modeIcon.classList.add('fa-moon');
    }
}

// Add event listener to the dark mode toggle button
document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
    
    // Set initial theme
    setInitialTheme();
});

// Initialize when the page loads
window.addEventListener('load', initializeClerk);

// Function to initialize editor functionality
function initializeEditor() {
    const editor = document.getElementById('editor');
    const toolbar = document.querySelector('.editor-toolbar');
    const contentTextarea = document.getElementById('content');
    const insertImageBtn = document.getElementById('insertImageBtn');
    const uploadedImagesContainer = document.getElementById('uploadedImagesList');
    const coverImageContainer = document.getElementById('coverImageContainer');
    const coverImagePreview = document.getElementById('coverImagePreview');
    const coverImagePlaceholder = document.getElementById('coverImagePlaceholder');
    const removeCoverImageBtn = document.getElementById('removeCoverImage');

    // Create modal for full size image view
    const modal = document.createElement('div');
    modal.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 1000;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    `;
    document.body.appendChild(modal);

    // Handle cover image upload via drag-and-drop
    coverImageContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        coverImageContainer.classList.add('drag-over');
    });

    coverImageContainer.addEventListener('dragleave', () => {
        coverImageContainer.classList.remove('drag-over');
    });

    coverImageContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        coverImageContainer.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleCoverImage(files[0]);
        }
    });

    // Handle cover image upload via click
    coverImageContainer.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = (e) => {
            handleCoverImage(e.target.files[0]);
        };
        fileInput.click();
    });

    // Function to handle cover image
    function handleCoverImage(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            coverImagePreview.src = event.target.result;
            coverImagePreview.style.display = 'block';
            coverImagePlaceholder.style.display = 'none';
            removeCoverImageBtn.style.display = 'flex';
        };
        reader.readAsDataURL(file);
    }

    // Remove cover image
    removeCoverImageBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent the click event from bubbling up
        coverImagePreview.src = '';
        coverImagePreview.style.display = 'none';
        coverImagePlaceholder.style.display = 'flex';
        removeCoverImageBtn.style.display = 'none';
    });

    // Handle image insertion for uploaded images
    insertImageBtn.addEventListener('click', () => {
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.accept = 'image/*';
        imageInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.style.maxWidth = '100%'; // Optional: Set max width for the image
                    img.style.height = 'auto'; // Maintain aspect ratio
                    img.style.cursor = 'pointer'; // Add pointer cursor
                    
                    // Add click event to show full size image
                    img.addEventListener('click', () => {
                        modal.innerHTML = `<img src="${event.target.result}" style="max-width: 90%; max-height: 90%; object-fit: contain;">`;
                        modal.style.display = 'flex';
                    });
                    
                    document.execCommand('insertHTML', false, img.outerHTML); // Insert the image into the editor

                    // Display the uploaded image in the uploaded images container
                    const uploadedImageDiv = document.createElement('div');
                    uploadedImageDiv.className = 'uploaded-image-item';
                    uploadedImageDiv.innerHTML = `
                        <div style="position: relative; display: inline-block;">
                            <img src="${event.target.result}" alt="Uploaded Image" style="max-width: 100px; height: auto; cursor: pointer;">
                            <button type="button" class="remove-image-btn" style="position: absolute; top: 0; right: 0; background: red; color: white; border: none; cursor: pointer;">×</button>
                        </div>
                    `;
                    
                    // Add click event to thumbnail for full size view
                    uploadedImageDiv.querySelector('img').addEventListener('click', () => {
                        modal.innerHTML = `<img src="${event.target.result}" style="max-width: 90%; max-height: 90%; object-fit: contain;">`;
                        modal.style.display = 'flex';
                    });
                    
                    uploadedImagesContainer.appendChild(uploadedImageDiv);

                    // Add event listener to remove the image
                    uploadedImageDiv.querySelector('.remove-image-btn').addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent the click event from bubbling up
                        uploadedImagesContainer.removeChild(uploadedImageDiv);
                    });
                };
                reader.readAsDataURL(file);
            }
        };
        imageInput.click(); // Open the file input dialog
    });

    // Close modal when clicking anywhere
    modal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Update the textarea when the editor content changes
    editor.addEventListener('input', () => {
        contentTextarea.value = editor.innerHTML;
    });

    // Add click event to existing images in editor
    editor.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
            modal.innerHTML = `<img src="${e.target.src}" style="max-width: 90%; max-height: 90%; object-fit: contain;">`;
            modal.style.display = 'flex';
        }
    });
}

// Handle cover image upload
function handleCoverImageUpload() {
    const coverImageInput = document.getElementById('coverImage');
    const coverImagePreview = document.getElementById('coverImagePreview');
    const coverImagePlaceholder = document.getElementById('coverImagePlaceholder');
    const removeCoverImageBtn = document.getElementById('removeCoverImage');

    coverImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                coverImagePreview.src = event.target.result;
                coverImagePreview.style.display = 'block';
                coverImagePlaceholder.style.display = 'none';
                removeCoverImageBtn.style.display = 'flex';
            };
            reader.readAsDataURL(file);
        }
    });

    removeCoverImageBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent the click event from bubbling up
        coverImagePreview.src = '';
        coverImagePreview.style.display = 'none';
        coverImagePlaceholder.style.display = 'flex';
        removeCoverImageBtn.style.display = 'none';
        coverImageInput.value = '';
    });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeEditor();
    handleCoverImageUpload();
});

// Initialize create post button
document.addEventListener('DOMContentLoaded', () => {
    const createPostBtn = document.querySelector('.create-post-btn') || document.getElementById('loadCreatePostBtn');
    const createPostFormContainer = document.getElementById('createPostFormContainer');
    const navbar = document.querySelector('.navbar');

    if (createPostBtn) {
        createPostBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (navbar) {
                navbar.style.display = 'none';
            }
            
            if (createPostFormContainer) {
                const { template, initializeCreatePost } = createPostComponent();
                createPostFormContainer.innerHTML = template;
                createPostFormContainer.style.display = 'block';
                initializeCreatePost();
                initializeEditor();
            }
        });
    }
});

// Add this function to show navbar when returning to main page
function showNavbar() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.style.display = 'block';
    }
}

function initializeTagsInput() {
    const tagsInput = document.getElementById('tags-input');
    const tagsList = document.getElementById('tags-list');
    const tagSuggestions = document.getElementById('tag-suggestions');
    const tagsHidden = document.getElementById('tags-hidden');
    const categorySelect = document.getElementById('category');
    let tags = [];

    // Disable tags input until category is selected
    if (tagsInput) {
        tagsInput.disabled = true;
        tagsInput.placeholder = "Please select a category first";
    }

    function showSuggestions(input) {
        if (!input) {
            tagSuggestions.style.display = 'none';
            return;
        }

        const searchTerm = input.toLowerCase();
        const selectedCategory = categorySelect.value;

        // Get category-specific tags
        const categorySpecificTags = selectedCategory ? CATEGORY_TAGS[selectedCategory] : [];

        // Filter tags based on search term
        const filteredTags = categorySpecificTags
            .filter(tag => tag.toLowerCase().includes(searchTerm))
            .filter(tag => !tags.includes(tag));

        // Show suggestions if there's input and a category selected
        if (selectedCategory && filteredTags.length > 0) {
            tagSuggestions.innerHTML = filteredTags
                .slice(0, 5) // Limit to 5 suggestions
                .map(tag => `
                    <div class="suggestion-item" data-tag="${tag}">
                        <i class="fas fa-hashtag"></i> ${tag}
                    </div>
                `).join('');
            tagSuggestions.style.display = 'block';
        } else if (selectedCategory) {
            tagSuggestions.innerHTML = `
                <div class="suggestion-item no-category">
                    No matching tags found
                </div>`;
            tagSuggestions.style.display = 'block';
        } else {
            tagSuggestions.style.display = 'none';
        }
    }

    function addTag(tag) {
        tag = tag.toLowerCase().replace(/[^a-z0-9-]/g, '').trim();
        if (tag && !tags.includes(tag) && tags.length < 5) {
            tags.push(tag);
            updateTags();
            tagsInput.value = '';
            tagSuggestions.style.display = 'none';
        }
    }

    function updateTags() {
        tagsHidden.value = JSON.stringify(tags);
        tagsList.innerHTML = tags.map(tag => `
            <span class="tag-item">
                <i class="fas fa-hashtag"></i>${tag}
                <span class="tag-remove" data-tag="${tag}">×</span>
            </span>
        `).join('');
    }

    // Event Listeners
    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            const selectedCategory = categorySelect.value;
            if (selectedCategory) {
                tagsInput.disabled = false;
                tagsInput.placeholder = "Type to add tags";
                // Clear existing tags when category changes
                tags = [];
                updateTags();
            } else {
                tagsInput.disabled = true;
                tagsInput.placeholder = "Please select a category first";
                tagSuggestions.style.display = 'none';
            }
        });
    }

    if (tagsInput) {
        tagsInput.addEventListener('input', (e) => {
            showSuggestions(e.target.value);
        });

        tagsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && tagsInput.value) {
                e.preventDefault();
                addTag(tagsInput.value);
            }
        });
    }

    if (tagSuggestions) {
        tagSuggestions.addEventListener('click', (e) => {
            const suggestionItem = e.target.closest('.suggestion-item');
            if (suggestionItem) {
                const tag = suggestionItem.dataset.tag;
                addTag(tag);
            }
        });
    }

    if (tagsList) {
        tagsList.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-remove')) {
                const tagToRemove = e.target.dataset.tag;
                tags = tags.filter(tag => tag !== tagToRemove);
                updateTags();
            }
        });
    }

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.tags-input-container')) {
            tagSuggestions.style.display = 'none';
        }
    });
}

// Make sure to call initializeTagsInput when the form is loaded
document.addEventListener('DOMContentLoaded', () => {
    const createPostBtn = document.querySelector('.create-post-btn') || document.getElementById('loadCreatePostBtn');
    const createPostFormContainer = document.getElementById('createPostFormContainer');

    if (createPostBtn) {
        createPostBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (createPostFormContainer) {
                const { template, initializeCreatePost } = createPostComponent();
                createPostFormContainer.innerHTML = template;
                createPostFormContainer.style.display = 'block';
                initializeCreatePost();
                initializeEditor();
                initializeTagsInput(); // Make sure this is called
            }
        });
    }
});