export function footerComponent() {
  const template = `
    <footer class="footer">
      <div class="footer-container">
        <p>&copy; 2024 EchoBlogs. All rights reserved.</p>
      </div>
    </footer>
  `;

  const initializeFooter = () => {
    const updateFooterTheme = () => {
      const footer = document.querySelector('.footer-container');
      if (document.body.classList.contains('dark-mode')) {
        footer.style.backgroundColor = '#000000';
        footer.style.color = '#fff';
        footer.style.borderTop = '1px solid #fff';
      } else {
        footer.style.backgroundColor = '#ffffff';
        footer.style.color = '#000';
        footer.style.borderTop = '1px solid #000';
      }
    };

    // Initial theme setup
    updateFooterTheme();

    // Update on theme change
    document.body.addEventListener('click', (e) => {
      if (e.target.closest('.dark-mode-toggle')) {
        updateFooterTheme();
      }
    });
  };

  return { template, initializeFooter };
}
