import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ExampleEditor from './components/ExampleEditor';
import DomEditor from './components/DomEditor';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/wysiwyg-editor">Simple WYSIWYG Editor</Link>
            </li>
            <li>
              <Link to="/dom-editor">DOM Editor</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/wysiwyg-editor" element={<ExampleEditor />} />
          <Route path="/dom-editor" element={<DomEditor />} />
          <Route path="/" element={<ExampleEditor />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;