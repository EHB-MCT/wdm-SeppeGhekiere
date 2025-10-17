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

  const personality = {};

  answers.forEach((answer, index) => {
    const question = quizData[index];
    const choice = Object.keys(question.choices).find(key => question.choices[key] === answer);
    if (choice && question.weights[choice]) {
      const weights = question.weights[choice];
      for (const trait in weights) {
        if (personality.hasOwnProperty(trait)) {
          personality[trait] += weights[trait];
        } else {
          personality[trait] = weights[trait];
        }
      }
    }
  });

  let dominantTrait = '';
  let maxScore = 0;
  for (const trait in personality) {
    if (personality[trait] > maxScore) {
      maxScore = personality[trait];
      dominantTrait = trait;
    }
  }

  res.json({ dominantTrait });
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});