
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
    introvert: 0,
    extrovert: 0,
    shy: 0,
    expressive: 0,
  };

  answers.forEach((answer, index) => {
    const question = quizData[index];
    const choice = Object.keys(question.choices).find(key => question.choices[key] === answer);
    if (choice && question.weights[choice]) {
      const weights = question.weights[choice];
      for (const trait in weights) {
        if (personality.hasOwnProperty(trait)) {
          personality[trait] += weights[trait];
        }
      }
    }
  });

  let assessment = 'You are a complex individual.';
  if (personality.introvert > 1) {
    assessment = 'You seem to be more of an introvert.';
  } else if (personality.extrovert > 1) {
    assessment = 'You seem to be more of an extrovert.';
  }

  if (personality.shy > 1) {
    assessment += ' You might also be a bit shy.';
  } else if (personality.expressive > 1) {
    assessment += ' You are also quite expressive.';
  }

  if (personality.naive > 0 && personality.influenced > 0) {
    assessment += ' You tend to be a bit naive and easily influenced.';
  } else if (personality.skeptical > 0) {
    assessment += ' You are a skeptical and independent thinker.';
  }


  res.json({ personality, assessment });
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
