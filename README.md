# Git-Commit Storyteller 📖

A beautiful, interactive web application that visualizes and narrates the complete history of any GitHub repository in real-time. Watch commits unfold as a dynamic story with visual effects, contributor insights, and timeline controls.

## ✨ Features

- **Interactive GitHub Integration**: Load any public repository with `owner/repo` format or full GitHub URL
- **Dynamic Canvas Visualization**: 
  - Real-time commit timeline with color-coded progression
  - Orbital contributor visualization with animated stars
  - Particle effects for dynamic visual feedback
  - Pulsing animations on selected commits
- **Story Engine**: 
  - Milestone-based narrative commentary
  - Real-time contributor insights
  - Genesis and completion milestone markers
  - Dynamic story updates as you navigate
- **Timeline Playback Controls**:
  - Play/Pause button for automatic playback
  - Scrubbing with visual progress bar
  - Speed controls (0.5x, 1x, 2x, 5x)
  - Click on canvas to jump to specific commits
- **Contributor Leaderboard**:
  - Sortable top contributors by commit count
  - Medal rankings (Gold, Silver, Bronze)
  - Mini leaderboard in info panel
  - Real-time contributor statistics
- **Demo Repositories**:
  - Quick-select buttons for popular repos (React, Linux, Node.js, Hello-World)
  - Fallback demo data if API calls fail
- **GitHub API Integration**:
  - Automatic pagination for large repositories
  - Rate-limit handling and error messages
  - Graceful degradation with sample data
- **Modern Dark Theme**:
  - Glassmorphism design with translucent panels
  - Glowing accents and smooth transitions
  - Fully responsive layout (desktop, tablet, mobile)
  - Accessibility-focused color scheme

## 🚀 Quick Start

### Option 1: Deploy on GitHub Pages (Recommended)

1. **Fork or Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/Git-Commit_Storyteller.git
   cd Git-Commit_Storyteller
   ```

2. **Enable GitHub Pages**:
   - Go to **Settings → Pages** in your repository
   - Under "Build and deployment", select **Source: Deploy from a branch**
   - Select the `main` branch and `/root` folder (or just `/` if files are in root)
   - Click **Save**

3. **Access Your App**:
   - Your app will be available at: `https://yourusername.github.io/Git-Commit_Storyteller/`
   - Share the link to visualize any public GitHub repository!

### Option 2: Run Locally

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/Git-Commit_Storyteller.git
   cd Git-Commit_Storyteller
   ```

2. **Start a Local Server**:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Or using Node.js with http-server
   npx http-server

   # Or using Node.js built-in
   node -e "require('http').createServer((req, res) => {
     const fs = require('fs');
     res.end(fs.readFileSync('./index.html'));
   }).listen(8000); console.log('http://localhost:8000');"
   ```

3. **Open in Browser**:
   - Visit `http://localhost:8000`
   - Enter a repository or click a demo button

## 📋 How to Use

### Loading a Repository

1. **Enter Repository Name**:
   - Type `owner/repo` (e.g., `facebook/react`) in the input box
   - Or paste a full GitHub URL: `https://github.com/owner/repo`
   - Click **Fetch** or press **Enter**

2. **Use Demo Buttons**:
   - Click any of the quick-select demo repository buttons
   - Popular repos: React, Linux, Node.js, Hello-World

### Timeline Playback

- **Play/Pause**: Click the play button to automatically advance through commits
- **Scrubber**: Drag the timeline slider to jump to any point
- **Speed Control**: Select 0.5x, 1x (default), 2x, or 5x playback speed
- **Click Canvas**: Click on the timeline dots to jump to specific commits

### Exploring Data

- **Story HUD**: Read the narrative commentary as you navigate
- **Commit Info**: View current commit hash, author, and date
- **Top Contributors**: See the top 5 contributors in the mini leaderboard
- **Leaderboard Drawer**: Click 🏆 to open the full ranked contributor list

### Statistics

- **Total Commits**: Number of commits in the repository
- **Total Contributors**: Count of unique authors
- **Leaderboard Medals**:
  - 🥇 Gold: #1 contributor (most commits)
  - 🥈 Silver: #2 contributor
  - 🥉 Bronze: #3 contributor

## 🎨 Design Features

### Visual Elements

