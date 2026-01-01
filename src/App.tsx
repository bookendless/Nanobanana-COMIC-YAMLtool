import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout, Users, FileText, Plus, Trash2, Copy, Image as ImageIcon, MessageCircle, Download, ChevronLeft, ChevronRight, Clapperboard, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { ComicData, Panel, Dialogue } from './types';
import jsYaml from 'js-yaml';
import CharacterSheetGenerator from './components/CharacterSheetGenerator';
import ConfirmDialog from './components/ConfirmDialog';
import { enhancePanelDescription, GENERIC_DIRECTIONS } from './services/aiDirecting';
import { suggestRandomStyles, StyleSuggestion } from './services/styleAnalysis';

const STORAGE_KEY = 'nano-banana-pro-data';

const createDialogue = (): Dialogue => ({
    id: Math.random().toString(36).substr(2, 9),
    speaker: '',
    text: '',
    bubble_style: '標準吹き出し'
});

const DEFAULT_DATA: ComicData = {
    title: "新規プロジェクト",
    format: {
        aspect_ratio: "2:3",
        orientation: "vertical",
        reading_order: "right_to_left_japanese",
        style: "classic_japanese_manga_black_and_white",
        resolution: "high_detail",
        panel_count: 1,
    },
    characters: {
        protagonist: {
            id: 'char-1',
            name: "あかり",
            appearance: "黒髪ポニーテール、女子高生制服、明るい表情",
            reference: "uploaded_character_sheet"
        }
    },
    panels: [
        {
            id: 'panel-1',
            panel: 1,
            description: "導入シーンの解説",
            dialogues: [createDialogue()],
            effects: ""
        }
    ],
    style_guidelines: ["高詳細、太い線、スクリーントーン使用"]
};

// 演出系プリセット（構図・カメラワーク・コマ割りなど）
const DIRECTION_PRESETS = [
    "スピードラインと集中線による動的な演出",
    "感情表現豊かなキャラクターの表情",
    "シネマティックな暗いライティングと影",
    "背景のパースを強調した広角ショット",
    "柔らかな枠線、回想シーン風",
    "大胆なコマ割り、複雑な構図",
    "セリフ吹き出しのダイナミックな配置",
    "複数の吹き出しを自然に配置、話し手が明確",
];

// スタイル系プリセット（画風・タッチ・色調など）
const STYLE_PRESETS = [
    "キャラクターは参照画像と完全に一致",
    "高詳細、精密な描写",
    "太い主線、マンガらしい力強いタッチ",
    "繊細な細線、少女漫画風の透明感",
    "スクリーントーン多用、レトロな雰囲気",
    "リアル調、実写風",
    "水彩画調、柔らかな線、絵本風",
    "フラットな色調、セル画風",
    "ソフトな線、デフォルメキャラ、４コマ風",
    "劇画タッチ、太い線、精密な描写",
    "アニメ調、ファンタジー、アースカラー、繊細な描き込み",
    "線が細い、透明感、柔らかな色調"
];

const BUBBLE_STYLES = [
    { value: "標準吹き出し", label: "標準吹き出し" },
    { value: "叫び吹き出し", label: "叫び（ギザギザ）" },
    { value: "思考吹き出し", label: "思考（もくもく）" },
    { value: "ささやき吹き出し", label: "ささやき（点線）" },
    { value: "ナレーション", label: "ナレーション" },
    { value: "心の声", label: "心の声（波線）" },
    { value: "電話・通信", label: "電話・通信" },
    { value: "回想", label: "回想（ぼかし枠）" },
];

