import React, { useState } from 'react';
import { Copy, Image as ImageIcon, Smile } from 'lucide-react';
import { Character } from '../types';

interface Props {
    characters: Record<string, Character>;
    showNotification: (message: string, type?: 'info' | 'success' | 'error') => void;
}

const CharacterSheetGenerator: React.FC<Props> = ({ characters, showNotification }) => {
    const [selectedCharKey, setSelectedCharKey] = useState<string>(Object.keys(characters)[0] || '');
    const selectedChar = characters[selectedCharKey];

    const generateThreeViewPrompt = () => {
        if (!selectedChar) return '';
        return `Character sheet of ${selectedChar.name}, ${selectedChar.appearance}, three-view: front view, side view, back view, standing, simple background, masterpiece, high quality, manga style, clean lines.`;
    };

    const generateExpressionsPrompt = () => {
        if (!selectedChar) return '';
        return `Expression sheet of ${selectedChar.name}, ${selectedChar.appearance}, multiple headshots, facial expressions: happy, sad, angry, surprised, neutral, laughing, masterpiece, high quality, manga style, clean lines.`;
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showNotification("プロンプトをコピーしました", "success");
        } catch {
            showNotification("コピーに失敗しました", "error");
        }
    };

    if (Object.keys(characters).length === 0) {
        return (
            <div className="text-center py-16 text-dim">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>キャラクターが設定されていません。</p>
                <p className="text-sm mt-2">「キャラクター」タブで追加してください。</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold">キャラシート作成サポート</h2>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-dim whitespace-nowrap">キャラクターを選択:</label>
                    <select
                        className="input-field py-2 max-w-[200px]"
                        value={selectedCharKey}
                        onChange={(e) => setSelectedCharKey(e.target.value)}
                    >
                        {Object.entries(characters).map(([key, char]) => (
                            <option key={key} value={key}>{char.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 三面図セクション */}
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                            <ImageIcon className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-medium">三面図プロンプト (Three-View)</h3>
                    </div>
                    <p className="text-sm text-dim">
                        正面・側面・背面の三面図を作成するためのベースプロンプトです。これを画像生成AIに入力して三面図を生成してください。
                    </p>
                    <div className="relative group">
                        <pre className="bg-black/40 p-4 rounded-xl text-sm font-mono text-indigo-200 whitespace-pre-wrap break-words min-h-[100px] border border-white/5">
                            {generateThreeViewPrompt()}
                        </pre>
                        <button
                            onClick={() => copyToClipboard(generateThreeViewPrompt())}
                            className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                            title="コピー"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* 表情差分セクション */}
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-rose-500/20 rounded-lg">
                            <Smile className="w-5 h-5 text-rose-400" />
                        </div>
                        <h3 className="text-lg font-medium">表情差分プロンプト (Expressions)</h3>
                    </div>
                    <p className="text-sm text-dim">
                        キャラクターの喜怒哀楽などの表情を一覧で生成するためのプロンプトです。一貫性を保つのに役立ちます。
                    </p>
                    <div className="relative group">
                        <pre className="bg-black/40 p-4 rounded-xl text-sm font-mono text-rose-200 whitespace-pre-wrap break-words min-h-[100px] border border-white/5">
                            {generateExpressionsPrompt()}
                        </pre>
                        <button
                            onClick={() => copyToClipboard(generateExpressionsPrompt())}
                            className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                            title="コピー"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 glass border-indigo-500/20 bg-indigo-500/5">
                <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-2">ヒント</h4>
                <ul className="text-sm text-dim list-disc list-inside space-y-1">
                    <li>生成した画像は Nano Banana Pro の <code className="bg-black/30 px-1 rounded">reference</code> に指定することで、コマごとのキャラクター再現性が向上します。</li>
                    <li>プロンプトに作品特有のキーワード（制服のデザインなど）を追加すると、より詳細なシートが作成できます。</li>
                    <li>Stable Diffusion 等を使用する場合、<code className="bg-black/30 px-1 rounded">ControlNet</code> と併用するとさらに効果的です。</li>
                </ul>
            </div>
        </div>
    );
};

export default CharacterSheetGenerator;
