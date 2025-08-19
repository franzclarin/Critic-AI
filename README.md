# Critic AI - Writer Feedback Platform

A web application that provides writers with diverse feedback on their drafts from multiple AI personalities. Built with React frontend and Node.js backend.

## Features

- **Google Docs-like Editor**: Rich text editor with formatting options
- **Multiple AI Critics**: Get feedback from 4 different AI personalities:
  - **Maya Chen** (Enthusiastic Supporter): Positive, encouraging feedback
  - **Dr. James Wilson** (Technical Analyst): Methodical, structure-focused analysis
  - **Sarah Rodriguez** (Constructive Editor): Balanced, practical suggestions
  - **Alex Turner** (Creative Visionary): Artistic, creative inspiration
- **Real-time Feedback**: Submit your writing and receive instant feedback
- **Professional UI**: Clean, modern interface designed for writers

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Anthropic API key

## Setup Instructions

### 1. Clone and Install

```bash
cd frontend
npm install

cd ../backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=your_actual_api_key_here
PORT=3001
```

### 3. Running the Application

**Start the backend server:**
```bash
cd backend
npm run dev
```

**Start the frontend (in a new terminal):**
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Usage

1. Open the application in your browser
2. Write or paste your text in the editor
3. Click "Get Feedback from Critics"
4. Review feedback from all four AI personalities
5. Use the diverse perspectives to improve your writing

## API Endpoints

- `POST /api/feedback` - Submit text for feedback
- `GET /api/health` - Health check endpoint

## Technology Stack

- **Frontend**: React, ReactQuill, Axios
- **Backend**: Node.js, Express, Anthropic Claude API
- **Styling**: Custom CSS with responsive design

## Project Structure

```
critic-ai/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── backend/
│   ├── server.js
│   ├── critics.js
│   ├── .env.example
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License