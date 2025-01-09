import { createPostComponent } from './createPostComponent.js';

export function previewComponent(postData) {
    const template = `
        <div class="preview-post-container">
            <div class="preview-header">
                <h2>Preview Post</h2>
            </div>
            ${postData.coverImage ? `
                <img src="${postData.coverImage}" alt="Cover" class="preview-cover-image">
            ` : ''}
            <h1 class="preview-title">${postData.title || 'Untitled'}</h1>
            <div class="preview-tags">
                ${postData.tags ? postData.tags.map(tag => `
                    <span class="tag">#${tag}</span>
                `).join('') : ''}
            </div>
            <div class="preview-content">
                ${postData.content || ''}
            </div>
            <div class="uploaded-images-preview">
                ${postData.uploadedImages ? postData.uploadedImages.map(image => `
                    <img src="${image}" alt="Uploaded Image" class="preview-uploaded-image">
                `).join('') : ''}
            </div>
            <div class="form-actions">
                <button type="button" class="submit-btn" id="publishBtn">Publish Post</button>
                <button type="button" class="cancel-btn" id="backToEditBtn">Back to Edit</button>
            </div>
        </div>
    `;

    const initializePreview = () => {
        const backToEditBtn = document.getElementById('backToEditBtn');
        const publishBtn = document.getElementById('publishBtn');

        if (backToEditBtn) {
            backToEditBtn.addEventListener('click', () => {
                const createPostFormContainer = document.getElementById('createPostFormContainer');
                if (createPostFormContainer) {
                    const { template, initializeCreatePost } = createPostComponent();
                    createPostFormContainer.innerHTML = template;
                    initializeCreatePost();
                }
            });
        }

        // Handle publish button click
        if (publishBtn) {
            publishBtn.addEventListener('click', () => {
                // Save post data to local storage
                const posts = JSON.parse(localStorage.getItem('posts')) || [];
                posts.push(postData);
                localStorage.setItem('posts', JSON.stringify(posts));

                // Redirect to the home page
                window.location.href = '/'; // Redirect to the main page
            });
        }
    };

    return { template, initializePreview };
}