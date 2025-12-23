import { YOUTUBE_API_KEY } from './config.js';

export class YouTubePlayer {
    constructor(containerId, playlistId) {
        this.containerId = containerId;
        this.playlistId = playlistId;
        this.player = null;
        this.searchTimeout = null;
        this.isPlayingSearch = false;
        this.apiKey = YOUTUBE_API_KEY;

        this.loadYouTubeAPI();
        this.setupSearch();
    }

    loadYouTubeAPI() {
        // Load YouTube IFrame API
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = () => {
            this.initPlayer();
        };

        // If API is already loaded
        if (window.YT && window.YT.Player) {
            this.initPlayer();
        }
    }

    initPlayer() {
        this.player = new YT.Player(this.containerId, {
            height: '100%',
            width: '100%',
            playerVars: {
                listType: 'playlist',
                list: this.playlistId,
                autoplay: 1,
                mute: 1, // Start muted
                controls: 1,
                modestbranding: 1,
                rel: 0,
                fs: 1, // Allow fullscreen
                iv_load_policy: 3, // Hide annotations
            },
            events: {
                onReady: this.onPlayerReady.bind(this),
                onStateChange: this.onPlayerStateChange.bind(this)
            }
        });
    }

    onPlayerReady(event) {
        console.log('YouTube player ready');
        event.target.playVideo();
    }

    onPlayerStateChange(event) {
        // Auto-replay playlist when it ends
        if (event.data === YT.PlayerState.ENDED && !this.isPlayingSearch) {
            this.returnToPlaylist();
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('youtube-search');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            const query = e.target.value.trim();

            if (query.length > 2) {
                this.searchTimeout = setTimeout(() => {
                    this.searchAndPlay(query);
                }, 1000); // Wait 1s after user stops typing
            } else if (query.length === 0) {
                // Return to playlist
                this.returnToPlaylist();
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                clearTimeout(this.searchTimeout);
                const query = e.target.value.trim();
                if (query.length > 0) {
                    this.searchAndPlay(query);
                }
            }
        });
    }

    async searchAndPlay(query) {
        try {
            // Check if API key is configured
            if (!this.apiKey || this.apiKey === 'YOUR_API_KEY_HERE') {
                console.warn('YouTube API key not configured. Trying URL/ID extraction...');
                const videoId = this.extractVideoId(query);
                if (videoId) {
                    this.playVideo(videoId);
                } else {
                    this.showMessage('Configure a API key para buscar por texto (veja config.js)');
                }
                return;
            }

            // First, try to extract video ID from URL
            const urlVideoId = this.extractVideoId(query);
            if (urlVideoId) {
                this.playVideo(urlVideoId);
                return;
            }

            // Use YouTube Data API v3 for text search
            const videoId = await this.searchVideos(query);

            if (videoId) {
                this.playVideo(videoId);
            } else {
                this.showMessage('Nenhum vídeo encontrado');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showMessage('Erro na busca. Verifique sua API key.');
        }
    }

    extractVideoId(query) {
        // Extract video ID from URL or direct ID
        const urlMatch = query.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
        if (urlMatch) {
            return urlMatch[1];
        }

        // Check if it's a direct video ID (11 characters, alphanumeric + - and _)
        if (/^[a-zA-Z0-9_-]{11}$/.test(query)) {
            return query;
        }

        return null;
    }

    async searchVideos(query) {
        // Buscar múltiplos vídeos com duração mínima de 10 minutos
        // videoDuration: medium (4-20 min) ou long (>20 min)
        // Fazemos 2 buscas e mesclamos os resultados para garantir vídeos com 10+ minutos

        const searchResults = [];

        // Busca vídeos médios (4-20 min) e longos (>20 min)
        for (const duration of ['medium', 'long']) {
            const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${this.apiKey}&maxResults=25&videoDuration=${duration}`;

            const response = await fetch(searchUrl);
            const data = await response.json();

            if (data.error) {
                throw new Error(`API Error: ${data.error.message}`);
            }

            if (data.items && data.items.length > 0) {
                searchResults.push(...data.items);
            }
        }

        if (searchResults.length > 0) {
            // Agora precisamos filtrar para garantir vídeos com 10+ minutos usando a API de detalhes
            const videoIds = searchResults.map(item => item.id.videoId).join(',');
            const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${this.apiKey}`;

            const detailsResponse = await fetch(detailsUrl);
            const detailsData = await detailsResponse.json();

            if (detailsData.items) {
                // Filtrar vídeos com 10+ minutos
                const validVideos = detailsData.items.filter(video => {
                    const duration = this.parseISO8601Duration(video.contentDetails.duration);
                    return duration >= 600; // 600 segundos = 10 minutos
                });

                if (validVideos.length > 0) {
                    // Selecionar um vídeo aleatório
                    const randomIndex = Math.floor(Math.random() * validVideos.length);
                    return validVideos[randomIndex].id;
                }
            }
        }

        return null;
    }

    // Função auxiliar para converter duração ISO 8601 para segundos
    parseISO8601Duration(duration) {
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return 0;

        const hours = parseInt(match[1] || 0);
        const minutes = parseInt(match[2] || 0);
        const seconds = parseInt(match[3] || 0);

        return hours * 3600 + minutes * 60 + seconds;
    }

    playVideo(videoId) {
        this.isPlayingSearch = true;
        this.player.loadVideoById(videoId);
        // Keep muted - user can unmute manually
        this.player.mute();
    }

    returnToPlaylist() {
        this.isPlayingSearch = false;
        this.player.loadPlaylist({
            listType: 'playlist',
            list: this.playlistId
        });
        this.player.mute(); // Mute playlist
        const searchInput = document.getElementById('youtube-search');
        if (searchInput) {
            searchInput.value = '';
        }
    }

    showMessage(message) {
        const searchInput = document.getElementById('youtube-search');
        if (searchInput) {
            const originalPlaceholder = searchInput.placeholder;
            searchInput.placeholder = message;
            setTimeout(() => {
                searchInput.placeholder = originalPlaceholder;
            }, 3000);
        }
    }
}
