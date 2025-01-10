import './style.css';
// Update import to use new component name
import { createBlogComponent } from './components/createBlogComponent.js';

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
            displayBlogs();
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
window.displayBlogs = function() {
    const blogsContainer = document.getElementById('content');
    const createBlogFormContainer = document.getElementById('createBlogFormContainer');
    
    if (!blogsContainer || createBlogFormContainer.style.display === 'block') return;

    try {
        // Get blogs from sessionStorage
        let blogs = JSON.parse(sessionStorage.getItem('blogs') || '[]');
        
        blogsContainer.innerHTML = '';

        if (blogs.length === 0) {
            blogsContainer.innerHTML = `
                <div class="no-blogs">
                    <h2>No blogs yet</h2>
                    <p>Be the first one to create a blog!</p>
                </div>`;
            return;
        }

        // Sort blogs by date (newest first)
        blogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        blogsContainer.innerHTML = blogs.map(blog => `
            <div class="blog-card">
                <div class="blog-header">
                    <i class="fas fa-ellipsis-v menu-icon"></i>
                    <div class="menu-dropdown">
                        <a href="#" class="edit-blog" data-id="${blog.id}">Edit</a>
                        <a href="#" class="delete-blog" data-id="${blog.id}">Delete</a>
                    </div>
                </div>
                ${blog.coverImage ? `
                    <img src="${blog.coverImage}" alt="Cover" class="blog-cover-image">
                ` : ''}
                <div class="blog-content">
                    <h2 class="blog-title">${blog.title}</h2>
                    <div class="blog-metadata">
                        <span class="blog-author">${blog.author}</span>
                        <span class="blog-date">${new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="blog-category">${blog.category}</div>
                    <div class="blog-tags">
                        ${blog.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    </div>
                    <div class="blog-excerpt">
                        ${blog.content.substring(0, 200)}...
                    </div>
                </div>
            </div>
        `).join('');

        // Add click listeners to menu icons
        document.querySelectorAll('.menu-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                // Close any open dropdowns first
                document.querySelectorAll('.menu-dropdown').forEach(dropdown => {
                    if (dropdown !== e.target.nextElementSibling) {
                        dropdown.style.display = 'none';
                    }
                });
                
                const dropdown = e.target.nextElementSibling;
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                e.stopPropagation();
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            document.querySelectorAll('.menu-dropdown').forEach(dropdown => {
                dropdown.style.display = 'none';
            });
        });

        // Handle edit and delete actions
        document.querySelectorAll('.edit-blog').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const blogId = parseInt(e.target.dataset.id);
                editBlog(blogId);
            });
        });

        document.querySelectorAll('.delete-blog').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const blogId = parseInt(e.target.dataset.id);
                if (confirm('Are you sure you want to delete this blog?')) {
                    deleteBlog(blogId);
                }
            });
        });

    } catch (error) {
        console.error('Error displaying blogs:', error);
        blogsContainer.innerHTML = '<div class="error">Error loading blogs</div>';
    }
};

// Function to edit a blog
function editBlog(blogId) {
    const blogs = JSON.parse(sessionStorage.getItem('blogs') || '[]');
    const blog = blogs.find(b => b.id === blogId);
    
    if (blog) {
        const createBlogFormContainer = document.getElementById('createBlogFormContainer');
        const content = document.getElementById('content');
        const navbar = document.querySelector('.navbar');
        
        if (createBlogFormContainer) {
            // Hide navbar and content
            navbar.style.display = 'none';
            content.style.display = 'none';
            
            // Show form with blog data
            const { template, initializeCreateBlog } = createBlogComponent();
            createBlogFormContainer.innerHTML = template;
            createBlogFormContainer.style.display = 'block';

            // Pre-fill form with existing blog data
            document.getElementById('title').value = blog.title;
            document.getElementById('category').value = blog.category;
            document.getElementById('editor').innerHTML = blog.content;
            document.getElementById('content').value = blog.content;
            
            // Set cover image if exists
            if (blog.coverImage) {
                const coverPreview = document.getElementById('coverImagePreview');
                const coverPlaceholder = document.getElementById('coverImagePlaceholder');
                const removeCoverBtn = document.getElementById('removeCoverImage');
                
                coverPreview.src = blog.coverImage;
                coverPreview.style.display = 'block';
                coverPlaceholder.style.display = 'none';
                removeCoverBtn.style.display = 'flex';
            }

            // Set tags
            if (blog.tags && blog.tags.length > 0) {
                document.getElementById('tags-hidden').value = JSON.stringify(blog.tags);
                const tagsList = document.getElementById('tags-list');
                tagsList.innerHTML = blog.tags.map(tag => `
                    <span class="tag-item">
                        <i class="fas fa-hashtag"></i>${tag}
                        <span class="tag-remove" data-tag="${tag}">×</span>
                    </span>
                `).join('');
            }

            // Store blog ID for update
            createBlogFormContainer.dataset.editBlogId = blogId;

            // Initialize everything
            initializeCreateBlog();
            initializeEditor();
            initializeTagsInput();

            // Update form submit handler to handle edit
            const form = document.getElementById('createBlogForm');
            form.onsubmit = handleEditSubmit;
        }
    }
}

