import { useState, useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface FieldConfig {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea' | 'status';
  required: boolean;
  options?: string[]; // for select type
  placeholder?: string;
  width: 'full' | 'half';
}

interface ModuleConfig {
  id: string;
  name: string;
  icon: string;
  iconColor: string;
  fields: FieldConfig[];
  createdAt: string;
}

const FIELD_TYPES = [
  { value: 'text', label: '文本', labelEn: 'Text', icon: 'fa-font' },
  { value: 'email', label: '邮箱', labelEn: 'Email', icon: 'fa-envelope' },
  { value: 'number', label: '数字', labelEn: 'Number', icon: 'fa-hashtag' },
  { value: 'date', label: '日期', labelEn: 'Date', icon: 'fa-calendar' },
  { value: 'select', label: '下拉选择', labelEn: 'Select', icon: 'fa-list' },
  { value: 'textarea', label: '多行文本', labelEn: 'Textarea', icon: 'fa-align-left' },
  { value: 'status', label: '状态', labelEn: 'Status', icon: 'fa-toggle-on' },
];

const ICON_OPTIONS = [
  { icon: 'fa-cube', color: '#60a5fa' },
  { icon: 'fa-box', color: '#a78bfa' },
  { icon: 'fa-table', color: '#34d399' },
  { icon: 'fa-clipboard-list', color: '#fbbf24' },
  { icon: 'fa-folder', color: '#fb923c' },
  { icon: 'fa-file-lines', color: '#f472b6' },
  { icon: 'fa-database', color: '#38bdf8' },
  { icon: 'fa-gear', color: '#94a3b8' },
  { icon: 'fa-cart-shopping', color: '#f87171' },
  { icon: 'fa-users', color: '#2dd4bf' },
  { icon: 'fa-building', color: '#818cf8' },
  { icon: 'fa-truck', color: '#a3e635' },
];

const genId = () => Math.random().toString(36).substr(2, 9);

export default function Prototype() {
  const { t, language } = useContext(LanguageContext);
  const { themeColor } = useContext(ThemeContext);

  const [modules, setModules] = useState<ModuleConfig[]>(() => {
    try {
      const saved = localStorage.getItem('crm-prototypes');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [activeTab, setActiveTab] = useState<'list' | 'builder' | 'preview'>('list');
  const [currentModule, setCurrentModule] = useState<ModuleConfig | null>(null);
  const [editingField, setEditingField] = useState<FieldConfig | null>(null);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ModuleConfig | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, string>[]>([]);
  const [isPreviewAddOpen, setIsPreviewAddOpen] = useState(false);
  const [previewForm, setPreviewForm] = useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem('crm-prototypes', JSON.stringify(modules));
  }, [modules]);

  const zh = language === 'zh';

  const showToast = (title: string, description: string, variant: 'add' | 'update' | 'delete' = 'update') => {
    const config = {
      add: { icon: 'fa-solid fa-plus', bar: 'bg-gradient-to-r from-emerald-400 to-cyan-500', iconBg: 'bg-gradient-to-br from-emerald-400 to-cyan-500' },
      update: { icon: 'fa-solid fa-check', bar: 'btn-gradient', iconBg: 'btn-gradient' },
      delete: { icon: 'fa-solid fa-trash-can', bar: 'bg-gradient-to-r from-red-400 to-rose-500', iconBg: 'bg-gradient-to-br from-red-400 to-rose-500' },
    }[variant];
    toast.custom((id) => (
      <div className="w-[360px] bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-100 dark:border-gray-800/80 overflow-hidden" style={{ boxShadow: '0 20px 40px -12px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)' }}>
        <div className={`h-1 ${config.bar}`} />
        <div className="p-4 flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
            <i className={`${config.icon} text-white text-sm`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{description}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1.5"><i className="fa-regular fa-clock mr-1" />{format(new Date(), 'dd MMM yyyy HH:mm')}</p>
          </div>
          <button className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors flex-shrink-0" onClick={() => toast.dismiss(id)}>
            <i className="fa-solid fa-xmark text-xs" />
          </button>
        </div>
      </div>
    ), { duration: 4000 });
  };

  // ─── Module List ───
  const handleCreateModule = () => {
    const icon = ICON_OPTIONS[Math.floor(Math.random() * ICON_OPTIONS.length)];
    const newModule: ModuleConfig = {
      id: genId(),
      name: '',
      icon: icon.icon,
      iconColor: icon.color,
      fields: [
        { id: genId(), name: 'name', label: zh ? '名称' : 'Name', type: 'text', required: true, width: 'full' },
        { id: genId(), name: 'status', label: zh ? '状态' : 'Status', type: 'status', required: true, width: 'half' },
      ],
      createdAt: new Date().toISOString(),
    };
    setCurrentModule(newModule);
    setActiveTab('builder');
  };

  const handleEditModule = (mod: ModuleConfig) => {
    setCurrentModule({ ...mod, fields: mod.fields.map(f => ({ ...f })) });
    setActiveTab('builder');
  };

  const handleDeleteModule = () => {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    setModules(prev => prev.filter(m => m.id !== deleteTarget.id));
    setDeleteTarget(null);
    showToast(zh ? '删除成功' : 'Deleted', zh ? `${name} 已被删除` : `${name} has been deleted`, 'delete');
  };

  const handlePreviewModule = (mod: ModuleConfig) => {
    setCurrentModule(mod);
    setPreviewData([]);
    setActiveTab('preview');
  };

  // ─── Builder ───
  const handleSaveModule = () => {
    if (!currentModule) return;
    if (!currentModule.name.trim()) {
      toast.error(zh ? '请输入模块名称' : 'Please enter module name');
      return;
    }
    const exists = modules.find(m => m.id === currentModule.id);
    if (exists) {
      setModules(prev => prev.map(m => m.id === currentModule.id ? currentModule : m));
      showToast(zh ? '更新成功' : 'Updated', zh ? `${currentModule.name} 已更新` : `${currentModule.name} updated`, 'update');
    } else {
      setModules(prev => [...prev, currentModule]);
      showToast(zh ? '创建成功' : 'Created', zh ? `${currentModule.name} 已创建` : `${currentModule.name} created`, 'add');
    }
    setActiveTab('list');
    setCurrentModule(null);
  };

  const handleAddField = () => {
    setEditingField({
      id: genId(),
      name: '',
      label: '',
      type: 'text',
      required: false,
      width: 'full',
    });
    setIsFieldModalOpen(true);
  };

  const handleEditField = (field: FieldConfig) => {
    setEditingField({ ...field });
    setIsFieldModalOpen(true);
  };

  const handleSaveField = () => {
    if (!editingField || !currentModule) return;
    if (!editingField.label.trim()) {
      toast.error(zh ? '请输入字段标签' : 'Please enter field label');
      return;
    }
    if (!editingField.name.trim()) {
      editingField.name = editingField.label.toLowerCase().replace(/[^a-z0-9]/gi, '_');
    }
    const exists = currentModule.fields.find(f => f.id === editingField.id);
    if (exists) {
      setCurrentModule({ ...currentModule, fields: currentModule.fields.map(f => f.id === editingField.id ? editingField : f) });
    } else {
      setCurrentModule({ ...currentModule, fields: [...currentModule.fields, editingField] });
    }
    setIsFieldModalOpen(false);
    setEditingField(null);
  };

  const handleDeleteField = (fieldId: string) => {
    if (!currentModule) return;
    setCurrentModule({ ...currentModule, fields: currentModule.fields.filter(f => f.id !== fieldId) });
  };

  // ─── Preview ───
  const handlePreviewAdd = () => {
    if (!currentModule) return;
    const row: Record<string, string> = {};
    currentModule.fields.forEach(f => {
      row[f.name] = previewForm[f.name] || (f.type === 'status' ? 'active' : '');
    });
    setPreviewData(prev => [...prev, row]);
    setPreviewForm({});
    setIsPreviewAddOpen(false);
  };

  // ─── Render: Module List ───
  const renderList = () => (
    <>
      <div className="sticky -top-4 z-10 -mx-6 px-6 pt-4 pb-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{zh ? '原型构建器' : 'Prototype Builder'}</h1>
            <p className="text-sm text-gray-500">{zh ? '可视化配置模块，自动生成可运行原型' : 'Visually configure modules, auto-generate runnable prototypes'}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2 flex items-center justify-center" onClick={handleCreateModule}>
              <i className="fa-solid fa-plus mr-2"></i>
              {zh ? '新建模块' : 'New Module'}
            </button>
          </div>
        </div>
      </div>

      {modules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/20 flex items-center justify-center mb-5">
            <i className="fa-solid fa-wand-magic-sparkles text-2xl text-violet-500 dark:text-violet-400"></i>
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{zh ? '还没有原型模块' : 'No prototype modules yet'}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center max-w-sm">{zh ? '创建你的第一个模块，定义字段，系统将自动生成包含列表、查看、编辑和添加功能的完整原型' : 'Create your first module, define fields, and the system will auto-generate a full prototype with list, view, edit and add'}</p>
          <button className="btn-gradient rounded-xl text-sm font-medium text-white px-5 py-2.5 flex items-center" onClick={handleCreateModule}>
            <i className="fa-solid fa-plus mr-2"></i>
            {zh ? '创建第一个模块' : 'Create First Module'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod, index) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="h-1 btn-gradient" />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: mod.iconColor + '20' }}>
                    <i className={`fa-solid ${mod.icon} text-sm`} style={{ color: mod.iconColor }}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{mod.name}</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{mod.fields.length} {zh ? '个字段' : 'fields'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {mod.fields.slice(0, 5).map(f => (
                    <span key={f.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800/60 text-[11px] text-gray-600 dark:text-gray-400">
                      <i className={`fa-solid ${FIELD_TYPES.find(ft => ft.value === f.type)?.icon || 'fa-font'} text-[9px] text-gray-400`}></i>
                      {f.label}
                    </span>
                  ))}
                  {mod.fields.length > 5 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800/60 text-[11px] text-gray-500">+{mod.fields.length - 5}</span>
                  )}
                </div>

                <div className="flex items-center gap-1 pt-3 border-t border-gray-100 dark:border-gray-800/50">
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                    onClick={() => handlePreviewModule(mod)}
                  >
                    <i className="fa-solid fa-play text-[10px]"></i>
                    {zh ? '预览' : 'Preview'}
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    onClick={() => handleEditModule(mod)}
                  >
                    <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                    {zh ? '编辑' : 'Edit'}
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    onClick={() => setDeleteTarget(mod)}
                  >
                    <i className="fa-solid fa-trash-can text-[10px]"></i>
                    {zh ? '删除' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );

  // ─── Render: Builder ───
  const renderBuilder = () => {
    if (!currentModule) return null;
    return (
      <>
        <div className="sticky -top-4 z-10 -mx-6 px-6 pt-4 pb-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors" onClick={() => { setActiveTab('list'); setCurrentModule(null); }}>
                <i className="fa-solid fa-arrow-left text-sm"></i>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{zh ? '模块配置' : 'Module Builder'}</h1>
                <p className="text-sm text-gray-500">{zh ? '定义模块字段和属性' : 'Define module fields and properties'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" onClick={() => { setActiveTab('list'); setCurrentModule(null); }}>
                {t('cancel')}
              </button>
              <button className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2" onClick={handleSaveModule}>
                <i className="fa-solid fa-check mr-1.5"></i>
                {zh ? '保存模块' : 'Save Module'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Module Settings */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800/80 p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-md btn-gradient flex items-center justify-center">
                  <i className="fa-solid fa-gear text-[10px] text-white"></i>
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{zh ? '模块设置' : 'Module Settings'}</h4>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{zh ? '模块名称' : 'Module Name'}<span className="text-red-500 ml-0.5">*</span></p>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-900/50 dark:text-white input-themed focus:ring-2 focus:ring-offset-0 transition-shadow"
                  placeholder={zh ? '例如：产品管理' : 'e.g. Product Management'}
                  value={currentModule.name}
                  onChange={(e) => setCurrentModule({ ...currentModule, name: e.target.value })}
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{zh ? '图标' : 'Icon'}</p>
                <div className="grid grid-cols-6 gap-2">
                  {ICON_OPTIONS.map(opt => (
                    <button
                      key={opt.icon}
                      className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${
                        currentModule.icon === opt.icon
                          ? 'ring-2 ring-blue-400 dark:ring-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-110'
                          : 'bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                      }`}
                      onClick={() => setCurrentModule({ ...currentModule, icon: opt.icon, iconColor: opt.color })}
                    >
                      <i className={`fa-solid ${opt.icon} text-sm`} style={{ color: opt.color }}></i>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Fields List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800/80 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md btn-gradient flex items-center justify-center">
                    <i className="fa-solid fa-list text-[10px] text-white"></i>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{zh ? '字段列表' : 'Fields'}</h4>
                  <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800/60 text-[11px] font-medium text-gray-500">{currentModule.fields.length}</span>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-blue-200 dark:border-blue-800/50" onClick={handleAddField}>
                  <i className="fa-solid fa-plus text-[10px]"></i>
                  {zh ? '添加字段' : 'Add Field'}
                </button>
              </div>

              {currentModule.fields.length === 0 ? (
                <div className="py-8 text-center">
                  <i className="fa-solid fa-layer-group text-2xl text-gray-300 dark:text-gray-600 mb-2"></i>
                  <p className="text-sm text-gray-400 dark:text-gray-500">{zh ? '暂无字段，点击上方添加' : 'No fields yet, click Add Field above'}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentModule.fields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/50 group hover:border-blue-200 dark:hover:border-blue-800/50 transition-colors"
                    >
                      <i className="fa-solid fa-grip-vertical text-[10px] text-gray-300 dark:text-gray-600 cursor-grab"></i>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50">
                        <i className={`fa-solid ${FIELD_TYPES.find(ft => ft.value === field.type)?.icon || 'fa-font'} text-xs text-gray-400`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{field.label}</span>
                          {field.required && <span className="text-red-500 text-xs">*</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-gray-400 dark:text-gray-500">{field.name}</span>
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800/50 text-gray-500">{zh ? FIELD_TYPES.find(ft => ft.value === field.type)?.label : FIELD_TYPES.find(ft => ft.value === field.type)?.labelEn}</span>
                          <span className="text-[11px] text-gray-400">{field.width === 'half' ? '50%' : '100%'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" onClick={() => handleEditField(field)}>
                          <i className="fa-solid fa-pen text-[10px]"></i>
                        </button>
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" onClick={() => handleDeleteField(field.id)}>
                          <i className="fa-solid fa-trash-can text-[10px]"></i>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  // ─── Render: Preview ───
  const renderPreview = () => {
    if (!currentModule) return null;
    return (
      <>
        <div className="sticky -top-4 z-10 -mx-6 px-6 pt-4 pb-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors" onClick={() => { setActiveTab('list'); setCurrentModule(null); }}>
                <i className="fa-solid fa-arrow-left text-sm"></i>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">{currentModule.name}</h1>
                  <span className="px-2 py-0.5 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-[11px] font-semibold text-violet-600 dark:text-violet-400">{zh ? '原型预览' : 'Prototype'}</span>
                </div>
                <p className="text-sm text-gray-500">{zh ? '自动生成的可运行原型' : 'Auto-generated runnable prototype'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" onClick={() => handleEditModule(currentModule)}>
                <i className="fa-solid fa-pen-to-square mr-1.5 text-xs"></i>
                {zh ? '编辑模块' : 'Edit Module'}
              </button>
              <button className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2 flex items-center" onClick={() => { setPreviewForm({}); setIsPreviewAddOpen(true); }}>
                <i className="fa-solid fa-plus mr-2"></i>
                {t('add')}
              </button>
            </div>
          </div>
        </div>

        {/* Generated Table */}
        <div className="bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50/80 to-gray-100/50 dark:from-gray-800/40 dark:to-gray-800/20 border-b border-gray-200/60 dark:border-gray-700/50">
                  <th className="px-5 py-3 text-left text-sm font-bold text-gray-900 dark:text-gray-200 capitalize">#</th>
                  {currentModule.fields.map(f => (
                    <th key={f.id} className="px-5 py-3 text-left text-sm font-bold text-gray-900 dark:text-gray-200 capitalize">{f.label}</th>
                  ))}
                  <th className="px-5 py-3 text-right text-sm font-bold text-gray-900 dark:text-gray-200 capitalize">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/80 dark:divide-gray-800/50">
                {previewData.length === 0 ? (
                  <tr>
                    <td colSpan={currentModule.fields.length + 2} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                          <i className={`fa-solid ${currentModule.icon} text-gray-400 dark:text-gray-500 text-lg`}></i>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{zh ? '点击上方添加按钮创建数据' : 'Click Add above to create data'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  previewData.map((row, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group hover:bg-blue-50/30 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className="text-[13px] text-gray-500 dark:text-gray-400">{idx + 1}</span>
                      </td>
                      {currentModule.fields.map(f => (
                        <td key={f.id} className="px-5 py-3 whitespace-nowrap">
                          {f.type === 'status' ? (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
                              row[f.name] === 'active'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${row[f.name] === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                              {row[f.name] === 'active' ? t('active') : t('inactive')}
                            </span>
                          ) : (
                            <span className="text-[13px] text-gray-600 dark:text-gray-400">{row[f.name] || '-'}</span>
                          )}
                        </td>
                      ))}
                      <td className="px-5 py-3 whitespace-nowrap text-right">
                        <button
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          onClick={() => setPreviewData(prev => prev.filter((_, i) => i !== idx))}
                        >
                          <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-3">
      {activeTab === 'list' && renderList()}
      {activeTab === 'builder' && renderBuilder()}
      {activeTab === 'preview' && renderPreview()}

      {/* Field Edit Modal */}
      <AnimatePresence>
        {isFieldModalOpen && editingField && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4"
            onClick={() => setIsFieldModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
              className="modal-content relative bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-100 dark:border-gray-800/80 w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 btn-gradient" />
              <div className="p-6 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{zh ? '字段设置' : 'Field Settings'}</h3>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors" onClick={() => setIsFieldModalOpen(false)}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{zh ? '字段标签' : 'Field Label'}<span className="text-red-500 ml-0.5">*</span></p>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-900/50 dark:text-white input-themed focus:ring-2 focus:ring-offset-0 transition-shadow"
                    placeholder={zh ? '例如：产品名称' : 'e.g. Product Name'}
                    value={editingField.label}
                    onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{zh ? '字段名' : 'Field Name'}</p>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-900/50 dark:text-white input-themed focus:ring-2 focus:ring-offset-0 transition-shadow"
                    placeholder={zh ? '自动生成' : 'Auto-generated'}
                    value={editingField.name}
                    onChange={(e) => setEditingField({ ...editingField, name: e.target.value })}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{zh ? '字段类型' : 'Field Type'}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {FIELD_TYPES.map(ft => (
                      <button
                        key={ft.value}
                        className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all text-xs ${
                          editingField.type === ft.value
                            ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800/50'
                            : 'border-gray-200 dark:border-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                        }`}
                        onClick={() => setEditingField({ ...editingField, type: ft.value as FieldConfig['type'] })}
                      >
                        <i className={`fa-solid ${ft.icon} text-sm`}></i>
                        <span>{zh ? ft.label : ft.labelEn}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {editingField.type === 'select' && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{zh ? '选项（逗号分隔）' : 'Options (comma separated)'}</p>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-900/50 dark:text-white input-themed focus:ring-2 focus:ring-offset-0 transition-shadow"
                      placeholder={zh ? '选项A, 选项B, 选项C' : 'Option A, Option B, Option C'}
                      value={(editingField.options || []).join(', ')}
                      onChange={(e) => setEditingField({ ...editingField, options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                      checked={editingField.required}
                      onChange={(e) => setEditingField({ ...editingField, required: e.target.checked })}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{zh ? '必填' : 'Required'}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                      checked={editingField.width === 'half'}
                      onChange={(e) => setEditingField({ ...editingField, width: e.target.checked ? 'half' : 'full' })}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{zh ? '半宽' : 'Half Width'}</span>
                  </label>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800/80 flex justify-end space-x-3">
                <button className="px-4 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" onClick={() => setIsFieldModalOpen(false)}>
                  {t('cancel')}
                </button>
                <button className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2" onClick={handleSaveField}>
                  {t('save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Add Modal */}
      <AnimatePresence>
        {isPreviewAddOpen && currentModule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4"
            onClick={() => setIsPreviewAddOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
              className="modal-content relative bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-100 dark:border-gray-800/80 w-full max-w-[60rem] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 btn-gradient" />
              <div className="p-6 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('add')} {currentModule.name}</h3>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors" onClick={() => setIsPreviewAddOpen(false)}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-gray-800/30 dark:to-gray-800/10 border border-gray-100 dark:border-gray-800/50 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md btn-gradient flex items-center justify-center">
                      <i className={`fa-solid ${currentModule.icon} text-[10px] text-white`}></i>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white capitalize">{currentModule.name}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {currentModule.fields.map(f => (
                      <div key={f.id} className={f.width === 'full' ? 'col-span-2' : ''}>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize mb-1">
                          {f.label}
                          {f.required && <span className="text-red-500 ml-0.5">*</span>}
                        </p>
                        {f.type === 'status' ? (
                          <select
                            className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white text-sm transition-all cursor-pointer focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none appearance-none"
                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'%239ca3af\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z\' clip-rule=\'evenodd\'/%3E%3C/svg%3E")', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.25em', backgroundRepeat: 'no-repeat', paddingRight: '2rem' }}
                            value={previewForm[f.name] || 'active'}
                            onChange={(e) => setPreviewForm({ ...previewForm, [f.name]: e.target.value })}
                          >
                            <option value="active">{t('active')}</option>
                            <option value="inactive">{t('inactive')}</option>
                          </select>
                        ) : f.type === 'select' ? (
                          <select
                            className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 dark:text-white text-sm transition-all cursor-pointer focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none appearance-none"
                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'%239ca3af\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z\' clip-rule=\'evenodd\'/%3E%3C/svg%3E")', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.25em', backgroundRepeat: 'no-repeat', paddingRight: '2rem' }}
                            value={previewForm[f.name] || ''}
                            onChange={(e) => setPreviewForm({ ...previewForm, [f.name]: e.target.value })}
                          >
                            <option value="">{zh ? '请选择' : 'Select...'}</option>
                            {(f.options || []).map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : f.type === 'textarea' ? (
                          <textarea
                            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-900/50 dark:text-white input-themed focus:ring-2 focus:ring-offset-0 transition-shadow resize-none"
                            rows={3}
                            value={previewForm[f.name] || ''}
                            onChange={(e) => setPreviewForm({ ...previewForm, [f.name]: e.target.value })}
                          />
                        ) : (
                          <input
                            type={f.type}
                            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-900/50 dark:text-white input-themed focus:ring-2 focus:ring-offset-0 transition-shadow"
                            value={previewForm[f.name] || ''}
                            onChange={(e) => setPreviewForm({ ...previewForm, [f.name]: e.target.value })}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800/80 flex justify-end space-x-3">
                <button className="px-4 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" onClick={() => setIsPreviewAddOpen(false)}>
                  {t('cancel')}
                </button>
                <button className="btn-gradient rounded-xl text-sm font-medium text-white px-4 py-2" onClick={handlePreviewAdd}>
                  {t('save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
              className="modal-content relative bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-100 dark:border-gray-800/80 w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-triangle-exclamation text-red-500 text-xl"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('confirmDelete')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('confirmDeleteMessage')}</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">{deleteTarget.name}</p>
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" onClick={() => setDeleteTarget(null)}>
                  {t('cancel')}
                </button>
                <button className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-medium text-white transition-colors" onClick={handleDeleteModule}>
                  {t('delete')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
