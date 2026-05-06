import 'dotenv/config';
import express from 'express';
import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

const ResumeFeedback = z.object({
  score: z.number(),
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(
    z.object({
      area: z.string(),
      suggestion: z.string(),
    }),
  ),
  nextStep: z.string(),
});

const app = express();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '1mb' }));

app.post('/api/review', async (req, res) => {
  const resumeText = typeof req.body?.resumeText === 'string' ? req.body.resumeText.trim() : '';

  if (!resumeText) {
    return res.status(400).json({ error: 'Resume text is required.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
  }

  try {
    const completion = await client.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert resume reviewer for software engineering roles. Review the resume text and provide concise, practical feedback. Score the resume from 1 to 10. Focus on clarity, impact, technical relevance, metrics, and role fit.',
        },
        {
          role: 'user',
          content: `Review this software engineering resume:\n\n${resumeText}`,
        },
      ],
      response_format: zodResponseFormat(ResumeFeedback, 'resume_feedback'),
    });

    const feedback = completion.choices[0]?.message?.parsed;

    if (!feedback) {
      return res.status(502).json({ error: 'The model did not return structured feedback.' });
    }

    return res.json(feedback);
  } catch (error) {
    console.error('Resume review failed:', error);
    return res.status(500).json({ error: 'Unable to review the resume right now.' });
  }
});

app.listen(PORT, () => {
  console.log(`Resume reviewer API listening on http://localhost:${PORT}`);
});
