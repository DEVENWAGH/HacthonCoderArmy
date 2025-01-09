import './style.css';
import { createPostComponent } from './components/createPostComponent.js';

// Initialize Clerk
window.initializeClerk = async function() {
    try {
        await Clerk.load();

        // Check if the user is authenticated
        if (Clerk.user) {
            // Import navbar component
            const { navbarComponent } = await import('./components/navbarComponent.js');
            
            // Create and initialize navbar
            const navbar = navbarComponent();
            document.getElementById('navbarContainer').innerHTML = navbar.template;
            await navbar.initializeNavbar();
            
            // Display posts
            displayPosts();
        } else {
            // Render sign in page
            document.getElementById('app').innerHTML = `<div id="sign-in"></div>`;
            Clerk.mountSignIn(document.getElementById('sign-in'));
        }
    } catch (error) {
        console.error('Error initializing Clerk:', error);
    }
};

// Make displayPosts globally available
window.displayPosts = function() {
    const postsContainer = document.getElementById('content');
    const createPostFormContainer = document.getElementById('createPostFormContainer');
    
    // Only show posts if we're on the main content area and not in create post view
    if (!postsContainer || createPostFormContainer.style.display === 'block') return;

    try {
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        
        // Clear existing content first
        postsContainer.innerHTML = '';

        if (posts.length === 0) {
            postsContainer.innerHTML = `
                <div class="no-posts">
                    <h2>No posts yet</h2>
                    <p>Be the first one to create a post!</p>
                </div>`;
            return;
        }

        // Sort posts by date (newest first)
        const sortedPosts = posts.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        postsContainer.innerHTML = sortedPosts.map(post => `
            <div class="post-card">
                ${post.coverImage ? `
                    <img src="${post.coverImage}" alt="Cover" class="post-cover-image">
                ` : ''}
                <div class="post-content">
                    <h2 class="post-title">${post.title}</h2>
                    <div class="post-metadata">
                        <span class="post-author">${post.author}</span>
                        <span class="post-date">${new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="post-category">${post.category}</div>
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    </div>
                    <div class="post-excerpt">
                        ${post.content.substring(0, 200)}...
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error displaying posts:', error);
        postsContainer.innerHTML = '<div class="error">Error loading posts</div>';
    }
};

// Initialize when the page loads
window.addEventListener('load', initializeClerk);

// Function to initialize editor functionality
function initializeEditor() {
    const editor = document.getElementById('editor');

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
                    img.addEventListener('click', handleImageClick.bind(null, event, modal));
                    
                    editor.appendChild(img); // Insert the image into the editor

                    // Display the uploaded image in the uploaded images container
                    const uploadedImageDiv = document.createElement('div');
                    uploadedImageDiv.className = 'uploaded-image-item';
                    uploadedImageDiv.innerHTML = `
                        <div style="position: relative; display: inline-block;">
                            <img src="${String(event.target.result)}" alt="Uploaded Image" style="max-width: 100px; height: auto; cursor: pointer;">
                            <button type="button" class="remove-image-btn" style="position: absolute; top: 0; right: 0; background: red; color: white; border: none; cursor: pointer;">×</button>
                        </div>
                    `;
                    
                    // Add click event to thumbnail for full size view
                    uploadedImageDiv.querySelector('img').addEventListener('click', handleImageClick.bind(null, event, modal));
                    
                    uploadedImagesContainer.appendChild(uploadedImageDiv);

                    // Add event listener to remove the image
                    uploadedImageDiv.querySelector('.remove-image-btn').addEventListener('click', handleRemoveImageClick.bind(null, uploadedImagesContainer, uploadedImageDiv));
                    uploadedImageDiv.querySelector('.remove-image-btn').addEventListener('click', handleRemoveImageClick.bind(null, uploadedImagesContainer, uploadedImageDiv));
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

// Initialize create post button
document.addEventListener('DOMContentLoaded', () => {
    const createPostBtn = document.querySelector('.create-post-btn') || document.getElementById('loadCreatePostBtn');
    const createPostFormContainer = document.getElementById('createPostFormContainer');
    const navbar = document.querySelector('.navbar');

    if (createPostBtn) {
        createPostBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (navbar) navbar.style.display = 'none';
            if (createPostFormContainer) {
                const { template, initializeCreatePost } = createPostComponent();
                createPostFormContainer.innerHTML = template;
                createPostFormContainer.style.display = 'block';
                initializeCreatePost();
                initializeEditor();
                initializeTagsInput();
            }
        });
    }

    displayPosts(); // Display existing posts
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
                initializeCreatePost();
                initializeEditor();
                initializeTagsInput(); // Make sure this is called
            }
        });
    }
});

// Add publish button initialization
function initializePublishButton() {
    const publishBtn = document.querySelector('.submit-btn');
    const form = document.getElementById('createPostForm');

    if (form && publishBtn) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Gather post data
            const postData = {
                title: document.getElementById('title').value,
                content: document.getElementById('editor').innerHTML,
                category: document.getElementById('category').value,
                tags: JSON.parse(document.getElementById('tags-hidden').value || '[]'),
                coverImage: document.getElementById('coverImagePreview').src,
                createdAt: new Date().toISOString(),
                author: Clerk.user?.fullName || 'Anonymous'
            };

            // Save post
            const posts = JSON.parse(localStorage.getItem('posts') || '[]');
            posts.push(postData);
            localStorage.setItem('posts', JSON.stringify(posts));

            // Reset UI
            document.getElementById('createPostFormContainer').style.display = 'none';
            document.querySelector('.navbar').style.display = 'block';

            // Refresh posts display
            displayPosts();
        });
    }
}

// Call displayPosts when the page loads
document.addEventListener('DOMContentLoaded', () => {
    displayPosts(); // Display posts on home page
    // Other initialization code...
});

// Update the create post form handling
const handleCreatePost = async (e) => {
    e.preventDefault();
    
    const createPostFormContainer = document.getElementById('createPostFormContainer');
    const navbar = document.querySelector('.navbar');
    const content = document.getElementById('content');

    // Hide create post form
    createPostFormContainer.style.display = 'none';
    
    // Show navbar
    navbar.style.display = 'block';
    
    // Show content area
    content.style.display = 'block';
    
    // Refresh posts display
    displayPosts();
    
    // Reset form
    e.target.reset();

    // Redirect to home
    window.location.href = '/';
};

// Add this to your initialization code
document.addEventListener('DOMContentLoaded', () => {
    // Hide content when create post is visible
    const createPostFormContainer = document.getElementById('createPostFormContainer');
    const content = document.getElementById('content');

    if (createPostFormContainer && content) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style') {
                    if (createPostFormContainer.style.display === 'block') {
                        content.style.display = 'none';
                    } else {
                        content.style.display = 'block';
                    }
                }
            });
        });

        observer.observe(createPostFormContainer, { attributes: true });
    }
});