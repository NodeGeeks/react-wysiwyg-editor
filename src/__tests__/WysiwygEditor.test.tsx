import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
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
    expect(editor.innerHTML).toBe('Hello World!');
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
    const fontSelect = screen.getByRole('combobox');
    fireEvent.change(fontSelect, { target: { value: '16px' } });
    expect(document.execCommand).toHaveBeenCalledWith('fontSize', false, '4');

    // Test color
    const colorInput = screen.getByTestId('color-input');
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });
    expect(document.execCommand).toHaveBeenCalledWith('foreColor', false, '#ff0000');
  });

  it('handles templates correctly', () => {
    const templates = [
      { name: 'Template 1', content: '<p>Template content</p>' }
    ];
    const onChange = jest.fn();
    
    render(
      <WysiwygEditor
        content=""
        onChange={onChange}
        templates={templates}
      />
    );

    const templateSelect = screen.getAllByRole('combobox')[1]; // Second combobox is template selector
    fireEvent.change(templateSelect, { target: { value: 'Template 1' } });
    
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

});