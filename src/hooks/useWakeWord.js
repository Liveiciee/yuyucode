import { useEffect, useRef } from "react";

// ── useWakeWord — continuous background "Hey Yuyu" detection ─────────────────
export function useWakeWord({ onActivated, enabled = false }) {
  const recRef    = useRef(null);
  const activeRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      if (recRef.current) {
        try { recRef.current.stop(); } catch(_e){}
        recRef.current = null;
      }
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const WAKE_PATTERNS = ['hey yuyu', 'hei yuyu', 'yuyu', 'oi yuyu'];

    function startListening() {
      if (activeRef.current) return;
      const rec = new SR();
      rec.lang = 'id-ID';
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 3;

      rec.onresult = (e) => {
        const transcripts = Array.from(e.results)
          .flatMap(r => Array.from(r))
          .map(alt => alt.transcript.toLowerCase().trim());
        const triggered = transcripts.some(t =>
          WAKE_PATTERNS.some(p => t.includes(p))
        );
        if (triggered) {
          activeRef.current = false;
          onActivated?.();
        }
      };

      rec.onend = () => {
        activeRef.current = false;
        recRef.current = null;
        setTimeout(startListening, 800);
      };

      rec.onerror = (e) => {
        activeRef.current = false;
        recRef.current = null;
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          setTimeout(startListening, 2000);
        } else {
          setTimeout(startListening, 500);
        }
      };

      try {
        activeRef.current = true;
        recRef.current = rec;
        rec.start();
      } catch(_e) {
        activeRef.current = false;
      }
    }

    startListening();

    return () => {
      if (recRef.current) {
        try { recRef.current.stop(); } catch(_e){}
        recRef.current = null;
      }
      activeRef.current = false;
    };
  }, [enabled, onActivated]);
}
