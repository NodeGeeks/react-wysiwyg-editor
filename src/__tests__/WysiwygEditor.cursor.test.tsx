import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { WysiwygEditor } from '../WysiwygEditor';

describe('WysiwygEditor Cursor Behavior', () => {
  it('maintains cursor position when typing', () => {
    const handleChange = jest.fn();
    const { container } = render(
      <WysiwygEditor
        content="Initial text"
        onChange={handleChange}
      />
    );

    const editor = container.querySelector('.nodegeeks-react-wysiwyg-editor');
    expect(editor).toBeTruthy();

    // Focus the editor and set cursor position
    editor?.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.setStart(editor!.firstChild!, 7); // Set cursor after "Initial"
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);

    // Simulate typing
    fireEvent.input(editor!, { target: { innerHTML: 'Initial new text' } });

    // Verify cursor position is maintained
    expect(selection?.getRangeAt(0).startOffset).toBe(12);
  });

  it('maintains cursor position after formatting changes', () => {
    const handleChange = jest.fn();
    const { container } = render(
      <WysiwygEditor
        content="Test content"
        onChange={handleChange}
      />
    );

    const editor = container.querySelector('.nodegeeks-react-wysiwyg-editor');
    expect(editor).toBeTruthy();

    // Focus and set cursor
    editor?.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.setStart(editor!.firstChild!, 5);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);

    // Apply formatting
    fireEvent.click(screen.getByTitle('Bold'));

    // Verify cursor position is maintained
    expect(selection?.getRangeAt(0).startOffset).toBe(5);
  });
});