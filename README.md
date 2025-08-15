# MindAidPro - Frontend

A comprehensive mental health support application built with HTML, CSS, and JavaScript. This frontend provides a complete suite of mental health tools and connects to the MindAidPro backend for AI-powered conversations.

## 🌟 Features

### Core Features
- **💬 AI Chat** - Compassionate AI assistant for mental health support
- **😊 Mood Tracking** - Daily mood logging with visual charts
- **📔 Digital Journal** - Secure journaling with backend storage
- **🙏 Gratitude Practice** - Daily gratitude logging
- **😴 Sleep Tracking** - Sleep pattern monitoring
- **🎯 Goal Setting** - Personal goal management and tracking

### Specialized Tools
- **🧘 Meditation** - Guided meditation sessions and timers
- **✨ Affirmations** - Daily positive affirmations
- **🧠 CBT Tools** - Cognitive Behavioral Therapy exercises
- **⏱️ Anxiety Relief** - Breathing exercises and anxiety timers
- **🚨 Emergency Resources** - Crisis support and helplines
- **💌 Feedback** - User feedback collection

## 🎨 Design Features

- **Responsive Design** - Mobile-first approach with hamburger navigation
- **Modern UI** - Clean, professional interface with consistent branding
- **Dark Mode** - Theme toggle for comfortable viewing
- **Accessibility** - User-friendly navigation and interactions
- **Cross-Browser Compatible** - Works on all modern browsers

## 🛠 Technology Stack

- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with flexbox and grid
- **Vanilla JavaScript** - No frameworks, pure JS for performance
- **Chart.js** - Data visualization for mood tracking
- **Responsive CSS** - Mobile-optimized layouts

## 🚀 Getting Started

### Prerequisites
- Modern web browser
- Backend server (see [MindAidPro Backend](https://github.com/mohamednizar17/MindAidPro-backend))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mohamednizar17/MindAidPro1.git
   cd MindAidPro1
   ```

2. **Serve the files**
   
   **Option 1: Python HTTP Server**
   ```bash
   python -m http.server 8080
   ```
   
   **Option 2: Node.js HTTP Server**
   ```bash
   npx http-server -p 8080
   ```
   
   **Option 3: Live Server (VS Code Extension)**
   - Install Live Server extension
   - Right-click `index.html` and select "Open with Live Server"

3. **Access the application**
   - Open your browser and go to `http://localhost:8080`
   - Or use the served URL from your chosen method

## 📱 Mobile Support

The application is fully responsive with special mobile features:

- **Hamburger Menu** - Collapsible navigation for mobile screens
- **Touch-Friendly** - Optimized for touch interactions
- **Responsive Layout** - Adapts to all screen sizes
- **Fast Loading** - Optimized for mobile networks

## 🔗 Backend Integration

This frontend connects to the MindAidPro backend for:

- **AI Chat API** - Real-time conversations with AI assistant
- **Data Storage** - Journal entries, goals, and user data
- **User Authentication** - Secure login and registration
- **Analytics** - Usage tracking and insights

### Backend Configuration

The frontend is configured to connect to:
- **Production**: `https://mindaidpro-backend.onrender.com`
- **Development**: Update URLs in JavaScript files for local development

## 📁 File Structure

```
├── index.html              # Main landing page with AI chat
├── auth.html               # User authentication
├── mood.html               # Mood tracking with charts
├── journal.html            # Digital journaling
├── gratitude.html          # Gratitude practice
├── sleep.html              # Sleep tracking
├── goals.html              # Goal management
├── meditation.html         # Meditation tools
├── affirmations.html       # Daily affirmations
├── cbt.html                # CBT exercises
├── anxiety.html            # Anxiety relief tools
├── emergency.html          # Crisis resources
├── feedback.html           # User feedback
├── settings.html           # App settings
├── test-connection.html    # Backend connectivity test
├── styles.css              # Global styles
├── script.js               # Global JavaScript
├── auth-styles.css         # Authentication styles
├── auth-script.js          # Authentication logic
└── pages/                  # Additional page components
```

## 🎯 Key Components

### Navigation System
- **Desktop**: Sidebar navigation with icons
- **Mobile**: Hamburger menu with slide-out panel
- **Consistent**: Same navigation across all pages

### Chat Interface
- **Real-time messaging** with AI assistant
- **Quick reply buttons** for common concerns
- **Message history** with export functionality
- **Sentiment analysis** integration

### Data Visualization
- **Mood charts** using Chart.js
- **Progress tracking** for goals and habits
- **Visual feedback** for user engagement

## 🔒 Security Features

- **HTTPS Ready** - Secure communication with backend
- **Input Validation** - Client-side data validation
- **Error Handling** - Graceful error management
- **Privacy Focused** - No unnecessary data collection

## 🌍 Deployment

### Static Hosting Options

1. **Netlify**
   ```bash
   # Connect your GitHub repo to Netlify
   # Auto-deploy on commits
   ```

2. **Vercel**
   ```bash
   vercel --prod
   ```

3. **GitHub Pages**
   ```bash
   # Enable GitHub Pages in repository settings
   # Choose source: main branch
   ```

4. **Surge.sh**
   ```bash
   npm install -g surge
   surge
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Author

**Mohamed Nizar**
- GitHub: [@mohamednizar17](https://github.com/mohamednizar17)

## 🙏 Acknowledgments

- Mental health professionals for guidance on UX/UI design
- Open source community for tools and resources
- Chart.js for data visualization capabilities

## 📞 Support

If you need help or have questions:
- Open an issue on GitHub
- Check the backend repository for API documentation
- Review the test-connection.html for connectivity troubleshooting

---

**Built with ❤️ for mental health awareness and support**
