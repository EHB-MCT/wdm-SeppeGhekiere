import React, { useState } from 'react';
import quizData from '../quizData.json';
import QuizChoices from '../components/quizChoices';
import QuizResult from '../components/quizResult';

function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleSelect = (choice) => {
    setUserAnswers([...userAnswers, choice]);
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < quizData.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setQuizFinished(true);
    }
  };

  return (
    <>
      <div>
        <h1>Quiz Page</h1>
        {quizFinished ? (
          <QuizResult userAnswers={userAnswers} />
        ) : (
          <div className="question-container">
            <h2 className="question-text">{quizData[currentQuestion].question}</h2>
            <QuizChoices
              choices={quizData[currentQuestion].choices}
              onSelect={handleSelect}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default Quiz;