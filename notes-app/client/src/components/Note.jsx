import PropTypes from "prop-types";

function Note({ note, toggleImportance, user }) {
  const label = note.important ? "✗" : "✔";

  return (
    <li className="note">
      <span>{note.content}</span>
      {user && (
        <button className="important-button" onClick={toggleImportance}>
          {label}
        </button>
      )}
    </li>
  );
}

Note.propTypes = {
  note: PropTypes.shape({
    content: PropTypes.string.isRequired,
    important: PropTypes.bool,
  }).isRequired,
  toggleImportance: PropTypes.func.isRequired,
  user: PropTypes.object,
};

export default Note;
