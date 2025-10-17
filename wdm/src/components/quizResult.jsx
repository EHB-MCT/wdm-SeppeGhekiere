import { useEffect, useState } from 'react';

function QuizResult({ userAnswers }) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch('http://backend:3000/api/quiz-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers: userAnswers }),
    })
      .then((response) => response.json())
      .then((data) => setResult(data))
      .catch((error) => console.error('Error:', error));
  }, [userAnswers]);

  return (
    <div>
      <h2>Quiz Result</h2>
      {result ? (
        <div>
          <h3>{result.assessment}</h3>
          <p>Naive: {result.personality.naive}</p>
          <p>Influenced: {result.personality.influenced}</p>
          <p>Skeptical: {result.personality.skeptical}</p>
          <p>Independent: {result.personality.independent}</p>
        </div>
      ) : (
        <p>Analyzing your results...</p>
      )}
      <h3>Your Answers:</h3>
      <ul>
        {userAnswers.map((answer, index) => (
          <li key={index}>{answer}</li>
        ))}
      </ul>
    </div>
  );
}

export default QuizResult;