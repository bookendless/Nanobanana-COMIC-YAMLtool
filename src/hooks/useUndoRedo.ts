import { useState, useCallback, useRef } from 'react';

interface UndoRedoState<T> {
    past: T[];
    present: T;
    future: T[];
}

interface UseUndoRedoReturn<T> {
    state: T;
    setState: (newState: T | ((prev: T) => T)) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    reset: (initialState: T) => void;
}

const HISTORY_LIMIT = 50;

/**
 * Undo/Redo機能を提供するカスタムフック
 * @param initialState 初期状態
 * @returns state, setState, undo, redo, canUndo, canRedo, reset
 */
export function useUndoRedo<T>(initialState: T): UseUndoRedoReturn<T> {
    const [history, setHistory] = useState<UndoRedoState<T>>({
        past: [],
        present: initialState,
        future: [],
    });

    // 前回のpresentを保持して、setStateが連続で呼ばれたときに正しいpastを構築する
    const lastPresentRef = useRef<T>(initialState);

    const setState = useCallback((newState: T | ((prev: T) => T)) => {
        setHistory((currentHistory) => {
            const resolvedNewState =
                typeof newState === 'function'
                    ? (newState as (prev: T) => T)(currentHistory.present)
                    : newState;

            // 値が変わらない場合は履歴に追加しない
            if (JSON.stringify(resolvedNewState) === JSON.stringify(currentHistory.present)) {
                return currentHistory;
            }

            const newPast = [...currentHistory.past, currentHistory.present].slice(-HISTORY_LIMIT);
            lastPresentRef.current = resolvedNewState;

            return {
                past: newPast,
                present: resolvedNewState,
                future: [], // 新しい変更があるとfutureはクリア
            };
        });
    }, []);

    const undo = useCallback(() => {
        setHistory((currentHistory) => {
            if (currentHistory.past.length === 0) {
                return currentHistory;
            }

            const newPast = currentHistory.past.slice(0, -1);
            const newPresent = currentHistory.past[currentHistory.past.length - 1];
            const newFuture = [currentHistory.present, ...currentHistory.future];
            lastPresentRef.current = newPresent;

            return {
                past: newPast,
                present: newPresent,
                future: newFuture,
            };
        });
    }, []);

    const redo = useCallback(() => {
        setHistory((currentHistory) => {
            if (currentHistory.future.length === 0) {
                return currentHistory;
            }

            const newFuture = currentHistory.future.slice(1);
            const newPresent = currentHistory.future[0];
            const newPast = [...currentHistory.past, currentHistory.present];
            lastPresentRef.current = newPresent;

            return {
                past: newPast,
                present: newPresent,
                future: newFuture,
            };
        });
    }, []);

    const reset = useCallback((initialState: T) => {
        lastPresentRef.current = initialState;
        setHistory({
            past: [],
            present: initialState,
            future: [],
        });
    }, []);

    return {
        state: history.present,
        setState,
        undo,
        redo,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
        reset,
    };
}
