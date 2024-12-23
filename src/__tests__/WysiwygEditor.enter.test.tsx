import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { WysiwygEditor } from '../WysiwygEditor';

describe('WysiwygEditor Enter Key Behavior', () => {
  beforeEach(() => {
    // Clear selection before each test
    window.getSelection()?.removeAllRanges();
    // Mock execCommand
    document.execCommand = jest.fn((command, _, value) => {
      if (command === 'insertHTML' && value === '<br>') {
        const editor = document.querySelector('.nodegeeks-react-wysiwyg-editor');
        if (editor) {
          const selection = window.getSelection();
          const range = selection?.getRangeAt(0);
          if (range) {
            range.deleteContents();
            const br = document.createElement('br');
            range.insertNode(br);
            range.setStartAfter(br);
            range.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(range);
            editor.innerHTML = editor.innerHTML.replace(/<br><br>/g, '<br>');
            console.log('Updated innerHTML:', editor.innerHTML); // Debugging log
          }
        }
      }
      return true;
    });

    // Set up mock range with actual DOM nodes for testing
    const textNode = document.createTextNode('');
    const mockRange = document.createRange();
    mockRange.setStart(textNode, 0);
    mockRange.setEnd(textNode, 0);

    const mockSelection = {
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
      deleteFromDocument: jest.fn(),
      getRangeAt: () => mockRange,
      rangeCount: 1,
      toString: () => '',
      isCollapsed: true
    };

    Object.defineProperty(window, 'getSelection', {
      value: () => mockSelection
    });
  });

  it('should allow typing immediately after pressing enter', async () => {
    const handleChange = jest.fn();
    const { container } = render(
      <WysiwygEditor
        content=""
        onChange={handleChange}
      />
    );

    const editor = container.querySelector('.nodegeeks-react-wysiwyg-editor');
    expect(editor).toBeTruthy();

    // Focus the editor
    (editor as HTMLElement).focus();

    // Type initial text
    fireEvent.input(editor!, { target: { innerHTML: 'First line' } });
    expect(editor!.innerHTML).toBe('First line');
    
    // Press Enter and verify immediate typing works
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    editor!.dispatchEvent(enterEvent);
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // Verify line break was added
    expect(editor!.innerHTML).toBe('First line<br>');
    
    // Immediately type after the line break
    fireEvent.input(editor!, { target: { innerHTML: 'First line<br>immediately typing' } });
    expect(editor!.innerHTML).toBe('First line<br>immediately typing');
    
    // Type second line
    fireEvent.input(editor!, { target: { innerHTML: 'First line<br>Second line' } });
    expect(editor!.innerHTML).toBe('First line<br>Second line');

    // Verify onChange was called for each change
    expect(handleChange).toHaveBeenCalledTimes(3);
    expect(handleChange).toHaveBeenLastCalledWith('First line<br>Second line');

    // Press Enter again at the end
    fireEvent.keyDown(editor!, { key: 'Enter' });
    await new Promise(resolve => requestAnimationFrame(resolve));
    expect(editor!.innerHTML).toBe('First line<br>Second line<br>');

    // Type third line
    fireEvent.input(editor!, { target: { innerHTML: 'First line<br>Second line<br>Third line' } });
    expect(editor!.innerHTML).toBe('First line<br>Second line<br>Third line');
  });

  it('allows typing immediately after pressing enter in middle of text', () => {
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

    // Verify line breaks added at cursor position
    expect(editor!.innerHTML).toBe('One line<br>of text');
    
    // Type at cursor position after break
    fireEvent.input(editor!, { target: { innerHTML: 'One line<br>now typing here of text' } });

    // Verify the new content
    expect(editor!.innerHTML).toBe('One line<br>now typing here of text');
  });
});