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
                    <div id="uploadedImagesList" class="uploaded-images-list"></div>
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

        // Initialize editor functionality
        const editor = document.getElementById('editor');
        const toolbarButtons = document.querySelectorAll('.editor-toolbar button');
        const contentTextarea = document.getElementById('content');
        const insertImageBtn = document.getElementById('insertImageBtn');
        const uploadedImagesContainer = document.getElementById('uploadedImagesList');

        toolbarButtons.forEach(button => {
            button.addEventListener('click', () => {
                const command = button.getAttribute('data-command');
                const value = button.getAttribute('data-value') || null;
                document.execCommand(command, false, value);
                editor.focus();
            });
        });

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
                        img.style.maxWidth = '100px';
                        img.style.height = 'auto';
                        img.style.cursor = 'pointer';
                        img.classList.add('thumbnail');
                        img.addEventListener('click', () => {
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
                            modal.innerHTML = `<img src="${event.target.result}" style="max-width: 90%; max-height: 90%; object-fit: contain;">`;
                            modal.addEventListener('click', () => {
                                modal.style.display = 'none';
                            });
                            document.body.appendChild(modal);
                        });

                        const uploadedImageDiv = document.createElement('div');
                        uploadedImageDiv.className = 'uploaded-image-item';
                        uploadedImageDiv.style.position = 'relative';
                        uploadedImageDiv.appendChild(img);
                        uploadedImageDiv.innerHTML += `
                            <button type="button" class="remove-image-btn">×</button>
                        `;
                        uploadedImagesContainer.appendChild(uploadedImageDiv);

                        uploadedImageDiv.querySelector('.remove-image-btn').addEventListener('click', (e) => {
                            e.stopPropagation();
                            uploadedImagesContainer.removeChild(uploadedImageDiv);
                        });
                    };
                    reader.readAsDataURL(file);
                }
            };
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
    };

    return { template, initializeCreatePost };
}