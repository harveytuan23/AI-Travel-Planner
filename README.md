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

### 👤 User System
- **Register/Login**: Personalized experience
- **Data Persistence**: Secure storage of itinerary data

## 🏗️ Technical Architecture

### Frontend Technologies
- **React 19** - Modern frontend framework
- **React Router** - Single-page application routing
- **Google Maps API** - Maps and routing services
- **React Beautiful DnD** - Drag and drop functionality
- **React DatePicker** - Date selection component

### Backend Technologies
- **Node.js + Express** - Backend API services
- **SQLite** - Lightweight database
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
cd Louis_House
```

2. **Install Dependencies**
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

3. **Environment Setup**
Create a `.env` file in the project root by copying the example file:
```bash
cp .env.example .env
```

Then edit the `.env` file and add your actual API keys:
```env
# Google Maps API Key
# Get your API key from: https://developers.google.com/maps/documentation/javascript/get-api-key
REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key

# Groq API Key
# Get your API key from: https://console.groq.com/
GROQ_API_KEY=your_actual_groq_api_key

# Server Configuration
SERVER_PORT=3001
CLIENT_PORT=3000
```

**Important**: Never commit your actual API keys to version control. The `.env` file is already in `.gitignore` to prevent accidental commits.

4. **Start the Application**
```bash
# Start backend server (in server directory)
npm start

# Start frontend development server (in client directory)
npm start
```

5. **Open Browser**
Visit `http://localhost:3000` to start using

## 📖 User Guide

### 1. Register/Login
- Register a new account for first-time users
- Login to access the main dashboard

### 2. Start Planning Your Trip
Enter your travel requirements in the chat interface, for example:
```
"I want to go to San Jose,CA from Los Angeles,CA"
"I am going back to San Jose,CA from Los Angeles,CA. And I would like to enjoy some ocean scenery."
```

### 3. View AI Recommendations
- AI analyzes your requirements and recommends relevant attractions
- Recommendations automatically display on the map
- Routes are planned in driving mode

### 4. Manage Itinerary
- Click attraction cards to add them to your schedule
- Use drag-and-drop to adjust itinerary order
- Set multi-day trips and departure dates

### 5. View Detailed Information
- Map displays complete routes and driving times
- Schedule shows daily arrangements
- View detailed information for each route segment

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### AI Services
- `POST /chat` - AI chat conversation
- `POST /locations` - Get location information
- `GET /generate-response` - Generate route response

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

**Louis House** - Adding Intelligence to Your Travels ✈️
