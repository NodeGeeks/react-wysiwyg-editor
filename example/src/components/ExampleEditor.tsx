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
      <h1>String Output</h1>
      {content && <pre>{content}</pre>}
      <h1>HTML Output</h1>
      {content && <div dangerouslySetInnerHTML={{ __html: content }} />}
    </div>
  );
};

export default ExampleEditor;