function QuizChoices({ choices, onSelect }) {
  return (
    <div className="choices-container">
      <button className="btn" onClick={() => onSelect(choices.optionA)}>{choices.optionA}</button>
      <button className="btn" onClick={() => onSelect(choices.optionB)}>{choices.optionB}</button>
    </div>
  );
}

export default QuizChoices;