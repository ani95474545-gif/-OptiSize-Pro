// Application State
class StreamTubeApp {
    constructor() {
        this.currentUser = null;
        this.currentVideo = null;
        this.videos = this.loadVideos();
        this.users = this.loadUsers();
        this.subscriptions = this.loadSubscriptions();
        this.init();
    }

    // Initialize the application
    init() {
        this.setupEventListeners();
        this.renderVideos();
        this.checkAuthStatus();
    }

    // Load data from localStorage
    loadVideos() {
        const savedVideos = localStorage.getItem('streamtube_videos');
        if (savedVideos) {
            return JSON.parse(savedVideos);
        }
        
        // Default sample videos
        return [
            {
                id: 1,
                title: "How to Build a YouTube Clone with HTML, CSS & JavaScript",
                channel: "Web Dev Tutorials",
                views: "125K",
                date: "2 days ago",
                duration: "15:30",
                thumbnail: "https://placehold.co/600x400/cc0000/white?text=Web+Dev+Tutorial",
                description: "In this comprehensive tutorial, we'll build a fully functional YouTube-like video platform using only HTML, CSS, and JavaScript. Learn how to create a responsive layout, implement video playback, and add interactive features like comments and likes.",
                likes: 1250,
                dislikes: 25,
                comments: [
                    { id: 1, user: "JohnDoe", text: "Great tutorial! Very helpful for beginners.", timestamp: "2 hours ago" },
                    { id: 2, user: "CodeMaster", text: "Thanks for sharing this! The UI looks amazing.", timestamp: "1 day ago" }
                ],
                channelAvatar: "W"
            },
            {
                id: 2,
                title: "Amazing Nature Scenery - 4K UHD Relaxation Video",
                channel: "Nature Lovers",
                views: "2.1M",
                date: "3 weeks ago",
                duration: "10:45",
                thumbnail: "https://placehold.co/600x400/006600/white?text=Nature+Scenery",
                description: "Enjoy breathtaking nature scenery from around the world in stunning 4K resolution. Perfect for relaxation, meditation, or as a background video. Features mountains, forests, and waterfalls.",
                likes: 45200,
                dislikes: 320,
                comments: [
                    { id: 1, user: "NatureFan", text: "So beautiful! Where was this filmed?", timestamp: "1 week ago" }
                ],
                channelAvatar: "N"
            },
            {
                id: 3,
                title: "Top 10 Programming Languages to Learn in 2023",
                channel: "Tech Insights",
                views: "850K",
                date: "1 month ago",
                duration: "12:20",
                thumbnail: "https://placehold.co/600x400/000066/white?text=Programming+Guide",
                description: "Discover the most popular programming languages in 2023 and which ones you should learn to boost your career. We cover JavaScript, Python, Go, Rust, and more.",
                likes: 9800,
                dislikes: 150,
                comments: [
                    { id: 1, user: "DevStudent", text: "Python is definitely the way to go!", timestamp: "3 weeks ago" },
                    { id: 2, user: "JavaFan", text: "What about Java? It's still widely used in enterprise applications.", timestamp: "2 weeks ago" }
                ],
                channelAvatar: "T"
            },
            {
                id: 4,
                title: "Cooking Pasta Carbonara - Authentic Italian Recipe",
                channel: "Chef's Kitchen",
                views: "350K",
                date: "5 days ago",
                duration: "8:15",
                thumbnail: "https://placehold.co/600x400/663300/white?text=Cooking+Demo",
                description: "Learn how to make authentic Italian pasta carbonara with this simple step-by-step recipe. We'll show you the traditional method with eggs, cheese, and pancetta.",
                likes: 7200,
                dislikes: 45,
                comments: [
                    { id: 1, user: "FoodLover", text: "Tried this recipe and it was delicious! My family loved it.", timestamp: "2 days ago" }
                ],
                channelAvatar: "C"
            },
            {
                id: 5,
                title: "Epic Gaming Moments - Best Plays of the Week",
                channel: "Pro Gamer",
                views: "1.2M",
                date: "2 weeks ago",
                duration: "6:40",
                thumbnail: "https://placehold.co/600x400/660066/white?text=Gaming+Highlights",
                description: "Check out these incredible gaming moments from our latest stream. Featuring amazing plays, funny moments, and epic wins. Don't forget to like and subscribe!",
                likes: 25600,
                dislikes: 420,
                comments: [
                    { id: 1, user: "GamerFan", text: "That headshot at 3:20 was insane!", timestamp: "1 week ago" },
                    { id: 2, user: "StreamWatcher", text: "When is your next stream? Can't wait!", timestamp: "5 days ago" }
                ],
                channelAvatar: "P"
            },
            {
                id: 6,
                title: "Travel Vlog: Exploring Tokyo's Hidden Gems",
                channel: "World Traveler",
                views: "890K",
                date: "3 months ago",
                duration: "18:30",
                thumbnail: "https://placehold.co/600x400/006666/white?text=Travel+Vlog",
                description: "Join me as I explore the vibrant streets of Tokyo, Japan. From the famous Shibuya crossing to hidden traditional temples and the best local food spots.",
                likes: 15200,
                dislikes: 180,
                comments: [
                    { id: 1, user: "TravelBug", text: "Tokyo is on my bucket list! Thanks for the amazing tour.", timestamp: "2 months ago" }
                ],
                channelAvatar: "W"
            }
        ];
    }

