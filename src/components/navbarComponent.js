import { createPostComponent } from './createPostComponent.js';

export function navbarComponent() {
    const template = `
        <nav class="navbar">
            <div class="navbar-container">
                <a href="/"><img class="logo" src="./logo.svg" alt="Logo" /></a>
                <div class="search-bar">
                    <input type="text" placeholder="Search posts..." id="search-input" />
                    <i class="fas fa-search" id="search-icon"></i>
                </div>
                <ul class="nav-links">
                    <li><a href="/blogs">Blog</a></li>
                    <li>
                        <button class="create-post-btn" id="loadCreatePostBtn">
                            Create Post
                        </button>
                    </li>
                </ul>
                <div class="user-profile">
                    <div id="user-button"></div>
                </div>
                <div class="dark-mode-toggle">
                    <i id="mode-icon" class="fas fa-moon"></i>
                </div>
            </div>
        </nav>
    `;

    const initializeNavbar = async () => {
        // Mount Clerk user button
        const userButtonDiv = document.getElementById('user-button');
        if (userButtonDiv) {
            Clerk.mountUserButton(userButtonDiv);
        }

        // Dark mode toggle
        const darkModeToggle = document.querySelector('.dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                const body = document.body;
                const modeIcon = document.getElementById('mode-icon');
                
                if (!body.classList.contains('dark-mode')) {
                    body.classList.add('dark-mode');
                    modeIcon.classList.remove('fa-moon');
                    modeIcon.classList.add('fa-sun');
                    localStorage.setItem('theme', 'dark');
                } else {
                    body.classList.remove('dark-mode');
                    modeIcon.classList.remove('fa-sun');
                    modeIcon.classList.add('fa-moon');
                    localStorage.setItem('theme', 'light');
                }
            });
        }

        // Create post button
        const createPostBtn = document.getElementById('loadCreatePostBtn');
        if (createPostBtn) {
            createPostBtn.addEventListener('click', async () => {
                try {
                    const createPostFormContainer = document.getElementById('createPostFormContainer');
                    if (createPostFormContainer) {
                        // Hide navbar
                        const navbar = document.querySelector('.navbar');
                        if (navbar) {
                            navbar.style.display = 'none';
                        }

                        // Get the template
                        const { template, initializeCreatePost } = createPostComponent();
                        
                        // Clear existing content and add new content
                        createPostFormContainer.innerHTML = template;
                        
                        // Show the container
                        createPostFormContainer.style.display = 'block';

                        // Initialize all required functionality
                        initializeCreatePost();
                    }
                } catch (error) {
                    console.error('Error loading create post component:', error);
                }
            });
        }

        // Set initial theme
        const savedTheme = localStorage.getItem('theme') || 'light';
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
    };

    return { template, initializeNavbar };
}