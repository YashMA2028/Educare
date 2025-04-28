// Theme toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle setup
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    
    // Function to set theme
    function setTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('theme', themeName);
        
        // Update toggle switch position
        if (toggleSwitch) {
            toggleSwitch.checked = themeName === 'dark';
        }
    }
    
    // Function to toggle theme
    function toggleTheme() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        if (currentTheme === 'light') {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    }
    
    // Event listener for toggle switch
    if (toggleSwitch) {
        toggleSwitch.addEventListener('change', toggleTheme);
    }
    
    // Check for saved theme preference or respect OS preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        // If we have a saved preference, use it
        setTheme(savedTheme);
    } else {
        // Otherwise check for OS preference
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        
        if (prefersDarkScheme.matches) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
        
        // Listen for OS preference changes
        prefersDarkScheme.addEventListener('change', (e) => {
            setTheme(e.matches ? 'dark' : 'light');
        });
    }

    // Add quick toggle with keyboard shortcut (Alt+T)
    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key === 't') {
            toggleTheme();
            
            // Show toast notification for theme change
            const toast = document.createElement('div');
            toast.className = 'theme-toast';
            toast.innerText = `Switched to ${localStorage.getItem('theme')} mode`;
            document.body.appendChild(toast);
            
            // Remove toast after 3 seconds
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 500);
            }, 2500);
        }
    });

    // Add toast style
    const style = document.createElement('style');
    style.textContent = `
        .theme-toast {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--primary-color);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            opacity: 1;
            transition: opacity 0.5s ease;
        }
    `;
    document.head.appendChild(style);
});