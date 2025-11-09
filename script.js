// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Video data (in a real scenario, this would come from an API)
    const videoData = [
        {
            id: 1,
            title: "10 Windows Shortcuts You Need to Know",
            description: "Boost your productivity with these essential Windows keyboard shortcuts.",
            thumbnail: "windows-shortcuts"
        },
        {
            id: 2,
            title: "Smartphone Battery Saving Tips",
            description: "Extend your phone's battery life with these simple settings adjustments.",
            thumbnail: "battery-tips"
        },
        {
            id: 3,
            title: "Secure Your Online Accounts",
            description: "Learn how to protect your digital identity with strong security practices.",
            thumbnail: "online-security"
        },
        {
            id: 4,
            title: "Hidden Google Search Features",
            description: "Discover powerful Google search tricks that most people don't know about.",
            thumbnail: "google-tricks"
        },
        {
            id: 5,
            title: "Speed Up Your Computer in 5 Minutes",
            description: "Simple steps to make your computer run faster without spending money.",
            thumbnail: "speed-up-pc"
        },
        {
            id: 6,
            title: "Essential Smartphone Apps for Productivity",
            description: "The must-have apps that will help you get more done on your phone.",
            thumbnail: "productivity-apps"
        }
    ];

    const videoGrid = document.querySelector('.video-grid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    let displayedVideos = 3;

    // Function to create video cards
    function createVideoCard(video) {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
            <div class="video-thumbnail">${video.thumbnail}</div>
            <div class="video-info">
                <h3>${video.title}</h3>
                <p>${video.description}</p>
            </div>
        `;
        card.addEventListener('click', function() {
            // In a real implementation, this would open the video
            alert(`Opening: ${video.title}`);
        });
        return card;
    }

    // Function to display videos
    function displayVideos() {
        // Clear existing videos
        videoGrid.innerHTML = '';
        
        // Display videos up to the current limit
        for (let i = 0; i < Math.min(displayedVideos, videoData.length); i++) {
            const videoCard = createVideoCard(videoData[i]);
            videoGrid.appendChild(videoCard);
        }
        
        // Hide load more button if all videos are displayed
        if (displayedVideos >= videoData.length) {
            loadMoreBtn.style.display = 'none';
        }
    }

    // Load more videos function
    function loadMoreVideos() {
        displayedVideos += 3;
        displayVideos();
    }

    // Contact form submission
    const messageForm = document.getElementById('messageForm');
    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        // In a real implementation, this would send the data to a server
        alert(`Thank you for your message, ${name}! We'll get back to you soon.`);
        
        // Reset form
        messageForm.reset();
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a, .cta-buttons a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Initialize the page
    displayVideos();
    loadMoreBtn.addEventListener('click', loadMoreVideos);
});
