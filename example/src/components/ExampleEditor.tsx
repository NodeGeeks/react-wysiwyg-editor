import React from 'react';
import { WysiwygEditor } from '../../../src/WysiwygEditor';

const ExampleEditor: React.FC = () => {
  const [content, setContent] = React.useState('');

  return (
    <div>
      <h1>Simple WYSIWYG Editor Example</h1>
      <WysiwygEditor
        content={content}
        setContent={setContent}
        debug={true}
      />
    </div>
  );
};

export default ExampleEditor;