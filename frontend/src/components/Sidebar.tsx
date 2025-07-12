import React from "react";
import { Layout } from "lucide-react";
import { Template, FrameTemplate } from "../types";

interface SidebarProps {
  templates: Template[];
  frameTemplates: FrameTemplate[];
  backgrounds: string[];
  selectedTemplate: Template;
  selectedFrameTemplate: FrameTemplate | null;
  selectedBackground: string;
  setSelectedTemplate: (template: Template) => void;
  handleFrameTemplateSelect: (template: FrameTemplate) => void;
  setSelectedBackground: (background: string) => void;
  resetPhotos: () => void;
  isDarkMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  templates,
  frameTemplates,
  backgrounds,
  selectedTemplate,
  selectedFrameTemplate,
  selectedBackground,
  setSelectedTemplate,
  handleFrameTemplateSelect,
  setSelectedBackground,
  resetPhotos,
  isDarkMode,
}) => {
  return (
    <div className="w-full lg:w-64 flex flex-col gap-6 lg:sticky lg:top-8 self-start">
      {/* Template Selection */}
      <div
        className={`p-4 rounded-2xl shadow-xl border transition-all duration-500 hover:shadow-2xl ${
          isDarkMode
            ? "bg-purple-900/30 backdrop-blur-sm border-purple-500/30"
            : "bg-white/80 backdrop-blur-sm border-pink-200"
        }`}
      >
        <h2
          className={`text-lg font-semibold mb-2 flex items-center gap-2 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          <Layout size={20} /> 템플릿
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                setSelectedTemplate(template);
                resetPhotos();
              }}
              className={`p-2 rounded-xl border text-xs transition-all duration-300 hover:scale-105 ${
                selectedTemplate.id === template.id && !selectedFrameTemplate
                  ? isDarkMode
                    ? "border-purple-400 bg-purple-400/20 text-white shadow-lg shadow-purple-400/20"
                    : "border-pink-500 bg-pink-500/10 text-pink-500 shadow-lg shadow-pink-500/20"
                  : isDarkMode
                  ? "border-purple-500/30 text-purple-200 hover:border-purple-400 hover:bg-purple-400/10"
                  : "border-pink-200 text-pink-600 hover:border-pink-500 hover:bg-pink-50"
              }`}
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      {/* Frame Template Selection */}
      <div
        className={`p-4 rounded-2xl shadow-xl border transition-all duration-500 hover:shadow-2xl ${
          isDarkMode
            ? "bg-purple-900/30 backdrop-blur-sm border-purple-500/30"
            : "bg-white/80 backdrop-blur-sm border-pink-200"
        }`}
      >
        <h2
          className={`text-lg font-semibold mb-2 flex items-center gap-2 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          <Layout size={20} /> 프레임 템플릿
        </h2>
        <div className="grid grid-cols-1 gap-2">
          {frameTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleFrameTemplateSelect(template)}
              className={`p-3 rounded-xl border transition-all duration-300 hover:scale-105 ${
                selectedFrameTemplate?.id === template.id
                  ? isDarkMode
                    ? "border-purple-400 bg-purple-400/20 text-white shadow-lg shadow-purple-400/20"
                    : "border-pink-500 bg-pink-500/10 text-pink-500 shadow-lg shadow-pink-500/20"
                  : isDarkMode
                  ? "border-purple-500/30 text-purple-200 hover:border-purple-400 hover:bg-purple-400/10"
                  : "border-pink-200 text-pink-600 hover:border-pink-500 hover:bg-pink-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <img
                  src={template.frameUrl}
                  alt={template.name}
                  className="w-8 h-8 object-cover rounded"
                />
                <span className="text-sm">{template.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Background Selection */}
      {!selectedFrameTemplate && (
        <div
          className={`p-4 rounded-2xl shadow-xl border transition-all duration-500 hover:shadow-2xl ${
            isDarkMode
              ? "bg-purple-900/30 backdrop-blur-sm border-purple-500/30"
              : "bg-white/80 backdrop-blur-sm border-pink-200"
          }`}
        >
          <h2
            className={`text-lg font-semibold mb-2 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            배경
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {backgrounds.map((bg, index) => (
              <button
                key={index}
                onClick={() => setSelectedBackground(bg)}
                className={`rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 w-full aspect-video ${
                  selectedBackground === bg
                    ? "border-pink-500 shadow-lg shadow-pink-500/20"
                    : isDarkMode
                    ? "border-purple-500/30 hover:border-purple-400"
                    : "border-pink-200 hover:border-pink-500"
                }`}
              >
                <img
                  src={bg}
                  alt={`Background ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
