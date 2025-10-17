const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const quizData = require('./quizData.json');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/quiz-results', (req, res) => {
  const { answers } = req.body;
  console.log('Received answers:', answers);

  const personality = {
    naive: 0,
    influenced: 0,
    skeptical: 0,
    independent: 0,
  };

  answers.forEach((answer, index) => {
    const question = quizData[index];
    const choice = Object.keys(question.choices).find(key => question.choices[key] === answer);
    if (choice && question.weights[choice]) {
      const weights = question.weights[choice];
      for (const trait in weights) {
        personality[trait] += weights[trait];
      }
    }
  });

  let assessment = 'You are a balanced individual.';
  if (personality.naive > 1 && personality.influenced > 1) {
    assessment = 'You seem to be a bit naive and easily influenced.';
  } else if (personality.skeptical > 1) {
    assessment = 'You are a skeptical and independent thinker.';
  } else if (personality.influenced > 1) {
    assessment = 'You are easily influenced by others.';
  }

  res.json({ personality, assessment });
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});