export async function initializeClerk() {
    try {
        // Wait for Clerk to be available
        while (!window.Clerk) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('Clerk object found:', !!window.Clerk);
        
        // Get the sign-in div
        const signInDiv = document.getElementById('sign-in');
        signInDiv.style.backgroundColor = '#ffffff';
        
        // Wait for Clerk to be ready
        await new Promise(resolve => {
            if (window.Clerk.isReady) {
                resolve();
            } else {
                window.Clerk.addListener(({ isReady }) => {
                    if (isReady) {
                        resolve();
                    }
                });
            }
        });
        
        console.log('Clerk is ready');
        
        // Mount the sign-in component
        try {
            await window.Clerk.mountSignIn(signInDiv);
            console.log('Sign-in mounted successfully');
        } catch (mountError) {
            console.error('Error mounting sign-in:', mountError);
        }
        
    } catch (error) {
        console.error('Error in Clerk initialization:', error);
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: white;
                display: flex;
                justify-content: center;
                align-items: center;
                color: black;
                font-family: Arial, sans-serif;
            ">
                <div>
                    <h2>Authentication Error</h2>
                    <p>Please refresh the page to try again.</p>
                    <pre style="color: red;">${error.message}</pre>
                </div>
            </div>
        `;
    }
}

export function getUserData() {
    const clerk = window.Clerk;
    if (!clerk.user) return null;
    
    return {
        id: clerk.user.id,
        firstName: clerk.user.firstName,
        lastName: clerk.user.lastName,
        email: clerk.user.primaryEmailAddress,
        profileImage: clerk.user.profileImageUrl
    };
}

export function isAuthenticated() {
    return window.Clerk && window.Clerk.user !== null;
}
