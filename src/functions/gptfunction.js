const { app } = require('@azure/functions');
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    organization: "org-qKjxWTi7GKAYyBtRL45Tbo74",
    apiKey: "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",
});

const openai = new OpenAIApi(configuration);

app.http('gptfunction', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {

        const { messages } = await request.json();

        context.log(messages)
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
            {"role": "system", "content": "You are the wizard from the 'Wizard of Oz' a helpful assistant who can answer all questions."},
            ...messages
            ]
        })

        return {
          jsonBody: {
            completion: completion.data.choices[0].message
          },
        };
    }
});
