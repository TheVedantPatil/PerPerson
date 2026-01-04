import { useEffect, useRef } from "react";

/**
 * Reusable polling hook
 * @param {Function} callback - function to call on interval
 * @param {number} delay - polling interval in ms
 * @param {boolean} enabled - start/stop polling
 */

function usePolling(callback, delay = 3000, enabled = true) {
    const savedCallback = useRef();

    // Always keep latest callback
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!enabled) return;

        const tick = () => {
            savedCallback.current?.();
        };

        const id = setInterval(tick, delay);

        return () => clearInterval(id);
    }, [delay, enabled]);
};

export default usePolling;