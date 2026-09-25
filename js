/* =============================================
   Git-Commit Storyteller - Main Application
   ============================================= */

class GitCommitStoryteller {
    constructor() {
        this.canvas = document.getElementById('commit-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.commits = [];
        this.contributors = new Map();
        this.isPlaying = false;
        this.currentTime = 0;
        this.totalDuration = 0;
        this.playbackSpeed = 1;
        this.animationFrameId = null;
        this.particles = [];
        this.selectedCommitIndex = 0;

        this.initCanvas();
        this.setupEventListeners();
        this.loadDefaultRepo();
    }

    initCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    setupEventListeners() {
        // Fetch button
        document.getElementById('fetch-btn').addEventListener('click', () => {
            const input = document.getElementById('repo-input').value;
            if (input.trim()) {
                this.fetchRepository(input);
            }
        });

        // Demo buttons
        document.querySelectorAll('.btn-demo').forEach(btn => {
            btn.addEventListener('click', () => {
                const repo = btn.dataset.repo;
                document.getElementById('repo-input').value = repo;
                this.fetchRepository(repo);
            });
        });

        // Play button
        document.getElementById('play-btn').addEventListener('click', () => {
            this.togglePlayback();
        });

        // Timeline
        document.getElementById('timeline-input').addEventListener('input', (e) => {
            if (!this.isPlaying) {
                this.currentTime = (parseInt(e.target.value) / 100) * this.totalDuration;
                this.selectedCommitIndex = Math.floor((this.currentTime / this.totalDuration) * this.commits.length);
                this.updateDisplay();
                this.draw();
            }
        });

        // Speed controls
        document.querySelectorAll('.btn-speed').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.btn-speed').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.playbackSpeed = parseFloat(btn.dataset.speed);
            });
        });

        // Leaderboard
        document.getElementById('leaderboard-btn').addEventListener('click', () => {
            this.openLeaderboard();
        });

        document.getElementById('close-leaderboard').addEventListener('click', () => {
            this.closeLeaderboard();
        });

        document.getElementById('drawer-overlay').addEventListener('click', () => {
            this.closeLeaderboard();
        });

        // Canvas click to jump to commit
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.handleCanvasClick(x, y);
        });

        // Enter key in repo input
        document.getElementById('repo-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('fetch-btn').click();
            }
        });
    }

    async fetchRepository(repoInput) {
        this.showLoading(true);
        this.clearError();

        try {
            // Parse repository
            let owner, repo;
            if (repoInput.includes('/')) {
                if (repoInput.startsWith('http')) {
                    const parts = repoInput.split('/');
                    owner = parts[parts.length - 2];
                    repo = parts[parts.length - 1].replace('.git', '');
                } else {
                    [owner, repo] = repoInput.split('/');
                }
            } else {
                throw new Error('Invalid repository format. Use owner/repo');
            }

            // Fetch commits from GitHub API with pagination
            this.commits = [];
            this.contributors.clear();
            let page = 1;
            const perPage = 100;
            let allCommits = [];

            while (allCommits.length < 2000) {
                const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${perPage}&page=${page}`;

                const response = await fetch(url, {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                    },
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Repository not found');
                    } else if (response.status === 403) {
                        throw new Error('GitHub API rate limit exceeded. Please try again later.');
                    } else {
                        throw new Error(`GitHub API error: ${response.statusText}`);
                    }
                }

                const commits = await response.json();
                if (!Array.isArray(commits) || commits.length === 0) break;

                allCommits = allCommits.concat(commits);
                page++;

                // Stop after reasonable number of commits or pages
                if (page > 20) break;
            }

            // Process commits
            this.commits = allCommits.reverse().map((commit, index) => ({
                hash: commit.sha.substring(0, 7),
                fullHash: commit.sha,
                author: commit.commit.author.name || 'Unknown',
                date: new Date(commit.commit.author.date),
                message: commit.commit.message,
                timestamp: index * 1000, // ms
                index: index,
            }));

            // Count contributors
            this.commits.forEach(commit => {
                const count = (this.contributors.get(commit.author) || 0) + 1;
                this.contributors.set(commit.author, count);
            });

            this.totalDuration = Math.max(1, this.commits.length * 1000);
            this.currentTime = 0;
            this.selectedCommitIndex = 0;

            this.updateStats();
            this.updateContributorsMini();
            this.resetPlayback();
            this.draw();

            // Generate initial story
            this.updateStory();

            this.showLoading(false);
        } catch (error) {
            console.error('Error fetching repository:', error);
            this.showError(error.message);
            this.showLoading(false);
            this.loadFallbackData();
        }
    }

    loadDefaultRepo() {
        this.fetchRepository('facebook/react');
    }

    loadFallbackData() {
        // Fallback demo data
        const authors = ['Alice Developer', 'Bob Coder', 'Charlie Debugger', 'Diana Designer', 'Eve Engineer'];
        this.commits = [];
        this.contributors.clear();

        for (let i = 0; i < 100; i++) {
            const author = authors[i % authors.length];
            this.commits.push({
                hash: `abc${i.toString().padStart(4, '0')}`,
                fullHash: `abc${i.toString().padStart(10, '0')}`,
                author: author,
                date: new Date(Date.now() - (100 - i) * 86400000),
                message: `Commit ${i}: Update feature ${Math.floor(i / 10)}`,
                timestamp: i * 1000,
                index: i,
            });

            const count = (this.contributors.get(author) || 0) + 1;
            this.contributors.set(author, count);
        }

        this.totalDuration = Math.max(1, this.commits.length * 1000);
        this.currentTime = 0;
        this.selectedCommitIndex = 0;

        this.updateStats();
        this.updateContributorsMini();
        this.resetPlayback();
        this.draw();
        this.updateStory();
    }

    updateStats() {
        document.getElementById('total-commits').textContent = this.commits.length;
        document.getElementById('total-contributors').textContent = this.contributors.size;
    }

    updateContributorsMini() {
        const container = document.getElementById('contributors-mini');
        const sorted = Array.from(this.contributors.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (sorted.length === 0) {
            container.innerHTML = '<div class="empty-state">No contributors yet</div>';
            return;
        }

        container.innerHTML = sorted
            .map(([name, count]) => `
                <div class="contributor-mini">
                    <span class="contributor-mini-name">${this.escapeHtml(name)}</span>
                    <span class="contributor-mini-count">${count}</span>
                </div>
            `)
            .join('');
    }

    updateDisplay() {
        if (this.commits.length === 0) return;

        const commit = this.commits[this.selectedCommitIndex];
        document.getElementById('commit-hash').textContent = commit.fullHash;
        document.getElementById('commit-author').textContent = commit.author;
        document.getElementById('commit-date').textContent = commit.date.toLocaleDateString();

        const progress = (this.currentTime / this.totalDuration) * 100;
        document.getElementById('timeline-input').value = progress;
        document.getElementById('timeline-progress').style.width = `${progress}%`;

        const minutes = Math.floor(this.currentTime / 60000);
        const seconds = Math.floor((this.currentTime % 60000) / 1000);
        document.getElementById('current-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        const totalMinutes = Math.floor(this.totalDuration / 60000);
        const totalSeconds = Math.floor((this.totalDuration % 60000) / 1000);
        document.getElementById('total-time').textContent = `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
    }

    updateStory() {
        if (this.commits.length === 0) return;

        const commit = this.commits[this.selectedCommitIndex];
        const progress = (this.selectedCommitIndex / this.commits.length) * 100;

        let title = 'Repository Timeline';
        let text = commit.message.split('\n')[0];
        let meta = `Commit ${this.selectedCommitIndex + 1} of ${this.commits.length}`;

        // Generate milestone commentary
        if (this.selectedCommitIndex === 0) {
            title = '🌱 Genesis Commit';
            text = 'The beginning of everything. ' + text;
        } else if (this.selectedCommitIndex === this.commits.length - 1) {
            title = '🎉 Latest Commit';
            text = 'The latest addition to the project. ' + text;
        } else if (progress < 10) {
            title = '🚀 Early Days';
            text = 'The project is taking shape. ' + text;
        } else if (progress > 90) {
            title = '📚 Towards Completion';
            text = 'The project is nearly complete. ' + text;
        } else if (this.selectedCommitIndex % 25 === 0) {
            title = '✨ Milestone Reached';
            text = 'Significant progress has been made. ' + text;
        }

        // Contributor analysis
        const topContributor = Array.from(this.contributors.entries())
            .sort((a, b) => b[1] - a[1])[0];

        if (topContributor) {
            meta += ` | Top Contributor: ${topContributor[0]} (${topContributor[1]} commits)`;
        }

        document.getElementById('story-title').textContent = title;
        document.getElementById('story-text').textContent = text;
        document.getElementById('story-meta').textContent = meta;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.commits.length === 0) {
            this.drawNoData();
            return;
        }

        // Draw gradient background
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2,
            this.canvas.height / 2,
            0,
            this.canvas.width / 2,
            this.canvas.height / 2,
            Math.max(this.canvas.width, this.canvas.height)
        );
        gradient.addColorStop(0, 'rgba(59, 89, 192, 0.1)');
        gradient.addColorStop(1, 'rgba(10, 14, 39, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw timeline
        this.drawTimeline();

        // Draw contributor orbits and pulses
        this.drawContributorOrbits();

        // Draw particles
        this.updateAndDrawParticles();

        // Draw selected commit highlight
        this.drawSelectedCommitPulse();
    }

    drawNoData() {
        this.ctx.fillStyle = 'rgba(224, 230, 255, 0.3)';
        this.ctx.font = '16px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Load a repository to visualize its history', this.canvas.width / 2, this.canvas.height / 2);
    }

    drawTimeline() {
        const padding = 60;
        const timelineY = this.canvas.height - 80;
        const timelineWidth = this.canvas.width - 2 * padding;

        // Draw timeline base
        this.ctx.strokeStyle = 'rgba(139, 169, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(padding, timelineY);
        this.ctx.lineTo(padding + timelineWidth, timelineY);
        this.ctx.stroke();

        // Draw commit points
        const commitSpacing = timelineWidth / Math.max(1, this.commits.length - 1);

        this.commits.forEach((commit, index) => {
            const x = padding + index * commitSpacing;
            const isSelected = index === this.selectedCommitIndex;
            const commitProgress = index / this.commits.length;

            // Color gradient based on position
            const hue = (commitProgress * 360) % 360;
            this.ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;

            if (isSelected) {
                this.ctx.fillStyle = '#6b5eff';
                this.ctx.shadowColor = 'rgba(107, 94, 255, 0.8)';
                this.ctx.shadowBlur = 20;
            }

            this.ctx.beginPath();
            this.ctx.arc(x, timelineY, isSelected ? 6 : 3, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.shadowColor = 'transparent';
        });
    }

    drawContributorOrbits() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) - 100;

        // Get sorted contributors
        const sorted = Array.from(this.contributors.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);

        sorted.forEach((entry, i) => {
            const [author, count] = entry;
            const orbitalRadius = maxRadius * (0.3 + (i / sorted.length) * 0.6);
            const orbitProgress = (this.selectedCommitIndex / this.commits.length) * Math.PI * 2;
            const dotX = centerX + Math.cos(orbitProgress + (i * Math.PI * 2 / sorted.length)) * orbitalRadius;
            const dotY = centerY + Math.sin(orbitProgress + (i * Math.PI * 2 / sorted.length)) * orbitalRadius;

            // Draw orbit
            this.ctx.strokeStyle = `rgba(139, 169, 255, ${0.1 + (i * 0.08)})`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, orbitalRadius, 0, Math.PI * 2);
            this.ctx.stroke();

            // Draw star
            const size = 3 + (count / sorted[0][1]) * 5;
            this.ctx.fillStyle = `hsl(${(i * 45) % 360}, 100%, 50%)`;
            this.ctx.shadowColor = `hsla(${(i * 45) % 360}, 100%, 50%, 0.6)`;
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            this.ctx.arc(dotX, dotY, size, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.shadowColor = 'transparent';

            // Emit particles
            if (Math.random() < 0.02) {
                this.particles.push({
                    x: dotX,
                    y: dotY,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life: 1,
                    color: `hsla(${(i * 45) % 360}, 100%, 50%, 0.6)`,
                });
            }
        });
    }

    updateAndDrawParticles() {
        this.particles = this.particles.filter(p => p.life > 0);

        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            particle.vy += 0.1; // gravity

            this.ctx.fillStyle = particle.color.replace('0.6', particle.life * 0.6);
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 1.5, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawSelectedCommitPulse() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const pulseSize = 30 + Math.sin(Date.now() / 300) * 10;

        this.ctx.strokeStyle = 'rgba(107, 94, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    handleCanvasClick(x, y) {
        const padding = 60;
        const timelineY = this.canvas.height - 80;
        const timelineWidth = this.canvas.width - 2 * padding;
        const clickThreshold = 15;

        const commitSpacing = timelineWidth / Math.max(1, this.commits.length - 1);

        for (let i = 0; i < this.commits.length; i++) {
            const commitX = padding + i * commitSpacing;
            const distance = Math.abs(x - commitX) + Math.abs(y - timelineY);

            if (distance < clickThreshold) {
                this.selectedCommitIndex = i;
                this.currentTime = (i / this.commits.length) * this.totalDuration;
                this.updateDisplay();
                this.updateStory();
                this.draw();
                return;
            }
        }
    }

    togglePlayback() {
        this.isPlaying = !this.isPlaying;
        const btn = document.getElementById('play-btn');

        if (this.isPlaying) {
            btn.querySelector('.icon').textContent = '⏸';
            this.animate();
        } else {
            btn.querySelector('.icon').textContent = '▶';
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
        }
    }

    animate() {
        this.currentTime += 16 * this.playbackSpeed;

        if (this.currentTime >= this.totalDuration) {
            this.currentTime = this.totalDuration;
            this.isPlaying = false;
            document.getElementById('play-btn').querySelector('.icon').textContent = '▶';
        } else {
            this.selectedCommitIndex = Math.floor(
                (this.currentTime / this.totalDuration) * this.commits.length
            );
            this.animationFrameId = requestAnimationFrame(() => this.animate());
        }

        this.updateDisplay();
        this.updateStory();
        this.draw();
    }

    resetPlayback() {
        this.isPlaying = false;
        this.currentTime = 0;
        this.selectedCommitIndex = 0;
        document.getElementById('play-btn').querySelector('.icon').textContent = '▶';
    }

    openLeaderboard() {
        const drawer = document.getElementById('leaderboard-drawer');
        const overlay = document.getElementById('drawer-overlay');

        drawer.classList.remove('hidden');
        overlay.classList.remove('hidden');

        this.populateLeaderboard();
    }

    closeLeaderboard() {
        const drawer = document.getElementById('leaderboard-drawer');
        const overlay = document.getElementById('drawer-overlay');

        drawer.classList.add('hidden');
        overlay.classList.add('hidden');
    }

    populateLeaderboard() {
        const sorted = Array.from(this.contributors.entries())
            .sort((a, b) => b[1] - a[1]);

        const list = document.getElementById('leaderboard-list');

        if (sorted.length === 0) {
            list.innerHTML = '<div class="empty-state">No contributors yet</div>';
            return;
        }

        list.innerHTML = sorted
            .map((entry, index) => {
                const [name, count] = entry;
                let rankClass = '';

                if (index === 0) rankClass = 'gold';
                else if (index === 1) rankClass = 'silver';
                else if (index === 2) rankClass = 'bronze';

                return `
                    <div class="leaderboard-item">
                        <div class="leaderboard-rank ${rankClass}">
                            ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </div>
                        <div class="leaderboard-info">
                            <div class="leaderboard-name">${this.escapeHtml(name)}</div>
                            <div class="leaderboard-commits">Commits</div>
                        </div>
                        <div class="leaderboard-count">${count}</div>
                    </div>
                `;
            })
            .join('');
    }

    showLoading(show) {
        const spinner = document.getElementById('loading-spinner');
        if (show) {
            spinner.classList.remove('hidden');
        } else {
            spinner.classList.add('hidden');
        }
    }

    showError(message) {
        const errorEl = document.getElementById('error-message');
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }

    clearError() {
        const errorEl = document.getElementById('error-message');
        errorEl.classList.add('hidden');
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GitCommitStoryteller();
});
