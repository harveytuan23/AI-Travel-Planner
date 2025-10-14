# 🏠 AI Travel Planner - AI-Powered Travel Planning Assistant

An intelligent travel planning application that combines AI chatbot and Google Maps to help you easily plan perfect travel routes.

## ✨ Features

### 🤖 AI-Powered Planning
- **Natural Language Conversation**: Describe your travel needs in everyday language
- **Smart Route Recommendations**: AI automatically recommends the best attractions and routes
- **Multi-Day Trip Planning**: Support for multi-day itinerary arrangements

### 🗺️ Interactive Maps
- **Google Maps Integration**: Real-time display of recommended routes
- **Multi-Point Route Planning**: Automatic calculation of optimal driving routes
- **Real-Time Traffic Information**: Display driving time and distance

### 📅 Itinerary Management
- **Drag-and-Drop Editing**: Intuitive itinerary adjustment interface
- **Date Picker**: Flexible departure date settings
- **Schedule Management**: Organize and manage attractions by day

### 🎯 User Experience
- **No Login Required**: Direct access to all features
- **Instant Planning**: Start planning immediately

## 🏗️ Technical Architecture

### Frontend Technologies
- **React 19** - Modern frontend framework
- **React Router** - Single-page application routing
- **Google Maps API** - Maps and routing services
- **React Beautiful DnD** - Drag and drop functionality
- **React DatePicker** - Date selection component

### Backend Technologies
- **Node.js + Express** - Backend API services
- **Groq API** - AI language model (Llama 3.3-70B)
- **Axios** - HTTP request handling

## 🚀 Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn
- Google Maps API key
- Groq API key

### Installation Steps

1. **Clone the Repository**
```bash
git clone <repository-url>
cd AI-Travel-Planner
```

2. **Install Dependencies**
```bash
# Install all dependencies
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

3. **Environment Setup**
Create a `.env` file in the project root:
```bash
# Create .env file with your API keys
```

Add your API keys to `.env`:
```env
# Google Maps API Key
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Groq API Key
GROQ_API_KEY=your_groq_api_key

# Server Configuration
SERVER_PORT=3001
CLIENT_PORT=3000
REACT_APP_SERVER_PORT=3001
```

4. **Start the Application**
```bash
# Start both frontend and backend
npm run start:dev
```

5. **Open Browser**
Visit `http://localhost:3000` to start using

## 📖 User Guide

### 1. Start Planning Your Trip
Enter your travel requirements in the chat interface, for example:
```
"I want to go to San Jose,CA from Los Angeles,CA"
"I am going back to San Jose,CA from Los Angeles,CA. And I would like to enjoy some ocean scenery."
```

### 2. View AI Recommendations
- AI analyzes your requirements and recommends relevant attractions
- Recommendations automatically display on the map
- Routes are planned in driving mode

### 3. Manage Itinerary
- Click attraction cards to add them to your schedule
- Use drag-and-drop to adjust itinerary order
- Set multi-day trips and departure dates

### 4. View Detailed Information
- Map displays complete routes and driving times
- Schedule shows daily arrangements
- View detailed information for each route segment

## 🔧 API Endpoints

### AI Services
- `POST /api/chat` - AI chat conversation
- `POST /api/locations` - Get location information
- `GET /api/generate-response` - Generate route response

## 📁 Project Structure

```
AITravelPlanner/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── server/                 # Express backend
│   ├── routes/             # API routes
│   ├── db.js              # Database configuration
│   └── index.js           # Server entry point
└── shared/                 # Shared resources
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## 📞 Contact

For questions or suggestions, please contact us through:
- Create an Issue
- Send Email

## 🙏 Acknowledgments

- [Google Maps Platform](https://developers.google.com/maps) - Maps services
- [Groq](https://groq.com/) - AI language model
- [React](https://reactjs.org/) - Frontend framework
- [Express.js](https://expressjs.com/) - Backend framework

---

**AI Travel Planner** - Adding Intelligence to Your Travels ✈️