// データマイグレーション: 旧形式から新形式に変換
const migrateData = (data: any): ComicData => {
    if (!data.panels) return data;

    const migratedPanels = data.panels.map((p: any) => {
        if (Array.isArray(p.dialogues)) {
            return p;
        }
        return {
            id: p.id,
            panel: p.panel,
            description: p.description || '',
            dialogues: [{
                id: Math.random().toString(36).substr(2, 9),
                speaker: p.speaker || '',
                text: p.dialogue || '',
                bubble_style: p.bubble_style || '標準吹き出し'
            }],
            effects: p.effects || ''
        };
    });

    return { ...data, panels: migratedPanels };
};

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'format' | 'characters' | 'sheet' | 'panels'>('format');
    const [data, setData] = useState<ComicData>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return migrateData(parsed);
            } catch {
                return DEFAULT_DATA;
            }
        }
        return DEFAULT_DATA;
    });
    const [customGuideline, setCustomGuideline] = useState("");
    const [notification, setNotification] = useState<{ message: string, type: 'info' | 'success' | 'error' } | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });
    const [yamlPanelCollapsed, setYamlPanelCollapsed] = useState(false);
    const [enhancingPanelId, setEnhancingPanelId] = useState<string | null>(null);
    const [expandedDirectionPanelId, setExpandedDirectionPanelId] = useState<string | null>(null);

    const [isAnalyzingStyle, setIsAnalyzingStyle] = useState(false);
    const [suggestedStyle, setSuggestedStyle] = useState<StyleSuggestion | null>(null);


    // LocalStorage保存
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [data]);



    const showNotification = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 2500);
    }, []);

    const showConfirm = (title: string, message: string, onConfirm: () => void) => {
        setConfirmDialog({ isOpen: true, title, message, onConfirm });
    };

    const closeConfirm = () => {
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => { } });
    };

    const updateFormat = (key: keyof typeof data.format, value: string | number) => {
        setData(prev => ({
            ...prev,
            format: { ...prev.format, [key]: value }
        }));
    };

    const addPanel = () => {
        const newPanel: Panel = {
            id: Math.random().toString(36).substr(2, 9),
            panel: data.panels.length + 1,
            description: "",
            dialogues: [createDialogue()],
            effects: ""
        };
        setData((prev: ComicData) => ({
            ...prev,
            panels: [...prev.panels, newPanel],
            format: { ...prev.format, panel_count: prev.panels.length + 1 }
        }));
        showNotification("コマを追加しました", "success");
    };

    const removePanel = (id: string) => {
        const panel = data.panels.find(p => p.id === id);
        showConfirm(
            "コマを削除",
            `Panel ${panel?.panel} を削除しますか？この操作は取り消せません。`,
            () => {
                setData((prev: ComicData) => {
                    const newPanels = prev.panels.filter((p: Panel) => p.id !== id).map((p: Panel, i: number) => ({ ...p, panel: i + 1 }));
                    return {
                        ...prev,
                        panels: newPanels,
                        format: { ...prev.format, panel_count: newPanels.length }
                    };
                });
                showNotification("コマを削除しました");
                closeConfirm();
            }
        );
    };

    const updatePanel = (id: string, updates: Partial<Panel>) => {
        setData((prev: ComicData) => ({
            ...prev,
            panels: prev.panels.map((p: Panel) => p.id === id ? { ...p, ...updates } : p)
        }));
    };

    const addDialogue = (panelId: string) => {
        setData(prev => ({
            ...prev,
            panels: prev.panels.map(p =>
                p.id === panelId
                    ? { ...p, dialogues: [...p.dialogues, createDialogue()] }
                    : p
            )
        }));
        showNotification("セリフを追加しました", "success");
    };

    const updateDialogue = (panelId: string, dialogueId: string, updates: Partial<Dialogue>) => {
        setData(prev => ({
            ...prev,
            panels: prev.panels.map(p =>
                p.id === panelId
                    ? {
                        ...p,
                        dialogues: p.dialogues.map(d =>
                            d.id === dialogueId ? { ...d, ...updates } : d
                        )
                    }
                    : p
            )
        }));
    };

    const removeDialogue = (panelId: string, dialogueId: string) => {
        setData(prev => ({
            ...prev,
            panels: prev.panels.map(p =>
                p.id === panelId
                    ? { ...p, dialogues: p.dialogues.filter(d => d.id !== dialogueId) }
                    : p
            )
        }));
        showNotification("セリフを削除しました");
    };

    const addCharacter = () => {
        const id = Math.random().toString(36).substr(2, 9);
        setData(prev => ({
            ...prev,
            characters: {
                ...prev.characters,
                [`character_${id}`]: { id, name: "新規キャラ", appearance: "" }
            }
        }));
        showNotification("キャラクターを追加しました", "success");
    };

    const removeCharacter = (key: string) => {
        const char = data.characters[key];
        showConfirm(
            "キャラクターを削除",
            `「${char?.name}」を削除しますか？この操作は取り消せません。`,
            () => {
                const newChars = { ...data.characters };
                delete newChars[key];
                setData({ ...data, characters: newChars });
                showNotification("キャラクターを削除しました");
                closeConfirm();
            }
        );
    };

    const yamlOutput = useMemo(() => {
        const output = {
            comic_page: {
                title: data.title,
                format: data.format,
                characters: Object.entries(data.characters).reduce((acc, [key, char]) => {
                    acc[key] = {
                        name: char.name,
                        appearance: char.appearance,
                        reference: char.reference
                    };
                    return acc;
                }, {} as Record<string, { name: string; appearance: string; reference?: string }>),
                panels: data.panels.map(p => ({
                    panel: p.panel,
                    description: p.description,
                    dialogues: p.dialogues.map(d => ({
                        speaker: d.speaker,
                        text: d.text,
                        bubble_style: d.bubble_style
                    })),
                    effects: p.effects
                })),
                style_guidelines: data.style_guidelines
            }
        };
        return jsYaml.dump(output);
    }, [data]);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showNotification("クリップボードにコピーしました", "success");
        } catch {
            showNotification("コピーに失敗しました", "error");
        }
    };

    const downloadYaml = () => {
        const blob = new Blob([yamlOutput], { type: 'text/yaml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.title.replace(/\s+/g, '_')}.yaml`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification("YAMLファイルを保存しました", "success");
    };

    const characterList = Object.entries(data.characters);

    const handleDirectorCut = async (panelId: string, currentDescription: string) => {
        setEnhancingPanelId(panelId);
        try {
            const enhancedDescription = await enhancePanelDescription(currentDescription);
            updatePanel(panelId, { description: enhancedDescription });
            showNotification("演出を追加しました", "success");
        } catch (error) {
            showNotification("AI演出の生成に失敗しました", "error");
        } finally {
            setEnhancingPanelId(null);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* 通知トースト */}
            {notification && (
                <div className="fixed top-6 right-6 z-50 animate-fade-in">
                    <div className={`px-6 py-3 rounded-xl backdrop-blur-md border shadow-2xl ${notification.type === 'success'
                        ? 'bg-emerald-500/90 border-emerald-400 text-white'
                        : notification.type === 'error'
                            ? 'bg-rose-500/90 border-rose-400 text-white'
                            : 'bg-indigo-500/90 border-indigo-400 text-white'
                        }`}>
                        {notification.message}
                    </div>
                </div>
            )}

            {/* 確認ダイアログ */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={confirmDialog.onConfirm}
                onCancel={closeConfirm}
            />

            {/* ヘッダー */}
            <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-4 py-3 sticky top-0 z-40">
                <div className="max-w-[1800px] mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-rose-400">
                            Nano Banana Pro Support
                        </h1>
                        <p className="text-xs text-dim hidden sm:block">漫画構成YAML生成アシスタント</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-dim hidden md:block">{data.style_guidelines.length} Guidelines</span>



                        <button
                            onClick={() => copyToClipboard(yamlOutput)}
                            className="btn-ghost text-sm py-2 px-3"
                        >
                            <Copy className="w-4 h-4" /> <span className="hidden sm:inline">コピー</span>
                        </button>
                        <button
                            onClick={downloadYaml}
                            className="btn-primary text-sm py-2 px-3"
                        >
                            <Download className="w-4 h-4" /> <span className="hidden sm:inline">保存</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* メインコンテンツ - 二分割レイアウト */}
            <div className="flex-1 flex flex-col lg:flex-row">
                {/* 左側: エディターパネル */}
                <div className={`flex-1 flex flex-col min-w-0 ${yamlPanelCollapsed ? '' : 'lg:max-w-[60%]'}`}>
                    {/* タブナビゲーション */}
                    <div className="tab-container px-4 pt-4 bg-transparent border-b-0">
                        <div className={`tab-item ${activeTab === 'format' ? 'active' : ''}`} onClick={() => setActiveTab('format')}>
                            <Layout className="w-4 h-4" /> <span className="hidden sm:inline">基本設定</span><span className="sm:hidden">設定</span>
                        </div>
                        <div className={`tab-item ${activeTab === 'characters' ? 'active' : ''}`} onClick={() => setActiveTab('characters')}>
                            <Users className="w-4 h-4" /> <span className="hidden sm:inline">キャラクター</span><span className="sm:hidden">キャラ</span>
                        </div>
                        <div className={`tab-item ${activeTab === 'sheet' ? 'active' : ''}`} onClick={() => setActiveTab('sheet')}>
                            <ImageIcon className="w-4 h-4" /> <span className="hidden sm:inline">キャラシート</span><span className="sm:hidden">シート</span>
                        </div>
                        <div className={`tab-item ${activeTab === 'panels' ? 'active' : ''}`} onClick={() => setActiveTab('panels')}>
                            <FileText className="w-4 h-4" /> <span className="hidden sm:inline">コマ割り</span><span className="sm:hidden">コマ</span>
                        </div>
                    </div>

                    {/* エディターコンテンツ */}
                    <main className="flex-1 overflow-y-auto p-4">
                        <div className="glass p-6 min-h-full animate-fade-in">
                            {activeTab === 'format' && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-xl font-semibold mb-4 text-indigo-300">Layout & Format</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2 opacity-80">タイトル</label>
                                                <input
                                                    className="input-field"
                                                    value={data.title}
                                                    onChange={(e) => setData({ ...data, title: e.target.value })}
                                                    placeholder="例: 夢の始まり - ページ1"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2 opacity-80">アスペクト比</label>
                                                <select className="input-field" value={data.format.aspect_ratio} onChange={(e) => updateFormat('aspect_ratio', e.target.value)}>
                                                    <option value="2:3">2:3 (縦長)</option>
                                                    <option value="3:2">3:2 (横長)</option>
                                                    <option value="1:1">1:1 (スクエア)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2 opacity-80">読み順</label>
                                                <select className="input-field" value={data.format.reading_order} onChange={(e) => updateFormat('reading_order', e.target.value)}>
                                                    <option value="right_to_left_japanese">右から左</option>
                                                    <option value="left_to_right">左から右</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2 opacity-80">スタイル</label>
                                                <select className="input-field" value={data.format.style} onChange={(e) => updateFormat('style', e.target.value)}>
                                                    <option value="japanese_manga_black_and_white">白黒</option>
                                                    <option value="full_color">フルカラー</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-white/10 pt-6">
                                        <h2 className="text-xl font-semibold mb-4 text-rose-300">Style Guidelines</h2>

                                        {/* 演出系 */}
                                        <h3 className="text-sm font-medium mb-2 text-amber-300">演出系（構図・カメラワーク・コマ割り）</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                                            {DIRECTION_PRESETS.map((preset, idx) => {
                                                const isSelected = data.style_guidelines.includes(preset);
                                                return (
                                                    <div
                                                        key={`dir-${idx}`}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setData({ ...data, style_guidelines: data.style_guidelines.filter(g => g !== preset) });
                                                            } else {
                                                                setData({ ...data, style_guidelines: [...data.style_guidelines, preset] });
                                                            }
                                                        }}
                                                        className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center gap-2 text-sm ${isSelected
                                                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                                                            : 'bg-white/5 border-white/10 text-dim hover:bg-white/10'
                                                            }`}
                                                    >
                                                        <div className={`w-3 h-3 rounded border flex-shrink-0 ${isSelected ? 'bg-amber-500 border-amber-500' : 'border-white/30'}`} />
                                                        <span className="truncate">{preset}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* スタイル系 */}
                                        <h3 className="text-sm font-medium mb-2 text-rose-300">スタイル系（画風・タッチ・色調）</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                                            {STYLE_PRESETS.map((preset, idx) => {
                                                const isSelected = data.style_guidelines.includes(preset);
                                                return (
                                                    <div
                                                        key={`style-${idx}`}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setData({ ...data, style_guidelines: data.style_guidelines.filter(g => g !== preset) });
                                                            } else {
                                                                setData({ ...data, style_guidelines: [...data.style_guidelines, preset] });
                                                            }
                                                        }}
                                                        className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center gap-2 text-sm ${isSelected
                                                            ? 'bg-rose-500/20 border-rose-500/50 text-rose-200'
                                                            : 'bg-white/5 border-white/10 text-dim hover:bg-white/10'
                                                            }`}
                                                    >
                                                        <div className={`w-3 h-3 rounded border flex-shrink-0 ${isSelected ? 'bg-rose-500 border-rose-500' : 'border-white/30'}`} />
                                                        <span className="truncate">{preset}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* カスタム入力 */}
                                        <div className="flex gap-2">
                                            <input
                                                className="input-field flex-1 text-sm"
                                                placeholder="カスタムガイドラインを追加..."
                                                value={customGuideline}
                                                onChange={(e) => setCustomGuideline(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && customGuideline.trim()) {
                                                        setData({ ...data, style_guidelines: [...data.style_guidelines, customGuideline.trim()] });
                                                        setCustomGuideline("");
                                                    }
                                                }}
                                            />
                                            <button
                                                className="btn-primary py-2 px-4"
                                                onClick={() => {
                                                    if (customGuideline.trim()) {
                                                        setData({ ...data, style_guidelines: [...data.style_guidelines, customGuideline.trim()] });
                                                        setCustomGuideline("");
                                                    }
                                                }}
                                            >
                                                追加
                                            </button>
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {data.style_guidelines.filter(g => !STYLE_PRESETS.includes(g) && !DIRECTION_PRESETS.includes(g)).map((g, idx) => (
                                                <span key={idx} className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                                    {g}
                                                    <Trash2 className="w-3 h-3 cursor-pointer hover:text-rose-400" onClick={() => setData({ ...data, style_guidelines: data.style_guidelines.filter(guideline => guideline !== g) })} />
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Style Remix Section */}
                                    <div className="border-t border-white/10 pt-6">
                                        <h2 className="text-xl font-semibold mb-4 text-purple-300 flex items-center gap-2">
                                            <Sparkles className="w-5 h-5" /> Style Remix
                                        </h2>
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                            <p className="text-sm text-dim mb-3">
                                                ボタンを押すと、ランダムなスタイル提案が表示されます。気に入ったタグをクリックしてStyle Guidelinesに追加できます。
                                            </p>

                                            <div className="flex flex-col">
                                                <button
                                                    onClick={async () => {
                                                        setIsAnalyzingStyle(true);
                                                        try {
                                                            const result = await suggestRandomStyles();
                                                            setSuggestedStyle(result);
                                                            showNotification(`「${result.name}」スタイルを提案しました`, "success");
                                                        } catch (error) {
                                                            showNotification("提案の作成に失敗しました", "error");
                                                        } finally {
                                                            setIsAnalyzingStyle(false);
                                                        }
                                                    }}
                                                    disabled={isAnalyzingStyle}
                                                    className={`btn-primary w-full mb-3 flex items-center justify-center gap-2 ${isAnalyzingStyle ? 'opacity-80' : ''}`}
                                                >
                                                    {isAnalyzingStyle ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            提案作成中...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="w-4 h-4" />
                                                            ランダムスタイル提案
                                                        </>
                                                    )}
                                                </button>

                                                {suggestedStyle && (
                                                    <div className="space-y-3 animate-fade-in">
                                                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                                                            <p className="text-sm font-medium text-purple-200 mb-1">🎨 {suggestedStyle.name}</p>
                                                            <p className="text-xs text-dim">以下のタグをクリックしてStyle Guidelinesに追加できます</p>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {suggestedStyle.keywords.map((tag, idx) => {
                                                                const isApplied = data.style_guidelines.includes(tag);
                                                                return (
                                                                    <button
                                                                        key={idx}
                                                                        onClick={() => {
                                                                            if (!isApplied) {
                                                                                setData({ ...data, style_guidelines: [...data.style_guidelines, tag] });
                                                                                showNotification(`「${tag}」を追加しました`, "success");
                                                                            }
                                                                        }}
                                                                        disabled={isApplied}
                                                                        className={`text-xs px-2 py-1 rounded-full border transition-all ${isApplied
                                                                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 cursor-default'
                                                                            : 'bg-purple-500/20 border-purple-500/50 text-purple-200 hover:bg-purple-500/30'
                                                                            }`}
                                                                    >
                                                                        {tag} {isApplied && "✓"}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'characters' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-semibold">キャラクター設定</h2>
                                        <button className="btn-primary py-2 px-3 text-sm" onClick={addCharacter}>
                                            <Plus className="w-4 h-4" /> 追加
                                        </button>
                                    </div>
                                    {characterList.length === 0 ? (
                                        <div className="text-center py-12 text-dim">
                                            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                            <p className="mb-3">キャラクターがまだ登録されていません</p>
                                            <button className="btn-primary py-2 px-4" onClick={addCharacter}>
                                                <Plus className="w-4 h-4" /> キャラクターを追加
                                            </button>
                                        </div>
                                    ) : (
                                        characterList.map(([key, char]) => (
                                            <div key={key} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <input
                                                        className="bg-transparent text-lg font-bold focus:outline-none"
                                                        value={char.name}
                                                        onChange={(e) => setData(prev => ({ ...prev, characters: { ...prev.characters, [key]: { ...char, name: e.target.value } } }))}
                                                    />
                                                    <button onClick={() => removeCharacter(key)} className="text-rose-400 hover:text-rose-300 p-1">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-dim mb-1">見た目の特徴</label>
                                                    <textarea
                                                        className="input-field min-h-[60px] resize-y text-sm"
                                                        value={char.appearance}
                                                        onChange={(e) => setData(prev => ({ ...prev, characters: { ...prev.characters, [key]: { ...char, appearance: e.target.value } } }))}
                                                        placeholder="外見の特徴を記述..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-dim mb-1">参照画像</label>
                                                    <input
                                                        className="input-field text-sm"
                                                        value={char.reference || ''}
                                                        onChange={(e) => setData(prev => ({ ...prev, characters: { ...prev.characters, [key]: { ...char, reference: e.target.value } } }))}
                                                        placeholder="ファイル名またはURL..."
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'sheet' && (
                                <CharacterSheetGenerator characters={data.characters} showNotification={showNotification} />
                            )}

                            {activeTab === 'panels' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-semibold">コマ割り詳細</h2>
                                        <button className="btn-primary py-2 px-3 text-sm" onClick={addPanel}>
                                            <Plus className="w-4 h-4" /> コマ追加
                                        </button>
                                    </div>
                                    {data.panels.length === 0 ? (
                                        <div className="text-center py-12 text-dim">
                                            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                            <p className="mb-3">コマがまだ登録されていません</p>
                                            <button className="btn-primary py-2 px-4" onClick={addPanel}>
                                                <Plus className="w-4 h-4" /> コマを追加
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {data.panels.map((panel) => (
                                                <div key={panel.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded text-sm font-bold">
                                                            Panel {panel.panel}
                                                        </span>
                                                        <button onClick={() => removePanel(panel.id)} className="text-rose-400 hover:text-rose-300 p-1">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <div className="mb-3">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <label className="block text-xs text-dim">描写</label>
                                                            <button
                                                                onClick={() => handleDirectorCut(panel.id, panel.description)}
                                                                disabled={enhancingPanelId === panel.id}
                                                                className={`text-xs flex items-center gap-1 py-1 px-2 rounded transition-all ${enhancingPanelId === panel.id
                                                                    ? 'bg-amber-500/20 text-amber-300 cursor-wait'
                                                                    : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                                                                    }`}
                                                                title="AI演出強化 (Director's Cut)"
                                                            >
                                                                {enhancingPanelId === panel.id ? (
                                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                                ) : (
                                                                    <Clapperboard className="w-3 h-3" />
                                                                )}
                                                                <span>{enhancingPanelId === panel.id ? '演出中...' : '演出強化'}</span>
                                                            </button>
                                                        </div>
                                                        <textarea
                                                            className="input-field min-h-[50px] resize-y text-sm"
                                                            value={panel.description}
                                                            onChange={(e) => updatePanel(panel.id, { description: e.target.value })}
                                                            placeholder="シーンの説明..."
                                                        />

                                                        {/* 演出リファレンス折りたたみパネル */}
                                                        <div className="mt-2">
                                                            <button
                                                                onClick={() => setExpandedDirectionPanelId(
                                                                    expandedDirectionPanelId === panel.id ? null : panel.id
                                                                )}
                                                                className="text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                                                            >
                                                                <ChevronDown className={`w-3 h-3 transition-transform ${expandedDirectionPanelId === panel.id ? 'rotate-180' : ''}`} />
                                                                演出リファレンス ({GENERIC_DIRECTIONS.length}件)
                                                            </button>

                                                            {expandedDirectionPanelId === panel.id && (
                                                                <div className="mt-2 p-2 bg-black/20 rounded-lg border border-cyan-500/20 animate-fade-in">
                                                                    <p className="text-xs text-dim mb-2">クリックで描写に追加</p>
                                                                    <div className="space-y-1 max-h-48 overflow-y-auto">
                                                                        {GENERIC_DIRECTIONS.map((direction, idx) => (
                                                                            <button
                                                                                key={idx}
                                                                                onClick={() => {
                                                                                    const separator = panel.description.trim() ? "\n" : "";
                                                                                    updatePanel(panel.id, { description: panel.description.trim() + separator + direction });
                                                                                    showNotification("演出を追加しました", "success");
                                                                                }}
                                                                                className="w-full text-left text-xs p-2 rounded bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 transition-all text-gray-300 hover:text-cyan-200"
                                                                            >
                                                                                {direction}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mb-3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <label className="text-xs text-dim flex items-center gap-1">
                                                                <MessageCircle className="w-3 h-3" /> セリフ ({panel.dialogues.length})
                                                            </label>
                                                            <button onClick={() => addDialogue(panel.id)} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                                                                <Plus className="w-3 h-3" /> 追加
                                                            </button>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {panel.dialogues.map((dialogue, dIdx) => (
                                                                <div key={dialogue.id} className="p-2 bg-black/20 rounded-lg border border-white/5">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <span className="text-xs text-dim bg-white/10 px-1.5 py-0.5 rounded">#{dIdx + 1}</span>
                                                                        {panel.dialogues.length > 1 && (
                                                                            <button onClick={() => removeDialogue(panel.id, dialogue.id)} className="ml-auto text-rose-400/60 hover:text-rose-400">
                                                                                <Trash2 className="w-3 h-3" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                                                        <select
                                                                            className="input-field text-sm py-1.5"
                                                                            value={dialogue.speaker}
                                                                            onChange={(e) => updateDialogue(panel.id, dialogue.id, { speaker: e.target.value })}
                                                                        >
                                                                            <option value="">話者</option>
                                                                            {characterList.map(([key, char]) => (
                                                                                <option key={key} value={char.name}>{char.name}</option>
                                                                            ))}
                                                                            <option value="ナレーション">ナレーション</option>
                                                                        </select>
                                                                        <select
                                                                            className="input-field text-sm py-1.5"
                                                                            value={dialogue.bubble_style}
                                                                            onChange={(e) => updateDialogue(panel.id, dialogue.id, { bubble_style: e.target.value })}
                                                                        >
                                                                            {BUBBLE_STYLES.map(s => (
                                                                                <option key={s.value} value={s.value}>{s.label}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                    <input
                                                                        className="input-field text-sm py-1.5"
                                                                        value={dialogue.text}
                                                                        onChange={(e) => updateDialogue(panel.id, dialogue.id, { text: e.target.value })}
                                                                        placeholder="セリフを入力..."
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs text-dim mb-1">効果</label>
                                                        <input
                                                            className="input-field text-sm"
                                                            value={panel.effects}
                                                            onChange={(e) => updatePanel(panel.id, { effects: e.target.value })}
                                                            placeholder="集中線、スピードライン..."
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </main>
                </div>

                {/* 右側: YAMLプレビューパネル */}
                <div className={`border-l border-white/10 bg-slate-900/50 flex flex-col transition-all duration-300 ${yamlPanelCollapsed ? 'lg:w-12' : 'lg:w-[40%]'}`}>
                    {/* トグルボタン（PC版のみ） */}
                    <button
                        onClick={() => setYamlPanelCollapsed(!yamlPanelCollapsed)}
                        className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 -translate-x-full z-10 bg-slate-700 hover:bg-slate-600 text-white p-1 rounded-l-lg border border-r-0 border-white/10"
                        style={{ marginRight: yamlPanelCollapsed ? '48px' : '40%' }}
                    >
                        {yamlPanelCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    {!yamlPanelCollapsed && (
                        <>
                            {/* ヘッダー */}
                            <div className="p-3 border-b border-white/10 flex items-center justify-between bg-slate-800/50">
                                <h3 className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> YAML プレビュー
                                </h3>
                                <div className="flex gap-1">
                                    <button onClick={() => copyToClipboard(yamlOutput)} className="p-1.5 hover:bg-white/10 rounded transition-colors" title="コピー">
                                        <Copy className="w-4 h-4 text-dim" />
                                    </button>
                                    <button onClick={downloadYaml} className="p-1.5 hover:bg-white/10 rounded transition-colors" title="保存">
                                        <Download className="w-4 h-4 text-dim" />
                                    </button>
                                </div>
                            </div>

                            {/* YAMLコンテンツ */}
                            <div className="flex-1 overflow-auto p-4">
                                <pre className="text-xs font-mono text-indigo-200 leading-relaxed whitespace-pre-wrap break-words">
                                    {yamlOutput}
                                </pre>
                            </div>
                        </>
                    )}

                    {yamlPanelCollapsed && (
                        <div className="hidden lg:flex flex-col items-center py-4 gap-2">
                            <FileText className="w-5 h-5 text-dim" />
                            <span className="text-xs text-dim writing-mode-vertical" style={{ writingMode: 'vertical-rl' }}>YAML</span>
                        </div>
                    )}
                </div>

                {/* モバイル版: 下部にYAMLプレビュー */}
                <div className="lg:hidden border-t border-white/10 bg-slate-900/80 max-h-[300px] overflow-auto">
                    <div className="p-3 border-b border-white/10 flex items-center justify-between sticky top-0 bg-slate-800/90 backdrop-blur-sm">
                        <h3 className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> YAML プレビュー
                        </h3>
                        <div className="flex gap-1">
                            <button onClick={() => copyToClipboard(yamlOutput)} className="p-1.5 hover:bg-white/10 rounded">
                                <Copy className="w-4 h-4 text-dim" />
                            </button>
                            <button onClick={downloadYaml} className="p-1.5 hover:bg-white/10 rounded">
                                <Download className="w-4 h-4 text-dim" />
                            </button>
                        </div>
                    </div>
                    <pre className="p-4 text-xs font-mono text-indigo-200 leading-relaxed">
                        {yamlOutput}
                    </pre>
                </div>
            </div >
        </div >
    );
};

export default App;
