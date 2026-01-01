import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmLabel = '削除',
    cancelLabel = 'キャンセル',
    onConfirm,
    onCancel,
    type = 'danger'
}) => {
    if (!isOpen) return null;

    const iconColors = {
        danger: 'text-rose-400 bg-rose-500/20',
        warning: 'text-amber-400 bg-amber-500/20',
        info: 'text-blue-400 bg-blue-500/20',
    };

    const confirmButtonColors = {
        danger: 'bg-rose-500 hover:bg-rose-600',
        warning: 'bg-amber-500 hover:bg-amber-600',
        info: 'bg-blue-500 hover:bg-blue-600',
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${iconColors[type]}`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                        <p className="text-dim text-sm">{message}</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-white/50 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex gap-3 mt-6 justify-end">
                    <button
                        onClick={onCancel}
                        className="btn-ghost"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-6 py-2 rounded-xl text-white font-semibold transition-all ${confirmButtonColors[type]}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
