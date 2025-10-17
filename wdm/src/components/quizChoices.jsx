function QuizChoices({ choices, onSelect }) {
  return (
    <div>
      <button onClick={() => onSelect(choices.optionA)}>{choices.optionA}</button>
      <button onClick={() => onSelect(choices.optionB)}>{choices.optionB}</button>
    </div>
  );
}

export default QuizChoices;