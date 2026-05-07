import { useState } from 'react';

const samplePlaceholder = `Paste a software engineering resume here. Include experience, projects, skills, education, and measurable achievements if available.`;

function App() {
  const [resumeText, setResumeText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setFeedback(null);

    if (!resumeText.trim()) {
      setError('Paste your resume text before requesting a review.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Resume review failed.');
      }

      setFeedback(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetReview = () => {
    setResumeText('');
    setFeedback(null);
    setError('');
  };

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">OpenAI Structured Outputs Demo</p>
        <h1>Resume Reviewer</h1>
        <p>
          Paste a software engineering resume and receive predictable JSON-backed feedback rendered as a polished UI.
        </p>
      </section>

      {!feedback ? (
        <form className="review-form" onSubmit={handleSubmit}>
          <label htmlFor="resumeText">Resume text</label>
          <textarea
            id="resumeText"
            value={resumeText}
            onChange={(event) => setResumeText(event.target.value)}
            placeholder={samplePlaceholder}
            rows={14}
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Reviewing...' : 'Review Resume'}
          </button>
        </form>
      ) : (
        <section className="results-panel" aria-live="polite">
          <div className="score-card">
            <span className="score-number">{feedback.score}</span>
            <span className="score-label">/ 10</span>
          </div>

          <div className="result-section">
            <h2>Summary</h2>
            <p>{feedback.summary}</p>
          </div>

          <div className="result-section">
            <h2>Strengths</h2>
            <ul className="strength-list">
              {feedback.strengths.map((strength) => (
                <li key={strength}>{strength}</li>
              ))}
            </ul>
          </div>

          <div className="result-section">
            <h2>Improvements</h2>
            <div className="improvement-grid">
              {feedback.improvements.map((improvement) => (
                <article className="improvement-card" key={`${improvement.area}-${improvement.suggestion}`}>
                  <h3>{improvement.area}</h3>
                  <p>{improvement.suggestion}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="next-step">
            <h2>Next step</h2>
            <p>{feedback.nextStep}</p>
          </div>

          <button type="button" className="secondary-button" onClick={resetReview}>
            Review Another
          </button>
        </section>
      )}
    </main>
  );
}

export default App;
