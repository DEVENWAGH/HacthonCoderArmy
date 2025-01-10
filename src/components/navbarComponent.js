import { createBlogComponent } from './createBlogComponent.js';

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
                        <button class="create-blog-btn" id="loadCreateBlogBtn">
                            Create Blog
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
            darkModeToggle.addEventListener('click', toggleDarkMode);
        }

        // Set initial theme
        setInitialTheme();

        // Create blog button
        const createBlogBtn = document.getElementById('loadCreateBlogBtn');
        if (createBlogBtn) {
            createBlogBtn.addEventListener('click', async () => {
                try {
                    const createBlogFormContainer = document.getElementById('createBlogFormContainer');
                    if (createBlogFormContainer) {
                        // Hide navbar and content
                        const navbar = document.querySelector('.navbar');
                        const content = document.getElementById('content');
                        
                        navbar.style.display = 'none';
                        content.style.display = 'none';

                        // Initialize create blog
                        const { template, initializeCreateBlog } = createBlogComponent();
                        createBlogFormContainer.innerHTML = template;
                        createBlogFormContainer.style.display = 'block';
                        
                        // Initialize blog form
                        await initializeCreateBlog();
                        
                        // Initialize editor is now part of createBlogComponent
                        if (document.getElementById('editor')) {
                            initializeTagsInput();
                        }
                    }
                } catch (error) {
                    console.error('Error loading create blog component:', error);
                }
            });
        }
    };

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
        const savedTheme = localStorage.getItem('theme') || 'light'; // Default to light theme
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


    return { template, initializeNavbar };
}