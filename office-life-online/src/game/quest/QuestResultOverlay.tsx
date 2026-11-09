import { useEffect } from "react";

interface QuestResultOverlayProps {
    message: string | null;
    onClose: () => void;
}

export function QuestResultOverlay({ message, onClose }: QuestResultOverlayProps) {
    useEffect(() => {
        if (!message) return;

        const timeout = window.setTimeout(onClose, 2500);
        return () => window.clearTimeout(timeout);
    }, [message, onClose]);

    if (!message) return null;

    return (
        <div className="quest-result-overlay">
            <div className="quest-result-content">
                <p>{message}</p>
                <button onClick={onClose}>Đóng</button>
            </div>
        </div>
    );
}