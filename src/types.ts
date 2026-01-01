export type ReadingOrder = 'right_to_left_japanese' | 'left_to_right';
export type Style = 'classic_japanese_manga_black_and_white' | 'full_color';
export type Resolution = 'high_detail' | '4K';

export interface ComicFormat {
    aspect_ratio: string;
    orientation: 'vertical' | 'horizontal';
    reading_order: ReadingOrder;
    style: Style;
    resolution: Resolution;
    panel_count: number;
}

export interface Character {
    id: string;
    name: string;
    appearance: string;
    reference?: string;
}

// 個別のセリフ（話者と吹き出しスタイル付き）
export interface Dialogue {
    id: string;
    speaker: string;
    text: string;
    bubble_style: string;
}

export interface Panel {
    id: string;
    panel: number;
    description: string;
    dialogues: Dialogue[];  // 複数のセリフを保持
    effects: string;
}

export interface ComicData {
    title: string;
    format: ComicFormat;
    characters: Record<string, Character>;
    panels: Panel[];
    style_guidelines: string[];
}
