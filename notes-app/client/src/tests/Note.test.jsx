import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Note from "../components/Note";

test("renders content", () => {
  // Mock a note
  const note = {
    content: "Component testing is done with react-testing-library",
    important: true,
  };

  // Render the component
  render(<Note note={note} />);

  // Confirm the note's content is being correctly displayed
  const element = screen.getByText(
    "Component testing is done with react-testing-library",
  );
  expect(element).toBeDefined();
});

test("clicking the button calls event handler once", async () => {
  // Mock a note
  const note = {
    content: "Component testing is done with react-testing-library",
    important: true,
  };

  // Mock a user
  const mockUser = {
    username: "user@email.com",
    name: "User",
  };

  const mockHandler = vi.fn();

  // Render the component
  render(<Note note={note} toggleImportance={mockHandler} user={mockUser} />);

  // Setup the user event
  const user = userEvent.setup();

  // Click on the important button
  const button = screen.getByText("✗");
  await user.click(button);

  // Confirm the handler has been called only once
  expect(mockHandler.mock.calls).toHaveLength(1);
});
