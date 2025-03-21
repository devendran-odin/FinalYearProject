import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import axios from "axios";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());  

// MongoDB Connection
// mongoose.connect(process.env.MONGO_URI)
// .then(() => console.log('Connected to MongoDB...'))
// .catch((err) => console.log('Error connecting to MongoDB:', err));

// Load API key from environment variables
const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  console.error("API key is missing. Please check your .env file.");
  process.exit(1);
}
const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

// AI Chat Route
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        const response = await axios.post(
            endpoint,
            {
                messages: [{ role: "user", content: `Respond in Markdown format and Provide a balanced response—concise yet informative, offering key details without unnecessary elaboration :\n\n${message}`}],
                model: "deepseek-r1-distill-llama-70b",
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // Extract AI response and clean unwanted <think> tags
        const aiResponse = response.data.choices[0]?.message?.content || "No response";
        const cleanedResponse = aiResponse.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

        res.json({ id: Date.now().toString(), content: cleanedResponse });

    } catch (error) {
        console.error("Error in API:", error);
        res.status(500).json({ content: "Error processing request" });
    }
});



app.listen(port, ()=> {
    console.log(`Server is running at port ${port}...`)
});

