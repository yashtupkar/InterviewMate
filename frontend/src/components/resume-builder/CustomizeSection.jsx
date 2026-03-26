import React, { useState } from 'react';
import { 
  Palette, 
  Type, 
  Layout, 
  Globe, 
  Maximize, 
  ChevronDown, 
  ChevronRight,
  Check,
  Columns as ColumnsIcon,
  Grid,
  MoreHorizontal,
  ImageIcon,
  Minus,
  Plus,
  RotateCcw
} from 'lucide-react';
import { useResume } from '../../context/ResumeContext';
import { getFontFamily } from '../../utils/resumeHelpers';

const SectionWrapper = ({ id, title, icon: Icon, isOpen, onToggle, children }) => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <button
            onClick={() => onToggle(id)}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-all text-left"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400 group-hover:text-lime-400 transition-colors">
                    <Icon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-zinc-200">{title}</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-zinc-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
            <div className="p-4 pt-0 border-t border-zinc-800 space-y-6 animate-in slide-in-from-top-2 duration-200">
                <div className="h-4" />
                {children}
            </div>
        )}
    </div>
);

const PremiumSlider = ({ label, value, min, max, step, unit = '', onChange }) => {
    // Calculate percentage for tick marks and thumb
    const range = max - min;
    const ticks = Math.floor(range / step);
    
    const handleIncrement = () => onChange(Math.min(max, value + step));
    const handleDecrement = () => onChange(Math.max(min, value - step));

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center text-zinc-200">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
                <span className="text-xs font-bold text-zinc-300">{value}{unit}</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative flex-1 h-10 bg-zinc-800/50 rounded-lg flex items-center px-1 border border-zinc-800 shadow-inner group">
                    {/* Tick Marks */}
                    <div className="absolute inset-x-4 inset-y-0 flex justify-between items-center px-0.5 opacity-20 group-hover:opacity-40 transition-opacity">
                        {Array.from({ length: ticks + 1 }).map((_, i) => (
                            <div key={i} className="w-0.5 h-3 bg-zinc-500 rounded-full" />
                        ))}
                    </div>
                    
                    {/* Hidden Input Slider */}
                    <input 
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={value}
                        onChange={(e) => onChange(parseFloat(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />

                    {/* Visual Thumb */}
                    <div 
                        className="absolute w-8 h-8 bg-[#bef264] rounded-md shadow-[0_0_15px_rgba(190,242,100,0.4)] flex items-center justify-center pointer-events-none z-10"
                        style={{ 
                            left: `calc(${(value - min) / range * 100}% + (1px))`,
                            transform: `translateX(-50%)`,
                            marginLeft: '-1px'
                        }}
                    >
                        <div className="w-1 h-3 bg-white/40 rounded-full" />
                    </div>
                </div>

                <div className="flex gap-1">
                    <button onClick={handleDecrement} className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shadow-sm">
                        <Minus className="w-4 h-4" />
                    </button>
                    <button onClick={handleIncrement} className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shadow-sm">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const FONT_GROUPS = {
    serif: [
        'Lora', 'Source Serif Pro', 'Zilla Slab', 'PT Serif', 'Literata', 
        'EB Garamond', 'Latin Modern', 'Aleo', 'Crimson Pro', 'Cormorant Garamond', 
        'Vollkorn', 'Amiri', 'Crimson Text', 'Alegreya', 'Playfair Display'
    ],
    sans: [
        'Inter', 'Roboto', 'Outfit', 'Space Grotesk'
    ],
    mono: [
        'Mono', 'Roboto Mono', 'Inconsolata'
    ]
};

const FontSelector = ({ label, value, onChange }) => {
    const [activeGroup, setActiveGroup] = useState(() => {
        if (FONT_GROUPS.sans.includes(value)) return 'sans';
        if (FONT_GROUPS.mono.includes(value)) return 'mono';
        return 'serif';
    });

    return (
        <div className="space-y-4">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{label}</label>
            
            {/* Category Cards */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { id: 'serif', name: 'Serif', font: 'serif' },
                    { id: 'sans', name: 'Sans', font: 'sans-serif' },
                    { id: 'mono', name: 'Mono', font: 'monospace' }
                ].map(group => (
                    <button
                        key={group.id}
                        onClick={() => setActiveGroup(group.id)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-1 ${
                            activeGroup === group.id 
                            ? 'bg-lime-400/10 border-lime-400 text-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.1)]' 
                            : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                        }`}
                    >
                        <span className="text-3xl font-medium" style={{ fontFamily: group.font }}>Aa</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider">{group.name}</span>
                    </button>
                ))}
            </div>

            {/* Font Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-1">
                {FONT_GROUPS[activeGroup].map(font => (
                    <button
                        key={font}
                        onClick={() => onChange(font)}
                        style={{ fontFamily: getFontFamily(font) }}
                        className={`py-2.5 px-3 rounded-xl border text-sm transition-all text-center truncate ${
                            value === font 
                            ? 'bg-lime-400/10 border-lime-400 text-lime-400 font-bold' 
                            : 'bg-zinc-800/30 border-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                        }`}
                        title={font}
                    >
                        {font}
                    </button>
                ))}
            </div>
        </div>
    );
};

const CustomizeSection = () => {
    const { resumeData, updateCustomizations, resetCustomizations } = useResume();
    const [openSection, setOpenSection] = useState('layout');

    const c = resumeData.customizations || {};

    const toggleSection = (id) => {
        setOpenSection(openSection === id ? null : id);
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center justify-between px-2 py-4">
                <div>
                    <h2 className="text-xl font-black text-white mb-2 tracking-tight">Design System</h2>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Global Style Controls</p>
                </div>
                <button 
                    onClick={() => {
                        if(window.confirm("Are you sure you want to reset all design customizations to default?")) {
                            resetCustomizations();
                        }
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl border border-white/5 transition-all text-[10px] font-black uppercase tracking-wider group"
                    title="Reset to Default"
                >
                    <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-45deg] transition-transform" />
                    Reset
                </button>
            </div>

            <div className="space-y-4">
                {/* Language & Region */}
                <SectionWrapper 
                    id="language" 
                    title="Language & Region" 
                    icon={Globe} 
                    isOpen={openSection === 'language'} 
                    onToggle={toggleSection}
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Language</label>
                            <select 
                                value={c.language || 'English (UK)'}
                                onChange={(e) => updateCustomizations('language', e.target.value)}
                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg py-2 px-3 text-sm text-white focus:ring-lime-400 focus:border-lime-400"
                            >
                                <option>English (UK)</option>
                                <option>English (US)</option>
                                <option>German</option>
                                <option>French</option>
                                <option>Spanish</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Date Format</label>
                            <select 
                                value={c.dateFormat || 'DD/MM/YYYY'}
                                onChange={(e) => updateCustomizations('dateFormat', e.target.value)}
                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg py-2 px-3 text-sm text-white focus:ring-lime-400 focus:border-lime-400"
                            >
                                <option>DD/MM/YYYY</option>
                                <option>MM/DD/YYYY</option>
                                <option>YYYY-MM-DD</option>
                                <option>Month YYYY</option>
                            </select>
                        </div>
                    </div>
                </SectionWrapper>

                {/* Layout & Spacing */}
                <SectionWrapper 
                    id="layout" 
                    title="Layout & Spacing" 
                    icon={Layout} 
                    isOpen={openSection === 'layout'} 
                    onToggle={toggleSection}
                >
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Columns</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['one', 'two'].map(col => (
                                    <button
                                        key={col}
                                        onClick={() => updateCustomizations('layout.columns', col)}
                                        className={`py-2 px-3 rounded-lg border text-sm font-medium capitalize transition-all ${
                                            c.layout?.columns === col
                                                ? 'bg-[#bef264]/10 border-[#bef264] text-[#bef264] shadow-[0_0_15px_rgba(190,242,100,0.1)]'
                                                : 'bg-zinc-800/50 border-zinc-700 text-gray-400 hover:border-zinc-500'
                                        }`}
                                    >
                                        {col} Column
                                    </button>
                                ))}
                            </div>
                        </div>

                        <PremiumSlider 
                            label="Font Size"
                            value={parseFloat(c.layout?.spacing?.fontSize) || 10.5}
                            min={8} max={14} step={0.5} unit="pt"
                            onChange={(val) => updateCustomizations('layout.spacing.fontSize', `${val}pt`)}
                        />

                        <PremiumSlider 
                            label="Line Height"
                            value={c.layout?.spacing?.lineHeight || 1.15}
                            min={1} max={2.5} step={0.05}
                            onChange={(val) => updateCustomizations('layout.spacing.lineHeight', val)}
                        />

                        <PremiumSlider 
                            label="Left & Right Margin"
                            value={parseInt(c.layout?.spacing?.margin?.left) || 22}
                            min={0} max={50} step={2} unit="mm"
                            onChange={(val) => {
                                updateCustomizations('layout.spacing.margin.left', `${val}mm`);
                                updateCustomizations('layout.spacing.margin.right', `${val}mm`);
                            }}
                        />

                        <PremiumSlider 
                            label="Top & Bottom Margin"
                            value={parseInt(c.layout?.spacing?.margin?.top) || 12}
                            min={0} max={50} step={2} unit="mm"
                            onChange={(val) => {
                                updateCustomizations('layout.spacing.margin.top', `${val}mm`);
                                updateCustomizations('layout.spacing.margin.bottom', `${val}mm`);
                            }}
                        />

                        <PremiumSlider 
                            label="Space between Entries"
                            value={c.layout?.spacing?.spaceBetweenEntries || 10}
                            min={0} max={40} step={2}
                            onChange={(val) => updateCustomizations('layout.spacing.spaceBetweenEntries', val)}
                        />
                    </div>
                </SectionWrapper>

                {/* Colors */}
                <SectionWrapper 
                    id="colors" 
                    title="Colors" 
                    icon={Palette} 
                    isOpen={openSection === 'colors'} 
                    onToggle={toggleSection}
                >
                    <div className="space-y-8">
                        {/* Circle Mode Toggles */}
                    

                        {/* Swatches */}
                        <div className="space-y-4 pt-2">
                             <div className="flex flex-wrap gap-2.5 justify-center">
                                {/* None Option */}
                                <button 
                                    onClick={() => updateCustomizations('colors.accent', 'transparent')}
                                    className="w-9 h-9 rounded-full border-2 border-zinc-700 relative overflow-hidden bg-white/5 group"
                                >
                                    <div className="absolute top-1/2 left-1/2 -rotate-45 -translate-x-1/2 -translate-y-1/2 w-[120%] h-0.5 bg-red-500/80" />
                                </button>

                                {/* Preset Swatches */}
                                {[
                                    '#475569', '#334155', '#4d7c0f', '#065f46', '#0369a1', '#1e40af', '#4338ca', '#6d28d9', '#a21caf', '#be185d', '#be123c', '#9f1239'
                                ].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => updateCustomizations('colors.accent', color)}
                                        className={`w-9 h-9 rounded-full border-2 transition-all transform hover:scale-110 ${c.colors?.accent === color ? 'border-white ring-2 ring-indigo-500' : 'border-transparent'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}

                                {/* Custom Color Wheel */}
                                <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-zinc-700 cursor-pointer group shadow-lg">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-red-500 via-green-500 to-blue-500 rotate-45" />
                                    <input 
                                        type="color" 
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        value={c.colors?.accent}
                                        onChange={(e) => updateCustomizations('colors.accent', e.target.value)}
                                    />
                                </div>
                             </div>
                        </div>

                        {/* Apply To Grid */}
                        <div className="space-y-4 pt-4 border-t border-zinc-800">
                            <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Apply accent color</h4>
                            <div className="grid grid-cols-2 gap-y-3">
                                {[
                                    { key: 'name', label: 'Name' },
                                    { key: 'dotsBarsBubbles', label: 'Dots/Bars/Bubbles' },
                                    { key: 'jobTitle', label: 'Job title' },
                                    { key: 'dates', label: 'Dates' },
                                    { key: 'headings', label: 'Headings' },
                                    { key: 'entrySubtitle', label: 'Entry subtitle' },
                                    { key: 'headingsLine', label: 'Headings Line' },
                                    { key: 'linkIcons', label: 'Link icons' },
                                    { key: 'headerIcons', label: 'Header icons' }
                                ].map(item => (
                                    <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                checked={c.colors?.applyTo?.[item.key]}
                                                onChange={(e) => updateCustomizations(`colors.applyTo.${item.key}`, e.target.checked)}
                                                className="peer sr-only"
                                            />
                                            <div className="w-5 h-5 bg-zinc-800 border-2 border-zinc-700 rounded transition-all peer-checked:bg-white peer-checked:border-white group-hover:border-zinc-500 shadow-sm" />
                                            <Check className="absolute top-0.5 left-0.5 w-4 h-4 text-black opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200">{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </SectionWrapper>

                {/* Typography */}
                <SectionWrapper 
                    id="typography" 
                    title="Typography" 
                    icon={Type} 
                    isOpen={openSection === 'typography'} 
                    onToggle={toggleSection}
                >
                    <div className="space-y-8">
                        <FontSelector 
                            label="Select Font"
                            value={c.fonts?.headings || 'Inter'}
                            onChange={(val) => {
                                updateCustomizations('fonts.headings', val);
                                updateCustomizations('fonts.body', val);
                            }}
                        />
                    </div>
                </SectionWrapper>

                {/* Headings & Entries */}
                <SectionWrapper 
                    id="headings-entries" 
                    title="Headings & Entries" 
                    icon={Maximize} 
                    isOpen={openSection === 'headings-entries'} 
                    onToggle={toggleSection}
                >
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Heading Capitalization</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['capitalize', 'uppercase'].map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => updateCustomizations('sectionHeadings.capitalization', mode)}
                                        className={`py-2 px-3 rounded-lg border text-sm font-medium capitalize transition-all ${
                                            c.sectionHeadings?.capitalization === mode
                                                ? 'bg-lime-400/10 border-lime-400 text-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.1)]'
                                                : 'bg-zinc-800/50 border-zinc-700 text-gray-400 hover:border-zinc-500'
                                        }`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Subtitle Style</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['bold', 'italic', 'normal'].map(style => (
                                    <button
                                        key={style}
                                        onClick={() => updateCustomizations('entryLayout.subtitleStyle', style)}
                                        className={`py-2 px-3 rounded-lg border text-sm font-medium capitalize transition-all ${
                                            c.entryLayout?.subtitleStyle === style
                                                ? 'bg-lime-400/10 border-lime-400 text-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.1)]'
                                                : 'bg-zinc-800/50 border-zinc-700 text-gray-400 hover:border-zinc-500'
                                        }`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">List Style</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['bullet', 'hyphen', 'none'].map(style => (
                                    <button
                                        key={style}
                                        onClick={() => updateCustomizations('entryLayout.listStyle', style)}
                                        className={`py-2 px-3 rounded-lg border text-sm font-medium capitalize transition-all ${
                                            c.entryLayout?.listStyle === style
                                                ? 'bg-lime-400/10 border-lime-400 text-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.1)]'
                                                : 'bg-zinc-800/50 border-zinc-700 text-gray-400 hover:border-zinc-500'
                                        }`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </SectionWrapper>

                {/* Profile Image */}
                 <SectionWrapper 
                    id="profile-image" 
                    title="Profile Image" 
                    icon={ImageIcon} 
                    isOpen={openSection === 'profile-image'} 
                    onToggle={toggleSection}
                >
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Image Style</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['square', 'rounded', 'circle'].map(style => (
                                    <button
                                        key={style}
                                        onClick={() => updateCustomizations('profileImage.style', style)}
                                        className={`py-2 px-3 rounded-lg border text-sm font-medium capitalize transition-all ${
                                            c.profileImage?.style === style
                                                ? 'bg-lime-400/10 border-lime-400 text-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.1)]'
                                                : 'bg-zinc-800/50 border-zinc-700 text-gray-400 hover:border-zinc-500'
                                        }`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {c.profileImage?.style === 'rounded' && (
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Corner Roundness</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="0"
                                        max="50"
                                        value={c.profileImage?.borderRadius || 8}
                                        onChange={(e) => updateCustomizations('profileImage.borderRadius', parseInt(e.target.value))}
                                        className="flex-1 accent-lime-400"
                                    />
                                    <span className="text-sm font-mono text-lime-400 bg-zinc-800 px-2 py-1 rounded">{c.profileImage?.borderRadius || 8}px</span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Image Size</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="40"
                                    max="150"
                                    step="5"
                                    value={c.profileImage?.size || 80}
                                    onChange={(e) => updateCustomizations('profileImage.size', parseInt(e.target.value))}
                                    className="flex-1 accent-lime-400"
                                />
                                <span className="text-sm font-mono text-lime-400 bg-zinc-800 px-2 py-1 rounded">{c.profileImage?.size || 80}px</span>
                            </div>
                        </div>
                    </div>
                </SectionWrapper>
            </div>
        </div>
    );
};

export default CustomizeSection;
