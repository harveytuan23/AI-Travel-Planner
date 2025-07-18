const express = require('express')
const axios = require('axios')
const app = express()
const cors = require('cors');

require('dotenv').config({ path: '../.env' });
app.use(express.json());

const groq_url_chat = 'https://api.groq.com/openai/v1/chat/completions';
const apiKey = process.env.GROQ_API_KEY;
const port = process.env.SERVER_PORT;
const client_port = process.env.CLIENT_PORT;
const system_prompt = "You are a road travel planer. Users will prompt you with destination that they want to go to, you need to plan a route and provide sites worth going to. Please give your response in the following format: {Applebees@Corvallis,OR; Mo seafood@Newport,OR; Gold beach@Gold Beach,OR; etc..} Do not give any sentence response. If the prompt does not content one locations, give a 'no plan' response.";

app.use(cors({
  origin: 'http://localhost:' + client_port,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(express.json());

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
const authRoute = require('./routes/auth');
app.use('/api/auth', authRoute);

const prompt_content = "I am going back to San Jose,CA from Los Angeles,CA. And I would like to enjoy some ocean scenery."

app.get('/generate-response', async (req, res) => {
  try {
    // The request body you want to send
    const requestBody = {
      "model": "llama-3.3-70b-versatile",
      "messages": [
        {
          "role": "system",
          "content": system_prompt
        },
        {
          "role": "user",
          "content": prompt_content
        }]
    };
    
    // Make the API call with authorization header
    const response = await axios.post(
      groq_url_chat,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Send the API response back to the client
    res.json(parseLocationString(response.data.choices[0].message.content));
    //console.log("response.choices[0] is ", response.data.choices[0].message.content)
  } catch (error) {
    console.error('API call failed:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch data from the API',
      details: error.response ? error.response.data : error.message
    });
  }
});

function parseLocationString(locationString) {
  // Remove the curly braces and split by semicolon
  const cleanedString = locationString.replace(/[{}]/g, '').trim();
  const locationArray = cleanedString.split(';').filter(location => location.trim() !== '');
  
  // Create the JSON structure
  const result = {
    origin: locationArray[0].trim(),
    destination: locationArray[locationArray.length - 1].trim(),
    waypoints: []
  };
  
  // Add waypoints (everything between origin and destination)
  for (let i = 1; i < locationArray.length - 1; i++) {
    result.waypoints.push({
      location: locationArray[i].trim(),
      stopover: true
    });
  }
  
  return result;
}


app.post('/chat', async (req, res) => {
  try {
    const user_prompt = req.body.prompt;

    // The request body you want to send
    const requestBody = {
      "model": "llama-3.3-70b-versatile",
      "messages": [
        {
          "role": "system",
          "content": system_prompt
        },
        {
          "role": "user",
          "content": user_prompt
        }]
    };
    
    // Make the API call with authorization header
    const response = await axios.post(
      groq_url_chat,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Send the API response back to the client
    res.json(response.data.choices[0].message.content);

  } catch (error) {
    console.error('API call failed:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch data from the API',
      details: error.response ? error.response.data : error.message
    });
  }
});

app.post('/locations', async (req, res) => {
  try {
    const user_prompt = req.body.prompt;

    // The request body you want to send
    const requestBody = {
      "model": "llama-3.3-70b-versatile",
      "messages": [
        {
          "role": "system",
          "content": system_prompt
        },
        {
          "role": "user",
          "content": user_prompt
        }]
    };
    
    // Make the API call with authorization header
    const response = await axios.post(
      groq_url_chat,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Send the API response back to the client
    res.json(parseLocationString(response.data.choices[0].message.content));

  } catch (error) {
    console.error('API call failed:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch data from the API',
      details: error.response ? error.response.data : error.message
    });
  }
});