    loadUsers() {
        const savedUsers = localStorage.getItem('streamtube_users');
        return savedUsers ? JSON.parse(savedUsers) : [];
    }

    loadSubscriptions() {
        const savedSubs = localStorage.getItem('streamtube_subscriptions');
        return savedSubs ? JSON.parse(savedSubs) : {};
    }

    // Save data to localStorage
    saveVideos() {
        localStorage.setItem('streamtube_videos', JSON.stringify(this.videos));
    }

    saveUsers() {
        localStorage.setItem('streamtube_users', JSON.stringify(this.users));
    }

    saveSubscriptions() {
        localStorage.setItem('streamtube_subscriptions', JSON.stringify(this.subscriptions));
    }

    // Authentication methods
    signUp(username, email, password) {
        // Check if user already exists
        if (this.users.find(user => user.email === email)) {
            throw new Error('User with this email already exists');
        }

        const newUser = {
            id: Date.now(),
            username,
            email,
            password, // In a real app, this would be hashed
            joinedDate: new Date().toISOString(),
            avatar: username.charAt(0).toUpperCase()
        };

        this.users.push(newUser);
        this.saveUsers();

        this.currentUser = newUser;
        localStorage.setItem('streamtube_current_user', JSON.stringify(newUser));

        return newUser;
    }

    signIn(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        this.currentUser = user;
        localStorage.setItem('streamtube_current_user', JSON.stringify(user));

        return user;
    }

    signOut() {
        this.currentUser = null;
        localStorage.removeItem('streamtube_current_user');
    }

    checkAuthStatus() {
        const savedUser = localStorage.getItem('streamtube_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUIForAuth();
        }
    }

    // Video methods
    uploadVideo(title, description, category) {
        if (!this.currentUser) {
            throw new Error('You must be logged in to upload videos');
        }

        const thumbnailColors = ['cc0000', '006600', '000066', '663300', '660066', '006666'];
        const randomColor = thumbnailColors[Math.floor(Math.random() * thumbnailColors.length)];
        const thumbnailText = title.substring(0, 20) + (title.length > 20 ? '...' : '');

        const newVideo = {
            id: Date.now(),
            title,
            channel: this.currentUser.username,
            views: '0',
            date: 'Just now',
            duration: '10:00',
            thumbnail: `https://placehold.co/600x400/${randomColor}/white?text=${encodeURIComponent(thumbnailText)}`,
            description,
            category,
            likes: 0,
            dislikes: 0,
            comments: [],
            channelAvatar: this.currentUser.avatar
        };

        this.videos.unshift(newVideo);
        this.saveVideos();

        return newVideo;
    }

    likeVideo(videoId) {
        const video = this.videos.find(v => v.id === videoId);
        if (video) {
            video.likes++;
            this.saveVideos();
        }
    }

    dislikeVideo(videoId) {
        const video = this.videos.find(v => v.id === videoId);
        if (video) {
            video.dislikes++;
            this.saveVideos();
        }
    }

    addComment(videoId, text) {
        const video = this.videos.find(v => v.id === videoId);
        if (video && this.currentUser) {
            const newComment = {
                id: Date.now(),
                user: this.currentUser.username,
                text,
                timestamp: 'Just now'
            };

            if (!video.comments) {
                video.comments = [];
            }

            video.comments.unshift(newComment);
            this.saveVideos();

            return newComment;
        }
    }

    toggleSubscription(channel) {
        if (this.subscriptions[channel]) {
            delete this.subscriptions[channel];
        } else {
            this.subscriptions[channel] = true;
        }
        this.saveSubscriptions();
        return this.subscriptions[channel];
    }

