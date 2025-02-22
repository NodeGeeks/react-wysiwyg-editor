import React from "react";

interface Template {
  name: string;
  content: string;
}

interface TemplateSelectorProps {
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  onSelectTemplate,
}) => {
  return (
    <div className="template-selector">
      {templates.map((template) => (
        <div
          key={template.name}
          className="template-item"
          onClick={() => onSelectTemplate(template)}
        >
          {template.name}
        </div>
      ))}
    </div>
  );
};