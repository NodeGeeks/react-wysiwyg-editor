/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { WysiwygEditor } from '../WysiwygEditor';

describe('WysiwygEditor Cursor Behavior', () => {

  it('maintains cursor position after formatting changes', async () => {
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
    (editor as HTMLElement).focus();
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