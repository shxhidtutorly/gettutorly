# 🎓 Tutorly - AI-Powered Learning Platform

> **Smart, Next-Gen, AI-Powered Learning Assistant for Students**

Tutorly is a comprehensive AI-powered learning platform that transforms how students study, learn, and retain information. Built with modern web technologies and cutting-edge AI, it provides intelligent study tools, personalized learning experiences, and comprehensive progress tracking.

## 🚀 Overview

Tutorly solves the common challenges students face in their learning journey by providing:

- **Intelligent Document Processing**: Convert any document, lecture, or study material into structured notes
- **Audio-to-Text Conversion**: Transform audio recordings and lectures into organized summaries
- **Interactive Learning Tools**: Flashcards, quizzes, and study techniques powered by AI
- **Math Problem Solving**: Step-by-step solutions with visual explanations
- **Progress Tracking**: Comprehensive analytics and learning insights
- **Personalized Study Plans**: AI-generated study schedules and recommendations

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 3.4 with custom animations
- **UI Components**: Radix UI primitives with shadcn/ui
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: React Router DOM 6
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend & APIs
- **Runtime**: Node.js with Vercel Functions
- **AI Services**: 
  - Google Generative AI (Gemini Pro)
  - AssemblyAI (Audio Transcription)
  - Multiple AI providers (Groq, Claude, OpenRouter)
- **File Processing**: PDF.js, Mammoth.js, Tesseract.js
- **Math Rendering**: React KaTeX
- **File Upload**: UploadThing

### Database & Storage
- **Primary Database**: Supabase (PostgreSQL)
- **Authentication**: Firebase Auth
- **File Storage**: Supabase Storage + Firebase Storage
- **Real-time**: Supabase Realtime

### Deployment & Infrastructure
- **Hosting**: Vercel
- **Domain**: Custom domain with SSL
- **CDN**: Vercel Edge Network
- **Environment**: Production-ready with environment variables

## ✨ Features

### Core Learning Tools
- **📝 AI Notes Generator**: Convert documents to structured notes with smart formatting
- **🎙️ Audio Notes**: Transcribe and summarize audio recordings and lectures
- **🧮 Math Solver**: Solve complex math problems with step-by-step explanations
- **📚 Smart Summarizer**: Generate concise summaries from any text or document
- **🗂️ Doubt Chain**: Break down complex concepts into simple, connected steps

### Interactive Study Features
- **🃏 Adaptive Flashcards**: Create and review flashcards that evolve with your progress
- **📋 AI-Generated Quizzes**: Test knowledge with personalized quizzes
- **🎯 Study Techniques**: Apply proven methods like Feynman Technique and Pomodoro
- **📊 Progress Dashboard**: Track learning progress with detailed analytics
- **📈 Learning Insights**: Get personalized recommendations and insights

### User Experience
- **🎨 Modern UI**: Brutalist design with neon accents and smooth animations
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile
- **🌙 Dark/Light Mode**: Theme switching with system preference detection
- **⚡ Real-time Updates**: Live progress tracking and notifications
- **🔒 Secure Authentication**: Firebase Auth with protected routes

## 🏗️ Project Structure

