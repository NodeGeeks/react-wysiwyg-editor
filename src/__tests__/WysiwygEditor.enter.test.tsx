import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { WysiwygEditor } from '../WysiwygEditor';

describe('WysiwygEditor Enter Key Behavior', () => {
  beforeEach(() => {
    // Clear selection before each test
    window.getSelection()?.removeAllRanges();
    // Mock execCommand
    document.execCommand = jest.fn((command, _, value) => {
      if (command === 'insertHTML' && value === '<br><br>') {
        const editor = document.querySelector('.nodegeeks-react-wysiwyg-editor');
        if (editor) {
          editor.innerHTML = editor.innerHTML + '<br><br>';
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
    expect(editor!.innerHTML.includes('<br>')).toBe(true);
    
    // Immediately type after the line break
    fireEvent.input(editor!, { target: { innerHTML: 'First line<br><br>immediately typing' } });
    expect(editor!.innerHTML).toBe('First line<br><br>immediately typing');
    
    // Type immediately after the break
    fireEvent.input(editor!, { target: { innerHTML: 'First line<br><br>typing works' } });
    expect(editor!.innerHTML).toBe('First line<br><br>typing works');

    // Type second line
    fireEvent.input(editor!, { target: { innerHTML: 'First line<br><br>Second line' } });
    expect(editor!.innerHTML).toBe('First line<br><br>Second line');

    // Verify onChange was called for each change
    expect(handleChange).toHaveBeenCalledTimes(3);
    expect(handleChange).toHaveBeenLastCalledWith('First line<br><br>Second line');

    // Press Enter again at the end
    fireEvent.keyDown(editor!, { key: 'Enter' });
    await new Promise(resolve => requestAnimationFrame(resolve));
    expect(editor!.innerHTML).toBe('First line<br><br>Second line<br><br>');

    // Type third line
    fireEvent.input(editor!, { target: { innerHTML: 'First line<br><br>Second line<br><br>Third line' } });
    expect(editor!.innerHTML).toBe('First line<br><br>Second line<br><br>Third line');
  });

  it('allows typing immediately after pressing enter in middle of text', async () => {
    const handleChange = jest.fn();
    const { container } = render(
      <WysiwygEditor
        content="One line of text"
        onChange={handleChange}
      />
    );

    const editor = container.querySelector('.nodegeeks-react-wysiwyg-editor');
    expect(editor).toBeTruthy();

    // Focus editor and verify content
    (editor as HTMLElement).focus();
    expect(editor!.innerHTML).toBe('One line of text');

    // Set cursor after "One line"
    const mockRange = document.getSelection()?.getRangeAt(0);
    if (mockRange && mockRange.startContainer.nodeType === Node.TEXT_NODE) {
      mockRange.setStart(mockRange.startContainer, 8);
      mockRange.collapse(true);
    }
    
    // Press Enter and verify cursor position
    fireEvent.keyDown(editor!, { key: 'Enter' });
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // Verify line breaks added at cursor position
    expect(editor!.innerHTML).toBe('One line<br><br>of text');
    
    // Type at cursor position after break
    fireEvent.input(editor!, { target: { innerHTML: 'One line<br><br>now typing here of text' } });
    expect(editor!.innerHTML).toBe('One line<br><br>now typing here of text');

    // Type new text
    fireEvent.input(editor!, {
      target: { innerHTML: 'One line of text<br><br>Second line' }
    });
    expect(editor!.innerHTML).toBe('One line of text<br><br>Second line');

    // Press enter again
    fireEvent.keyDown(editor!, { key: 'Enter' });
    await new Promise(resolve => requestAnimationFrame(resolve));
    expect(editor!.innerHTML).toBe('One line of text<br><br>Second line<br><br>');

    // Type more text
    fireEvent.input(editor!, {
      target: { innerHTML: 'One line of text<br><br>Second line<br><br>Third line' }
    });
    expect(editor!.innerHTML).toBe('One line of text<br><br>Second line<br><br>Third line');

    // Verify onChange called appropriately
    expect(handleChange).toHaveBeenCalledWith('One line of text<br><br>Second line<br><br>Third line');
  });
});