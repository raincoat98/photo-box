import { Sun, Moon } from 'lucide-react';
import { Template, FrameTemplate } from '../types';

interface Props {
  templates: Template[];
  frameTemplates: FrameTemplate[];
  backgrounds: string[];
  selectedTemplate: Template;
  selectedFrameTemplate: FrameTemplate | null;
  selectedBackground: string;
  isDark: boolean;
  onTemplateChange: (t: Template) => void;
  onFrameSelect: (f: FrameTemplate) => void;
  onBackgroundChange: (bg: string) => void;
  onToggleDark: () => void;
}

export default function Sidebar({
  templates,
  frameTemplates,
  backgrounds,
  selectedTemplate,
  selectedFrameTemplate,
  selectedBackground,
  isDark,
  onTemplateChange,
  onFrameSelect,
  onBackgroundChange,
  onToggleDark,
}: Props) {
  return (
    <div className="w-full lg:w-64 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-3 lg:overflow-y-auto lg:min-h-0">
      {/* Templates */}
      <div className="card">
        <p className="section-title">템플릿</p>
        <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-2 gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => onTemplateChange(t)}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-colors ${
                selectedTemplate.id === t.id && !selectedFrameTemplate
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Frame Templates */}
      <div className="card">
        <p className="section-title">프레임 템플릿</p>
        <div className="flex flex-col gap-2">
          {frameTemplates.map((f) => (
            <button
              key={f.id}
              onClick={() => onFrameSelect(f)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-colors text-left ${
                selectedFrameTemplate?.id === f.id
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <img src={f.frameUrl} alt={f.name} className="w-8 h-10 object-cover rounded" />
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Backgrounds */}
      {!selectedFrameTemplate && (
        <div className="card !p-3">
          <p className="section-title">배경</p>
          <div className="grid grid-cols-2 gap-2">
            {backgrounds.map((bg, i) => (
              <button
                key={i}
                onClick={() => onBackgroundChange(bg)}
                style={{ background: bg, backgroundSize: 'cover', backgroundPosition: 'center' }}
                className={`rounded-xl overflow-hidden border-2 aspect-video transition-all ${
                  selectedBackground === bg
                    ? 'border-pink-500 scale-105'
                    : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500 hover:scale-105'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Title */}
      <div className="px-1 md:col-span-3 lg:col-span-1">
        <div className="flex items-center gap-2">
          <div className="relative inline-block">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 relative z-10">
              포토 부스
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-lg blur opacity-25"></div>
          </div>
          <button
            onClick={onToggleDark}
            className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          당신의 소중한 순간을 담아보세요
        </p>
      </div>
    </div>
  );
}