```
gettutorly-1/
├── api/                          # Backend API routes (Vercel Functions)
│   ├── ai-unified.js            # Unified AI service endpoint
│   ├── audio-to-notes.js        # Audio transcription service
│   ├── math-solver.js           # Math problem solving
│   ├── summarize.js             # Document summarization
│   └── webhook/                 # Payment webhooks
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── auth/               # Authentication components
│   │   ├── chat/               # Chat interface components
│   │   ├── features/           # Feature-specific components
│   │   ├── layout/             # Layout components (Navbar, Footer)
│   │   ├── progress/           # Progress tracking components
│   │   ├── quiz/               # Quiz and assessment components
│   │   └── ui/                 # Base UI components (shadcn/ui)
│   ├── contexts/               # React contexts (Auth, Theme)
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility libraries and services
│   ├── pages/                  # Application pages
│   │   ├── features/           # Feature showcase pages
│   │   └── ...                 # Main application pages
│   └── utils/                  # Helper utilities
├── supabase/                   # Database migrations and functions
├── public/                     # Static assets
└── vercel.json                 # Vercel deployment configuration
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/gettutorly-1.git
cd gettutorly-1
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Services
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_ASSEMBLYAI_API_KEY=your_assemblyai_api_key

# UploadThing
VITE_UPLOADTHING_SECRET=your_uploadthing_secret
VITE_UPLOADTHING_APP_ID=your_uploadthing_app_id

# Paddle (Payment Processing)
VITE_PADDLE_CLIENT_ID=your_paddle_client_id
VITE_PADDLE_CLIENT_SECRET=your_paddle_client_secret
```

### 4. Database Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase (if not already done)
supabase init

# Apply migrations
supabase db push
```

### 5. Run Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:8080`

## 🔌 API Routes

### Core AI Services
- `POST /api/ai-unified` - Unified AI chat and content generation
- `POST /api/audio-to-notes` - Audio transcription and notes generation
- `POST /api/math-solver` - Math problem solving with step-by-step solutions
- `POST /api/summarize` - Document and text summarization
- `POST /api/chat-notes` - Interactive chat with study materials

### File Processing
- `POST /api/transcribe` - Audio file transcription
- `POST /api/doubt-chain` - Generate doubt chains for complex topics
- `POST /api/followup` - Generate follow-up questions

### Payment & Subscription
- `POST /api/subscription` - Subscription management
- `POST /api/webhook/paddle` - Paddle payment webhooks

## 🔐 Authentication

Tutorly uses **Firebase Authentication** for user management:

- **Email/Password**: Traditional email and password authentication
- **Google OAuth**: Social login with Google accounts
- **Protected Routes**: Automatic route protection for authenticated users
- **Session Management**: Persistent sessions with automatic token refresh

### Authentication Flow
1. Users sign up/sign in through Firebase Auth
2. Authentication state is managed via React Context
3. Protected routes automatically redirect unauthenticated users
4. User data is synced with Supabase for additional features

## 🗄️ Database Schema

### Core Tables (Supabase PostgreSQL)

```sql
-- Users table (extends Firebase auth)
users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Study materials
study_materials (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  summary TEXT,
  file_name TEXT,
  file_url TEXT,
  content_type TEXT,
  size INTEGER,
  metadata JSONB
)

-- Study notes
notes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  material_id UUID REFERENCES study_materials(id),
  title TEXT,
  content TEXT NOT NULL
)

-- Study progress tracking
study_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  material_id UUID REFERENCES study_materials(id),
  progress_percentage INTEGER,
  time_spent INTEGER,
  completed BOOLEAN
)
```

### Firebase Realtime Database
- User activity logs
- Real-time progress updates
- Study session tracking

## 🚀 Deployment

### Vercel Deployment
The application is deployed on Vercel with the following configuration:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Deployment Steps
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch
4. Set up custom domain (optional)

### Production Environment
- **CDN**: Vercel Edge Network for global performance
- **SSL**: Automatic HTTPS with Let's Encrypt
- **Caching**: Optimized asset caching and API response caching
- **Monitoring**: Vercel Analytics and error tracking

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Ensure all tests pass
- Update documentation for new features
- Follow the existing code style and patterns

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with React and TypeScript rules
- **Prettier**: Automatic code formatting
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS with custom utilities

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- **GitHub**: [@yourusername](https://github.com/yourusername)
- **Email**: your.email@example.com
- **Website**: [tutorly.com](https://tutorly.com)

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Vercel** for the excellent hosting platform
- **Supabase** for the powerful backend-as-a-service
- **Firebase** for authentication and real-time features
- **OpenAI/Google** for AI capabilities

---

**Built with ❤️ for students worldwide**
