# Resume Reviewer Structured Outputs Demo

A minimal React + Vite application with an Express API that demonstrates OpenAI structured outputs for a software engineering resume review workflow.

## What this demonstrates

Free-form AI output is useful for humans, but it can be hard to render safely and consistently in an application. One response might include markdown headings, another might skip a section, and another might rename a field your UI expects.

This demo closes that gap by asking OpenAI for a response that must match a Zod schema. The frontend receives predictable JSON and can render a score, summary, strengths, improvement cards, and next step without parsing prose.

## Stack

- React
- Vite
- Express
- OpenAI npm package
- Zod
- `openai/helpers/zod`
- Plain CSS

## Prerequisites

- Node.js 18 or newer
- npm
- An OpenAI API key

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create an environment file:

   ```bash
   cp .env.example .env
   ```

3. Add your server-side API key to `.env`:

   ```bash
   OPENAI_API_KEY=your-key-here
   ```

4. Start the Express API and Vite dev server:

   ```bash
   npm run dev
   ```

5. Open the Vite URL shown in your terminal, usually `http://localhost:5173`.

## How the structured output works

The server defines the expected resume feedback shape with Zod:

```js
const ResumeFeedback = z.object({
  score: z.number(),
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.object({
    area: z.string(),
    suggestion: z.string()
  })),
  nextStep: z.string()
});
```

The Express `POST /api/review` endpoint passes that schema to `zodResponseFormat` from `openai/helpers/zod`. The OpenAI API is called with `gpt-4o-mini` and returns a parsed object that matches the schema, so the frontend does not need to infer where the score, summary, strengths, improvements, or next step are located.

The API key stays on the server. The React client only calls `/api/review` and never receives or stores the OpenAI API key.