    // UI Methods
    renderVideos() {
        const videoGrid = document.getElementById('video-grid');
        if (!videoGrid) return;

        videoGrid.innerHTML = this.videos.map(video => `
            <div class="video-card" data-video-id="${video.id}">
                <div class="thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}">
                    <div class="video-duration">${video.duration}</div>
                </div>
                <div class="video-info">
                    <div class="channel-avatar">${video.channelAvatar}</div>
                    <div class="video-details">
                        <h3 class="video-title">${video.title}</h3>
                        <div class="channel-name">${video.channel}</div>
                        <div class="video-stats">${video.views} views • ${video.date}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderVideoModal(videoId) {
        const video = this.videos.find(v => v.id === videoId);
        if (!video) return;

        this.currentVideo = video;

        // Update modal content
        document.getElementById('video-modal-title').textContent = video.title;
        document.getElementById('video-views').textContent = `${video.views} views`;
        document.getElementById('video-date').textContent = video.date;
        document.getElementById('like-count').textContent = this.formatCount(video.likes);
        document.getElementById('dislike-count').textContent = this.formatCount(video.dislikes);
        document.getElementById('channel-avatar').textContent = video.channelAvatar;
        document.getElementById('channel-name').textContent = video.channel;
        document.getElementById('channel-subs').textContent = `${this.formatCount(Math.floor(Math.random() * 1000) + 1)} subscribers`;
        document.getElementById('video-description-text').textContent = video.description;

        // Update comment user avatar
        const commentUserAvatar = document.getElementById('comment-user-avatar');
        if (this.currentUser) {
            commentUserAvatar.textContent = this.currentUser.avatar;
        } else {
            commentUserAvatar.textContent = 'U';
        }

        // Render comments
        this.renderComments(video.comments);

        // Update subscribe button
        const subscribeBtn = document.getElementById('subscribe-btn');
        if (this.subscriptions[video.channel]) {
            subscribeBtn.textContent = 'Subscribed';
            subscribeBtn.classList.add('subscribed');
        } else {
            subscribeBtn.textContent = 'Subscribe';
            subscribeBtn.classList.remove('subscribed');
        }

        // Show modal
        this.showModal('video-modal');
    }

    renderComments(comments) {
        const commentsList = document.getElementById('comments-list');
        if (!commentsList) return;

        if (!comments || comments.length === 0) {
            commentsList.innerHTML = '<p style="color: var(--gray); text-align: center; padding: 2rem;">No comments yet. Be the first to comment!</p>';
            return;
        }

        commentsList.innerHTML = comments.map(comment => `
            <div class="comment">
                <div class="comment-avatar">${comment.user.charAt(0)}</div>
                <div class="comment-content">
                    <div class="comment-author">${comment.user} <span style="color: var(--gray); font-size: 0.8rem; margin-left: 0.5rem;">${comment.timestamp}</span></div>
                    <div class="comment-text">${comment.text}</div>
                    <div class="comment-actions">
                        <button class="comment-action">
                            <i class="fas fa-thumbs-up"></i> <span>0</span>
                        </button>
                        <button class="comment-action">
                            <i class="fas fa-thumbs-down"></i> <span>0</span>
                        </button>
                        <button class="comment-action">Reply</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateUIForAuth() {
        const authTrigger = document.getElementById('auth-trigger');
        const userProfile = document.getElementById('user-profile');
        const uploadBtn = document.getElementById('upload-btn');

        if (this.currentUser) {
            authTrigger.style.display = 'none';
            userProfile.style.display = 'flex';
            userProfile.textContent = this.currentUser.avatar;
            userProfile.title = this.currentUser.username;
            uploadBtn.style.display = 'flex';
        } else {
            authTrigger.style.display = 'flex';
            userProfile.style.display = 'none';
            uploadBtn.style.display = 'flex';
        }
    }

    formatCount(count) {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count.toString();
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    // Event Listeners
    setupEventListeners() {
        // Auth triggers
        document.getElementById('auth-trigger').addEventListener('click', () => {
            this.showModal('auth-overlay');
        });

        document.getElementById('close-auth').addEventListener('click', () => {
            this.hideModal('auth-overlay');
        });

        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                
                // Update tabs
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update forms
                document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
                document.getElementById(`${tabName}-form`).classList.add('active');
            });
        });

        // Auth forms
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        // Upload
        document.getElementById('upload-btn').addEventListener('click', () => {
            if (!this.currentUser) {
                this.showModal('auth-overlay');
                return;
            }
            this.showModal('upload-modal');
        });

        document.getElementById('upload-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUpload();
        });

        document.getElementById('cancel-upload').addEventListener('click', () => {
            this.hideModal('upload-modal');
        });

        document.getElementById('close-upload').addEventListener('click', () => {
            this.hideModal('upload-modal');
        });

        // Video modal
        document.getElementById('close-video').addEventListener('click', () => {
            this.hideModal('video-modal');
        });

        // Video actions
        document.getElementById('like-btn').addEventListener('click', () => {
            if (this.currentVideo) {
                this.likeVideo(this.currentVideo.id);
                document.getElementById('like-count').textContent = this.formatCount(this.currentVideo.likes);
            }
        });

        document.getElementById('dislike-btn').addEventListener('click', () => {
            if (this.currentVideo) {
                this.dislikeVideo(this.currentVideo.id);
                document.getElementById('dislike-count').textContent = this.formatCount(this.currentVideo.dislikes);
            }
        });

        document.getElementById('share-btn').addEventListener('click', () => {
            if (this.currentVideo) {
                this.shareVideo();
            }
        });

        document.getElementById('subscribe-btn').addEventListener('click', () => {
            if (this.currentVideo) {
                const isSubscribed = this.toggleSubscription(this.currentVideo.channel);
                const subscribeBtn = document.getElementById('subscribe-btn');
                
                if (isSubscribed) {
                    subscribeBtn.textContent = 'Subscribed';
                    subscribeBtn.classList.add('subscribed');
                } else {
                    subscribeBtn.textContent = 'Subscribe';
                    subscribeBtn.classList.remove('subscribed');
                }
            }
        });

        // Comments
        document.getElementById('comment-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                this.handleAddComment(e.target.value.trim());
                e.target.value = '';
            }
        });

        // Video grid
        document.addEventListener('click', (e) => {
            
