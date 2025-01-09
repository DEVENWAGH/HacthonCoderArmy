// createPostComponent.js

import { previewComponent } from './previewComponent.js';

export function createPostComponent(postData = {}) {
    const template = `
        <div class="create-post-container" id="createPostContainer" style="margin-top: 20px;">
            <div class="logo-container">
                <a href="/"><img class="darklogo" id="logoImage" src="./logo.svg" alt="Logo"></a>
            </div>
            <form id="createPostForm">
                <div class="form-group">
                    <div class="cover-image-container" id="coverImageContainer" title="Click or drag image to add cover image">
                        <div class="cover-image-placeholder" id="coverImagePlaceholder">
                            <i class="fas fa-image"></i>
                            <span>Click or drag image to add cover image</span>
                        </div>
                        <img id="coverImagePreview" class="cover-image-preview" src="${postData.coverImage || ''}" alt="" style="display: ${postData.coverImage ? 'block' : 'none'};">
                        <button type="button" class="remove-cover-image-btn" id="removeCoverImage" style="display: none;">×</button>
                    </div>
                </div>
                <div class="form-group">
                    <input type="text" id="title" name="title" placeholder="Post Title" required value="${postData.title || ''}">
                </div>
                <div class="form-group">
                    <label for="category">Category <span style="color: #ff8c00;">*</span></label>
                    <select id="category" name="category" required>
                        <option value="">Select a category</option>
                        <option value="technology" ${postData.category === 'technology' ? 'selected' : ''}>Technology</option>
                        <option value="lifestyle" ${postData.category === 'lifestyle' ? 'selected' : ''}>Lifestyle</option>
                        <option value="travel" ${postData.category === 'travel' ? 'selected' : ''}>Travel</option>
                        <option value="food" ${postData.category === 'food' ? 'selected' : ''}>Food</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="tags">Tags (up to 5)</label>
                    <div class="tags-input-container">
                        <input type="text" class="tags-input" id="tags-input" placeholder="Type to add tags">
                        <div class="tags-list" id="tags-list">
                            ${postData.tags ? postData.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                        </div>
                        <div class="tag-suggestions" id="tag-suggestions" style="display: none;"></div>
                    </div>
                    <div class="tags-limit-message" style="display: none;">Maximum 5 tags allowed</div>
                    <input type="hidden" id="tags-hidden" name="tags" value='${JSON.stringify(postData.tags || [])}'>
                </div>
                <div class="form-group">
                    <label for="content">Content</label>
                    <div class="editor-toolbar">
                        <button type="button" class="editor-btn" data-command="bold"><i class="fas fa-bold"></i></button>
                        <button type="button" class="editor-btn" data-command="italic"><i class="fas fa-italic"></i></button>
                        <button type="button" class="editor-btn" data-command="insertOrderedList"><i class="fas fa-list-ol"></i></button>
                        <button type="button" class="editor-btn" data-command="insertUnorderedList"><i class="fas fa-list-ul"></i></button>
                        <button type="button" class="editor-btn" data-command="formatBlock" data-value="h2"><i class="fas fa-heading"></i></button>
                        <button type="button" class="editor-btn" id="insertImageBtn"><i class="fas fa-image"></i></button>
                    </div>
                    <div id="editor" contenteditable="true" class="form-group input">${postData.content || ''}</div>
                    <textarea id="content" name="content" style="position: absolute; opacity: 0; pointer-events: none;">${postData.content || ''}</textarea>
                </div>
                <div class="uploaded-images-container" id="uploadedImagesContainer">
                    <h4>Uploaded Images</h4>
                    <div id="uploadedImagesList" class="uploaded-images-list">
                        ${postData.uploadedImages ? postData.uploadedImages.map(image => `
                            <div class="uploaded-image-item">
                                <img src="${image}" alt="Uploaded Image" style="max-width: 100px; height: auto;">
                                <button type="button" class="remove-image-btn">×</button>
                            </div>
                        `).join('') : ''}
                    </div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="submit-btn" id="publishBtn">Publish Post</button>
                    <button type="button" class="cancel-btn" id="cancelBtn">Cancel</button>
                </div>
            </form>
        </div>
    `;

    const initializeCreatePost = () => {
        const form = document.getElementById('createPostForm');
        const editor = document.getElementById('editor');
        const contentTextarea = document.getElementById('content');

        if (form) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                try {
                    // Basic validation
                    const title = document.getElementById('title').value.trim();
                    const category = document.getElementById('category').value;
                    const content = editor.innerHTML.trim();
                    const coverImage = document.getElementById('coverImagePreview');

                    if (!title || !category || !content) {
                        alert('Please fill in all required fields');
                        return;
                    }

                    const coverImageSrc = coverImage.style.display !== 'none' ? coverImage.src : '';
            
                    // Compress cover image if exists
                    const optimizedCoverImage = coverImageSrc ? await optimizeImageData(coverImageSrc) : '';

                    // Create post object with optimized data
                    const newPost = {
                        id: Date.now(),
                        title: title.substring(0, 100), // Limit title length
                        content: content.substring(0, 10000), // Limit content length
                        category: category,
                        tags: JSON.parse(document.getElementById('tags-hidden').value || '[]').slice(0, 5), // Limit tags
                        coverImage: optimizedCoverImage, // Optimize image data
                        createdAt: new Date().toISOString(),
                        author: window.Clerk?.user?.fullName || 'Anonymous'
                    };

                    // Get existing posts
                    let posts = [];
                    try {
                        const existingPosts = localStorage.getItem('posts');
                        posts = existingPosts ? JSON.parse(existingPosts) : [];
                        
                        // Keep only the latest 50 posts
                        if (posts.length >= 50) {
                            posts = posts.slice(-49); // Keep last 49 posts
                        }
                    } catch (error) {
                        console.error('Error parsing existing posts:', error);
                        posts = [];
                    }

                    // Add new post
                    posts.push(newPost);

                    try {
                        // Try to save with optimized data
                        localStorage.setItem('posts', JSON.stringify(posts));
                    } catch (storageError) {
                        // If storage fails, try cleaning up old posts
                        console.warn('Storage full, cleaning up old posts...');
                        posts = posts.slice(-25); // Keep only last 25 posts
                        localStorage.setItem('posts', JSON.stringify(posts));
                    }

                    // Reset UI
                    form.reset();
                    editor.innerHTML = '';
                    coverImage.src = '';
                    coverImage.style.display = 'none';
                    document.getElementById('coverImagePlaceholder').style.display = 'flex';
                    document.getElementById('removeCoverImage').style.display = 'none';
                    document.getElementById('uploadedImagesList').innerHTML = '';
                    document.getElementById('tags-list').innerHTML = '';
                    document.getElementById('tags-hidden').value = '[]';

                    // Update display
                    document.getElementById('createPostFormContainer').style.display = 'none';
                    document.querySelector('.navbar').style.display = 'block';

                    // Refresh page
                    window.location.href = '/';
                } catch (error) {
                    console.error('Error saving post:', error);
                    alert('Error saving post. Please try again with less content or smaller images.');
                }
            });
        }

        // Sync editor content with hidden textarea
        editor.addEventListener('input', () => {
            if (contentTextarea) {
                contentTextarea.value = editor.innerHTML;
            }
        });

        // Cancel button handling
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                document.getElementById('createPostContainer').style.display = 'none';
                document.querySelector('.navbar').style.display = 'block';
            });
        }

        // Initialize editor functionality
        const toolbarButtons = document.querySelectorAll('.editor-toolbar button');
        const insertImageBtn = document.getElementById('insertImageBtn');

        toolbarButtons.forEach(button => {
            button.addEventListener('click', () => {
                const command = button.getAttribute('data-command');
                const value = button.getAttribute('data-value') || null;
                executeCommand(command, value);
                editor.focus();
            });
        });

        insertImageBtn.addEventListener('click', () => {
            const imageInput = document.createElement('input');
            imageInput.type = 'file';
            imageInput.accept = 'image/*';
            imageInput.onchange = handleImageUpload;
            imageInput.click();
        });

        editor.addEventListener('input', () => {
            contentTextarea.value = editor.innerHTML;
        });

        // Handle cover image upload via drag-and-drop
        const coverImageContainer = document.getElementById('coverImageContainer');
        const coverImagePreview = document.getElementById('coverImagePreview');
        const coverImagePlaceholder = document.getElementById('coverImagePlaceholder');
        const removeCoverImageBtn = document.getElementById('removeCoverImage');

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
            reader.onload = async (event) => {
                try {
                    // Compress the image
                    const compressedImage = await compressImage(event.target.result);
                    
                    // Update UI
                    coverImagePreview.src = compressedImage;
                    coverImagePreview.style.display = 'block';
                    coverImagePlaceholder.style.display = 'none';
                    removeCoverImageBtn.style.display = 'flex';
                } catch (error) {
                    console.error('Error handling cover image:', error);
                    alert('Error processing image. Please try a smaller image.');
                }
            };
            reader.readAsDataURL(file);
        }

        // Remove cover image
        removeCoverImageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            coverImagePreview.src = '';
            coverImagePreview.style.display = 'none';
            coverImagePlaceholder.style.display = 'flex';
            removeCoverImageBtn.style.display = 'none';
        });

        // Initialize logo switch based on theme
        switchLogoBasedOnTheme();
    };

    function executeCommand(command, value = null) {
        if (command === 'bold' || command === 'italic' || command === 'insertOrderedList' || command === 'insertUnorderedList' || command === 'formatBlock') {
            document.execCommand(command, false, value);
        } else {
            console.warn(`Command "${command}" is not supported.`);
        }
    }

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    // Compress the image
                    const compressedImage = await compressImage(event.target.result);
                    
                    const img = document.createElement('img');
                    img.src = compressedImage;
                    img.style.maxWidth = '100px';
                    img.style.height = 'auto';
                    img.style.cursor = 'pointer';
                    img.classList.add('thumbnail');
                    img.addEventListener('click', () => handleImageClick(compressedImage));

                    const uploadedImageDiv = document.createElement('div');
                    uploadedImageDiv.className = 'uploaded-image-item';
                    uploadedImageDiv.style.position = 'relative';
                    uploadedImageDiv.appendChild(img);
                    uploadedImageDiv.innerHTML += `
                        <button type="button" class="remove-image-btn">×</button>
                    `;
                    document.getElementById('uploadedImagesList').appendChild(uploadedImageDiv);

                    uploadedImageDiv.querySelector('.remove-image-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        document.getElementById('uploadedImagesList').removeChild(uploadedImageDiv);
                    });
                } catch (error) {
                    console.error('Error handling image upload:', error);
                    alert('Error processing image. Please try a smaller image.');
                }
            };
            reader.readAsDataURL(file);
        }
    }

    function handleImageClick() {
        createImageModal(typeof event.target.result === 'string' ? event.target.result : '');
    }

    function createImageModal(imageSrc) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            display: flex;
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
        modal.innerHTML = `<img src="${imageSrc}" style="max-width: 90%; max-height: 90%; object-fit: contain;">`;
        modal.addEventListener('click', closeModal);
        document.body.appendChild(modal);
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    function switchLogoBasedOnTheme() {
        const logoImage = document.getElementById('logoImage');
        const isDarkMode = document.body.classList.contains('dark-mode');
        logoImage.src = isDarkMode ? './logo.svg' : './dark-logo.svg';
    }

    // Update image compression function with better quality
    function compressImage(dataUrl, maxWidth = 1200) {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = dataUrl;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

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
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to JPEG with 0.9 quality (higher quality)
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.9);

                // Check size and adjust if needed
                if (compressedDataUrl.length > 2000000) { // If larger than ~2MB
                    // Try again with slightly lower quality
                    const mediumQuality = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(mediumQuality);
                } else {
                    resolve(compressedDataUrl);
                }
            };
        });
    }

    // Update optimizeImageData function
    function optimizeImageData(dataUrl) {
        return compressImage(dataUrl, 1200);  // Increased max width to 1200px
    }

    return { template, initializeCreatePost };
}