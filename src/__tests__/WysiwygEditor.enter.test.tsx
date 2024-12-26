import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { WysiwygEditor } from '../WysiwygEditor';

describe('WysiwygEditor Enter Key Behavior', () => {
  it('allows typing immediately after pressing enter in middle of text', async () => {
    const handleChange = jest.fn();
    render(
      <WysiwygEditor
        content="One line of text"
        onChange={handleChange}
      />
    );

    const editor = screen.getByRole('textbox');
    editor.focus();
    
    // Set cursor position
    const range = document.createRange();
    const selection = window.getSelection();
    range.setStart(editor.childNodes[0], 8); // Position after "One line"
    range.setEnd(editor.childNodes[0], 8);
    selection?.removeAllRanges();
    selection?.addRange(range);

    // Press Enter key
    fireEvent.keyDown(editor, { key: 'Enter', code: 'Enter', charCode: 13 });
    fireEvent.keyUp(editor, { key: 'Enter', code: 'Enter', charCode: 13 });
    await new Promise(resolve => requestAnimationFrame(resolve));

    // Verify line breaks added at cursor position
    expect(editor.innerHTML).toBe('One line<br><br> of text');
    
    // Type at cursor position after break
    fireEvent.input(editor, { target: { innerHTML: 'One line<br><br>now typing here of text' } });

    // Verify the new content
    expect(editor.innerHTML).toBe('One line<br><br>now typing here of text');
  });
});