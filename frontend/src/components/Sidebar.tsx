import { Template, FrameTemplate } from '../types';

interface Props {
  templates: Template[];
  frameTemplates: FrameTemplate[];
  backgrounds: string[];
  selectedTemplate: Template;
  selectedFrameTemplate: FrameTemplate | null;
  selectedBackground: string;
  onTemplateChange: (t: Template) => void;
  onFrameSelect: (f: FrameTemplate) => void;
  onBackgroundChange: (bg: string) => void;
}

export default function Sidebar({
  templates,
  frameTemplates,
  backgrounds,
  selectedTemplate,
  selectedFrameTemplate,
  selectedBackground,
  onTemplateChange,
  onFrameSelect,
  onBackgroundChange,
}: Props) {
  return (
    <div className="w-full lg:w-64 flex flex-col gap-4 lg:sticky lg:top-8 self-start">
      {/* Templates */}
      <div className="card">
        <p className="section-title">템플릿</p>
        <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
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
        <div className="card">
          <p className="section-title">배경</p>
          <div className="grid grid-cols-2 gap-2">
            {backgrounds.map((bg, i) => (
              <button
                key={i}
                onClick={() => onBackgroundChange(bg)}
                className={`rounded-xl overflow-hidden border-2 aspect-video transition-colors ${
                  selectedBackground === bg
                    ? 'border-pink-500'
                    : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
              >
                <img src={bg} alt={`배경 ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
