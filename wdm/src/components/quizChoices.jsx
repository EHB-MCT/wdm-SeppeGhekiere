function QuizChoices({ choices, onSelect }) {
	return (
		<div className="choices-grid">
			<button className="choice-btn" onClick={() => onSelect("optionA")}>
				<span style={{ fontSize: "1.25rem", marginRight: "0.5rem" }}>A</span>
				{choices.optionA}
			</button>
			<button className="choice-btn" onClick={() => onSelect("optionB")}>
				<span style={{ fontSize: "1.25rem", marginRight: "0.5rem" }}>B</span>
				{choices.optionB}
			</button>
		</div>
	);
}

export default QuizChoices;
