// createPostComponent.js

import { previewComponent } from './previewComponent.js';

export function createPostComponent() {
    const template = `
        <div class="create-post-container" id="createPostContainer" style="margin-top: 20px;">
            <div class="logo-container">
                <a href="/"><img class="darklogo" src="./dark-logo.svg" alt="Logo"></a>
            </div>
            <form id="createPostForm">
                <div class="form-group">
                    <div class="cover-image-container" id="coverImageContainer" title="Click or drag image to add cover image">
                        <div class="cover-image-placeholder" id="coverImagePlaceholder">
                            <i class="fas fa-image"></i>
                            <span>Click or drag image to add cover image</span>
                        </div>
                        <img id="coverImagePreview" class="cover-image-preview" src="" alt="" style="display: none;">
                        <button type="button" class="remove-cover-image-btn" id="removeCoverImage" style="display: none;">×</button>
                    </div>
                </div>
                <div class="form-group">
                    <input type="text" id="title" name="title" placeholder="Post Title" required>
                </div>
                <div class="form-group">
                    <label for="category">Category <span style="color: #ff8c00;">*</span></label>
                    <select id="category" name="category" required>
                        <option value="">Select a category</option>
                        <option value="technology">Technology</option>
                        <option value="lifestyle">Lifestyle</option>
                        <option value="travel">Travel</option>
                        <option value="food">Food</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="tags">Tags (up to 5)</label>
                    <div class="tags-input-container">
                        <input type="text" class="tags-input" id="tags-input" placeholder="Type to add tags">
                        <div class="tags-list" id="tags-list"></div>
                        <div class="tag-suggestions" id="tag-suggestions" style="display: none;"></div>
                    </div>
                    <div class="tags-limit-message" style="display: none;">Maximum 5 tags allowed</div>
                    <input type="hidden" id="tags-hidden" name="tags">
                </div>
                <div class="form-group">
                    <label for="content">Content</label>
                    <div class="editor-toolbar">
                        <button type="button" class="editor-btn" data-command="bold"><i class="fas fa-bold"></i></button>
                        <button type="button" class="editor-btn" data-command="italic"><i class="fas fa-italic"></i></button>
                        <button type="button" class="editor-btn" data-command="insertOrderedList"><i class="fas fa-list-ol"></i></button>
                        <button type="button" class="editor-btn" data-command="insertUnorderedList"><i class="fas fa-list-ul"></i></button>
                        <button type="button" class="editor-btn" data-command="formatBlock" data-value="h2"><i class="fas fa-heading"></i></button>
                        <button type="button" class="editor-btn" data-command="formatBlock" data-value="blockquote"><i class="fas fa-quote-right"></i></button>
                        <button type="button" class="editor-btn" id="insertImageBtn"><i class="fas fa-image"></i></button>
                    </div>
                    <div id="editor" contenteditable="true" class="form-group input"></div>
                    <textarea id="content" name="content" required style="display: none;"></textarea>
                </div>
                <div class="uploaded-images-container" id="uploadedImagesContainer">
                    <h4>Uploaded Images</h4>
                    <div id="uploadedImagesList"></div>
                </div>
                <div class="form-actions">
                    <button type="button" class="preview-btn" id="previewPostBtn">Preview</button>
                    <button type="submit" class="submit-btn">Publish Post</button>
                    <button type="button" class="cancel-btn" id="cancelBtn">Cancel</button>
                </div>
            </form>
        </div>
    `;

    const initializeCreatePost = () => {
        const cancelBtn = document.getElementById('cancelBtn');
        const previewPostBtn = document.getElementById('previewPostBtn');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                document.getElementById('createPostContainer').style.display = 'none';
                document.querySelector('.navbar').style.display = 'block';
            });
        }

        if (previewPostBtn) {
            previewPostBtn.addEventListener('click', () => {
                const postData = {
                    coverImage: document.getElementById('coverImagePreview').src,
                    title: document.getElementById('title').value,
                    category: document.getElementById('category').value,
                    tags: Array.from(document.querySelectorAll('#tags-list .tag')).map(tag => tag.textContent),
                    content: document.getElementById('editor').innerHTML
                };

                const { template, initializePreview } = previewComponent(postData);
                document.getElementById('app').innerHTML = template;
                initializePreview();
            });
        }
    };

    return { template, initializeCreatePost };
}