// Function to handle edit form submission
async function handleEditSubmit(e) {
    e.preventDefault();
    
    const blogId = parseInt(e.target.closest('#createBlogFormContainer').dataset.editBlogId);
    let blogs = JSON.parse(sessionStorage.getItem('blogs') || '[]');
    
    // Get updated blog data
    const updatedBlog = {
        id: blogId,
        title: document.getElementById('title').value,
        content: document.getElementById('editor').innerHTML,
        category: document.getElementById('category').value,
        tags: JSON.parse(document.getElementById('tags-hidden').value || '[]'),
        coverImage: document.getElementById('coverImagePreview').src,
        author: window.Clerk?.user?.fullName || 'Anonymous',
        createdAt: blogs.find(b => b.id === blogId)?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Remove old blog and add updated one
    blogs = blogs.filter(blog => blog.id !== blogId);
    blogs.push(updatedBlog);
    
    // Save back to storage
    sessionStorage.setItem('blogs', JSON.stringify(blogs));

    // Reset UI
    const createBlogFormContainer = document.getElementById('createBlogFormContainer');
    const navbar = document.querySelector('.navbar');
    const content = document.getElementById('content');
    
    // Clean up form
    createBlogFormContainer.innerHTML = '';
    createBlogFormContainer.style.display = 'none';
    createBlogFormContainer.removeAttribute('data-edit-blog-id');
    
    // Show navbar and content
    navbar.style.display = 'block';
    content.style.display = 'block';

    // Refresh blogs display
    displayBlogs();
}

// Function to delete a blog
function deleteBlog(blogId) {
    let blogs = JSON.parse(sessionStorage.getItem('blogs') || '[]');
    blogs = blogs.filter(b => b.id !== blogId);
    sessionStorage.setItem('blogs', JSON.stringify(blogs));
    displayBlogs();
}

// Initialize when the page loads
window.addEventListener('load', initializeClerk);

// Function to initialize editor functionality
function initializeEditor() {
    const editor = document.getElementById('editor');

    const contentTextarea = document.getElementById('content');
    const insertImageBtn = document.getElementById('insertImageBtn');
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
    coverImageContainer.addEventListener('click', (e) => {
        if (e.target === coverImageContainer || e.target.classList.contains('cover-image-placeholder')) {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = (e) => {
                handleCoverImage(e.target.files[0]);
            };
            fileInput.click();
        }
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
    insertImageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Create input only if it doesn't exist
        let imageInput = document.getElementById('image-upload-input');
        if (!imageInput) {
            imageInput = document.createElement('input');
            imageInput.id = 'image-upload-input';
            imageInput.type = 'file';
            imageInput.accept = 'image/*';
            imageInput.style.display = 'none';
            document.body.appendChild(imageInput);
            
            imageInput.addEventListener('change', handleImageUpload);
        }
        imageInput.click();
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
    const createBlogBtn = document.querySelector('.create-blog-btn') || document.getElementById('loadCreateBlogBtn');
    const createBlogFormContainer = document.getElementById('createBlogFormContainer');
    const navbar = document.querySelector('.navbar');

    if (createBlogBtn) {
        createBlogBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (navbar) navbar.style.display = 'none';
            if (createBlogFormContainer) {
                const { template, initializeCreateBlog } = createBlogComponent();
                createBlogFormContainer.innerHTML = template;
                createBlogFormContainer.style.display = 'block';
                initializeCreateBlog();
                initializeEditor();
                initializeTagsInput();
            }
        });
    }

    displayBlogs(); // Display existing blogs
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
            const blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
            blogs.push(postData);
            localStorage.setItem('blogs', JSON.stringify(blogs));

            // Reset UI
            document.getElementById('createPostFormContainer').style.display = 'none';
            document.querySelector('.navbar').style.display = 'block';

            // Refresh posts display
            displayBlogs();
        });
    }
}

// Call displayPosts when the page loads
document.addEventListener('DOMContentLoaded', () => {
    displayBlogs(); // Display posts on home page
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
    displayBlogs();
    
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