import { Configuration, OpenAIApi } from "openai";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const configuration = new Configuration({
  organization: "org-qKjxWTi7GKAYyBtRL45Tbo74",
  apiKey: "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",
});

const openai = new OpenAIApi(configuration);

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

app.post("/", async (req, res) => {

  const { messages } = req.body;

  console.log(messages)
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {role: "system", content: "You are the wizard from the 'Wizard of Oz' a helpful assistant who can answer all questions."},
      ...messages
    ]
  })

  res.json({
    completion: completion.data.choices[0].message,
  })

});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
