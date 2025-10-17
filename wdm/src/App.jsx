import { useState } from 'react';
import './App.css';
import Home from './pages/home.jsx';
import Quiz from './pages/quiz.jsx';

function App() {
  const [page, setPage] = useState('home');

  const navigateTo = (page) => {
    setPage(page);
  };

  return (
    <div className="quiz-container">
      <nav>
        <a onClick={() => navigateTo('home')}>Home</a>
        <a onClick={() => navigateTo('quiz')}>Quiz</a>
      </nav>
      {page === 'home' && <Home navigateTo={navigateTo} />}
      {page === 'quiz' && <Quiz />}
    </div>
  );
}

export default App;