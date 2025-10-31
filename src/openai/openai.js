const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY || "sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
});

async function send({
  input,
  temperature = 0.7,
  max_output_tokens = 800,
  model = "gpt-4o-mini",
}) {
  const response = await openai.responses.create({
    model,
    input,
    temperature,
    max_output_tokens,
  });

  return response.output_text.trim();
}

module.exports = { send };
