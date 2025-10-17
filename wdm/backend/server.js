const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const quizData = require('./quizData.json');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const resultsFilePath = path.join(__dirname, 'results.json');

// Helper function to read results from file
const readResults = () => {
  if (fs.existsSync(resultsFilePath)) {
    const data = fs.readFileSync(resultsFilePath, 'utf8');
    return JSON.parse(data);
  }
  return [];
};

// Helper function to write results to file
const writeResults = (results) => {
  fs.writeFileSync(resultsFilePath, JSON.stringify(results, null, 2), 'utf8');
};

// New GET endpoint to retrieve all results
app.get('/api/results', (req, res) => {
  const allResults = readResults();
  res.json(allResults);
});

app.post('/api/submit-result-with-email', (req, res) => {
  const { answers, email } = req.body;
  console.log('Received answers:', answers, 'for email:', email);

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

  // Store the result
  const allResults = readResults();
  allResults.push({ email, dominantTrait, timestamp: new Date() });
  writeResults(allResults);

  res.json({ dominantTrait });
});

// Existing endpoint (if still needed, otherwise remove)
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