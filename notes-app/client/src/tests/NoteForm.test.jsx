import { test, vi, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NoteForm from "../components/NoteForm";
import userEvent from "@testing-library/user-event";

test("<NoteForm /> updates parent state and calls onSubmit", async () => {
  // Mock the note creation function
  const createNote = vi.fn();

  // Setup the user event
  const user = userEvent.setup();

  // Render the component
  render(<NoteForm createNote={createNote} />);

  // Get both the input field and save button
  const input = screen.getByPlaceholderText("write note content here");
  const sendButton = screen.getByText("save");

  // Write the note content into the input field and save it
  await user.type(input, "testing a form...");
  await user.click(sendButton);

  // Assert the function has only been called once
  expect(createNote.mock.calls).toHaveLength(1);
  expect(createNote.mock.calls[0][0].content).toBe("testing a form...");
});
