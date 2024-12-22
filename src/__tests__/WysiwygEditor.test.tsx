/* eslint-disable @typescript-eslint/no-non-null-assertion */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { WysiwygEditor } from '../WysiwygEditor';

describe('WysiwygEditor', () => {
  beforeEach(() => {
    document.execCommand = jest.fn();
  });

  it('renders with initial content', () => {
    const content = 'Initial content';
    render(
      <WysiwygEditor
        content={content}
        onChange={() => {console.log("")}}
      />
    );
    const editor = screen.getByRole('textbox');
    expect(editor.innerHTML).toBe(content);
  });

  it('calls onChange when content is modified', () => {
    const handleChange = jest.fn();
    render(
      <WysiwygEditor
        content="Initial content"
        onChange={handleChange}
      />
    );
    
    const editor = screen.getByRole('textbox');
    fireEvent.input(editor, { target: { innerHTML: 'New content' } });
    
    expect(handleChange).toHaveBeenCalledWith('New content');
  });

  it('processes bindings correctly', () => {
    const content = 'Hello {{name}}!';
    const bindings = { name: 'World' };
    
    render(
      <WysiwygEditor
        content={content}
        onChange={() => {console.log("")}}
        bindings={bindings}
      />
    );
    
    const editor = screen.getByRole('textbox');
    expect(editor.innerHTML).toBe('Hello <span class="template-binding" data-binding="name">World</span>!');
  });

  it('updates binding correctly', () => {
    // Create a ref to hold the setBindings function
    let setBindingsRef: React.Dispatch<React.SetStateAction<{ name: string }>> | null = null;
  
    const TestComponent = () => {
      const [bindings, setBindings] = useState({ name: 'World' });
      // Store the setBindings function in our ref so we can access it outside
      setBindingsRef = setBindings;
      
      return (
        <WysiwygEditor
          content="Hello {{name}}!"
          onChange={() => { console.log(""); }}
          bindings={bindings}
        />
      );
    };
  
    render(<TestComponent />);
    
    const editor = screen.getByRole('textbox');
    expect(editor.innerHTML).toBe('Hello <span class="template-binding" data-binding="name">World</span>!');
    
    // Update bindings through state
    act(() => {
      setBindingsRef!({ name: 'NodeGeeks' });
    });
    
    expect(editor.innerHTML).toBe('Hello <span class="template-binding" data-binding="name">NodeGeeks</span>!');
  });

  it('applies text formatting commands', () => {
    const onChange = jest.fn();
    render(
      <WysiwygEditor
        content="Test content"
        onChange={onChange}
      />
    );

    // Test bold
    fireEvent.click(screen.getByTitle('Bold'));
    expect(document.execCommand).toHaveBeenCalledWith('bold', false, 'false');

    // Test italic
    fireEvent.click(screen.getByTitle('Italic'));
    expect(document.execCommand).toHaveBeenCalledWith('italic', false, 'false');

    // Test underline
    fireEvent.click(screen.getByTitle('Underline'));
    expect(document.execCommand).toHaveBeenCalledWith('underline', false, 'false');
  });

  it('applies color and font size changes', () => {
    const onChange = jest.fn();
    render(
      <WysiwygEditor
        content="Test content"
        onChange={onChange}
      />
    );

    // Test font size
    const fontSelect = screen.getByTestId('font-size-select');
    fireEvent.change(fontSelect, { target: { value: '16px' } });
    expect(document.execCommand).toHaveBeenCalledWith('fontSize', false, '4');

    // Test color
    const colorInput = screen.getByTestId('color-input');
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });
    expect(document.execCommand).toHaveBeenCalledWith('foreColor', false, '#ff0000');
  });

  it('handles templates correctly', () => {
    const onChange = jest.fn();
    const templates = [
      { name: 'Template 1', content: '<p>Template content</p>' },
    ];

    const { getByText } = render(
      <WysiwygEditor content="" onChange={onChange} templates={templates} />
    );

    // Open the template selector
    const templateButton = getByText('Template');
    fireEvent.click(templateButton);

    // Select the template
    const templateItem = getByText('Template 1');
    fireEvent.click(templateItem);

    // Check if onChange was called with the correct content
    expect(onChange).toHaveBeenCalledWith('<p>Template content</p>');
  });

  it('handles undo operation', async () => {
    const onChange = jest.fn();
    const { container } = render(
      <WysiwygEditor
        content="Initial"
        onChange={onChange}
      />
    );

    const editor = container.querySelector('.nodegeeks-react-wysiwyg-editor');
    expect(editor).toBeTruthy();
    
    // Make first change
    fireEvent.input(editor!, { target: { innerHTML: 'Change 1' } });
    await new Promise(resolve => requestAnimationFrame(resolve));
    expect(editor?.innerHTML).toBe('Change 1');
    
    // Test undo
    fireEvent.click(screen.getByTitle('Undo'));
    await new Promise(resolve => requestAnimationFrame(resolve));
    expect(editor?.innerHTML).toBe('Initial');
  });

  it('should insert table at current selection in editor', async () => {
    const onChange = jest.fn();
    render(
      <WysiwygEditor
        content="Initial content"
        onChange={onChange}
      />
    );

    const editor = screen.getByRole('textbox');
    editor.focus();
    
    // Set cursor position
    const range = document.createRange();
    const selection = window.getSelection();
    range.setStart(editor.childNodes[0], 8); // Position after "Initial "
    range.setEnd(editor.childNodes[0], 8);
    selection?.removeAllRanges();
    selection?.addRange(range);

    // Open table popover
    fireEvent.click(screen.getByTitle('Insert Table'));

    // Select table size and insert
    const tableCell = screen.getByLabelText('1x1');
    fireEvent.mouseOver(tableCell);
    fireEvent.click(tableCell);

    // Verify table insertion
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for state updates
    expect(editor.innerHTML).toContain('<table');
    expect(editor.innerHTML).toContain('<td');
  });

  it('should close TablePopover when clicking outside', async () => {
    render(
      <WysiwygEditor
        content="Initial content"
        onChange={() => {console.log("")}}
      />
    );

    // Open table popover
    fireEvent.click(screen.getByTitle('Insert Table'));
    expect(screen.getByText('Border Color:')).toBeInTheDocument();

    // Click outside the popover
    fireEvent.mouseDown(document);
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for state updates

    // Verify popover is closed
    expect(screen.queryByText('Border Color:')).not.toBeInTheDocument();
  });

});