- **Commit Timeline**: Horizontal timeline with color-coded dots representing commits
- **Contributor Orbits**: Concentric orbital rings showing top contributors as animated stars
- **Particle Effects**: Floating particles emitted from contributor stars
- **Pulse Animation**: Animated pulse around the center representing current playback position
- **Gradient Background**: Radial gradient for depth perception

### Color Scheme

- **Dark Theme**: `#0a0e27` base with blue/purple accents
- **Accent Colors**: 
  - Primary: `#6b5eff` (purple)
  - Secondary: `#ff6b6b` (red)
  - Tertiary: `#4ecdc4` (cyan)
- **Glassmorphism**: Translucent panels with backdrop blur (10px)
- **Glow Effects**: Soft shadows and color-matched glows

## 🔧 Technical Architecture

### Frontend Stack
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS Grid, Flexbox, and filters
- **Vanilla JavaScript**: No dependencies required
- **Canvas API**: Hardware-accelerated graphics
- **GitHub REST API v3**: Repository and commit data

### Core Components

1. **GitCommitStoryteller Class**:
   - Manages application state
   - Handles API integration
   - Controls playback timeline
   - Renders canvas visualizations

2. **GitHub API Integration**:
   - Fetches commits with pagination (up to 2000 commits)
   - Automatic error handling and rate-limit detection
   - Fallback to demo data on API failure

3. **Canvas Visualizer**:
   - Real-time rendering at 60fps
   - Dynamic contributor orbits
   - Particle system for visual feedback
   - Interactive timeline with click detection

4. **Story Engine**:
   - Milestone detection (Genesis, Major Refactors, Latest)
   - Contributor peak analysis
   - Progress-based narrative generation

5. **Playback State Machine**:
   - Play/Pause management
   - Speed multiplier (0.5x-5x)
   - Timeline scrubbing with visual feedback
   - Commit jumping via canvas clicks

## 🐛 Known Limitations

- **GitHub API Rate Limits**: 
  - Unauthenticated requests: 60 per hour
  - To increase: Use GitHub personal access token in headers (requires backend)
  - Workaround: Use fallback demo data
- **Large Repositories**: 
  - Fetches up to 2000 commits for performance
  - Older commits may not be visualized
- **Private Repositories**: 
  - Requires GitHub authentication (not implemented in free version)

## 🔐 Privacy & Security

- **Client-Side Only**: All processing happens in your browser
- **No Data Storage**: Nothing is saved to servers
- **Public API**: Uses GitHub's public REST API (no authentication)
- **CORS Compatible**: Works from any domain with GitHub's CORS headers

## 📊 Performance Optimizations

- **Canvas Rendering**: Only draws changed frames during playback
- **Particle Pooling**: Limits concurrent particles to ~100
- **Commit Pagination**: Stops after 20 API pages or 2000 commits
- **Responsive Resizing**: Canvas updates only on window resize
- **CSS Animations**: GPU-accelerated transforms and transitions

## 🎯 Future Enhancements

- [ ] GitHub authentication for private repos and higher API limits
- [ ] Commit message search and filtering
- [ ] Branch visualization and switching
- [ ] Author/contributor filtering and focusing
- [ ] Export timeline as video or GIF
- [ ] Dark/Light theme toggle
- [ ] Repository comparison (side-by-side playback)
- [ ] Advanced analytics (commit frequency, code change size)
- [ ] Collaboration history and merge visualization

## 💡 Tips & Tricks

1. **Large Repos**: Start with smaller repositories for faster loading
2. **Slow Playback**: Use 0.5x speed for detailed observation
3. **Fast Review**: Use 5x speed for quick repository overview
4. **Jump Ahead**: Click directly on timeline dots to skip to specific commits
5. **API Limits**: Wait 1 hour or refresh the page after rate limits
6. **Demo Data**: The fallback demo shows realistic sample data

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Keep vanilla JavaScript (no frameworks)
- Maintain accessibility standards (WCAG 2.1 AA)
- Test on mobile and desktop
- Update README if adding features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- GitHub API for providing free access to repository data
- Inspired by interactive data visualization tools
- Built with ❤️ for the open-source community

## 📞 Support

- **Issues**: Open an issue on GitHub
- **Questions**: Start a discussion on GitHub
- **Feedback**: Create an issue with the "enhancement" label

---

**Happy storytelling! 🚀📖**

Visualize your repository's entire history in minutes. Share your project's journey with the world.
