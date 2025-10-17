function QuizChoices({ choices, onSelect }) {
  return (
    <div>
      <button className="btn" onClick={() => onSelect(choices.optionA)}>{choices.optionA}</button>
      <button className="btn" onClick={() => onSelect(choices.optionB)}>{choices.optionB}</button>
    </div>
  );
}

export default QuizChoices;