import React, { useState } from 'react';
import quizData4 from '../quizData4.json';
import QuizChoices from '../components/quizChoices';
import QuizResult from '../components/quizResult';

function Quiz4() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleSelect = (choice) => {
    setUserAnswers([...userAnswers, choice]);
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < quizData4.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setQuizFinished(true);
    }
  };

  const progress = ((currentQuestion + (quizFinished ? 1 : 0)) / quizData4.length) * 100;

  return (
    <div className="quiz-container">
      {!quizFinished && (
        <div className="page-container">
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#10b981' }}>Career Aptitude Quiz</h3>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Question {currentQuestion + 1} of {quizData4.length}
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: 'var(--bg-secondary)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #10b981, #34d399)',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
        </div>
      )}

      {quizFinished ? (
        <QuizResult userAnswers={userAnswers} quizType="career" />
      ) : (
        <div className="question-card">
          <h2 className="question-text">{quizData4[currentQuestion].question}</h2>
          <QuizChoices
            choices={quizData4[currentQuestion].choices}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  );
}

export default Quiz4;