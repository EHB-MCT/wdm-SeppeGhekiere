import { useEffect, useState } from 'react';

function QuizResult({ userAnswers }) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch('/api/quiz-results', {
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
          <h3>Your dominant personality trait is:</h3>
          <h2 className="dominant-trait">{result.dominantTrait}</h2>
        </div>
      ) : (
        <div className="loader"></div>
      )}
    </div>
  );
}

export default QuizResult;