import { gsap } from "gsap";

export function userProfileComponent() {
  const template = `
    <div class="profile-modal">
      <div class="profile-container">
        <h2>Welcome to EchoBlogs!</h2>
        <div class="profile-form">
          <div class="profile-image-container">
            <img id="profilePreview" class="profile-image" src="./user.svg" alt="Profile">
            <label for="profileUpload" class="upload-label">
              <i class="fas fa-camera"></i>
            </label>
            <input type="file" id="profileUpload" accept="image/*" hidden>
          </div>
          <input type="text" id="usernameInput" placeholder="Enter your username" maxlength="20">
          <div class="profile-actions">
            <button class="submit-profile-btn">Continue</button>
            <button class="skip-profile-btn">Skip for now</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const initializeUserProfile = () => {
    const modal = document.querySelector('.profile-modal');
    const profileUpload = document.getElementById('profileUpload');
    const profilePreview = document.getElementById('profilePreview');
    const usernameInput = document.getElementById('usernameInput');
    const submitBtn = document.querySelector('.submit-profile-btn');
    const skipBtn = document.querySelector('.skip-profile-btn');

    // Show modal with animation
    gsap.from(modal, {
      opacity: 0,
      y: -50,
      duration: 0.5,
      ease: "power3.out"
    });

    // Handle image upload
    profileUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          profilePreview.src = e.target.result;
          gsap.from(profilePreview, {
            scale: 0.5,
            opacity: 0,
            duration: 0.3
          });
        };
        reader.readAsDataURL(file);
      }
    });

    // Handle form submission
    submitBtn.addEventListener('click', () => {
      const username = usernameInput.value.trim();
      if (username) {
        const userData = {
          username,
          profileImage: profilePreview.src,
          isAnonymous: false
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        closeProfileModal(modal);
      }
    });

    // Handle skip
    skipBtn.addEventListener('click', () => {
      const userData = {
        username: 'Anonymous',
        profileImage: './user.svg',
        isAnonymous: true
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      closeProfileModal(modal);
    });
  };

  const closeProfileModal = (modal) => {
    gsap.to(modal, {
      opacity: 0,
      y: -50,
      duration: 0.3,
      ease: "power3.in",
      onComplete: () => {
        modal.remove();
        window.location.reload();
      }
    });
  };

  return { template, initializeUserProfile };
}
