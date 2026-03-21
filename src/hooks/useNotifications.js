import { useRef } from 'react';

export function useNotifications() {
  const ttsRef = useRef(null);

  function sendNotification(title, body) {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(p => {
        if (p === 'granted') new Notification(title, { body });
      });
    }
  }

  function haptic(type = 'light') {
    if (navigator.vibrate)
      navigator.vibrate(type === 'heavy' ? [50, 30, 50] : type === 'medium' ? 30 : 10);
  }

  function speakText(text) {
    if (typeof window.speechSynthesis === 'undefined' || typeof window.SpeechSynthesisUtterance !== 'function') return;
    window.speechSynthesis.cancel();
    const clean = text
      .replace(/```.*?```/gs, '')
      .replace(/[#*_~>]/g, '')
      .replace(/`/g, '')
      .replace(/\[([^\]]+)\]\([^()]+\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 500);
    const utt = new window.SpeechSynthesisUtterance(clean);
    utt.lang = 'id-ID'; utt.rate = 1.05; utt.pitch = 1.1;
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find(v => v.lang.startsWith('id') && v.name.toLowerCase().includes('female')) ||
      voices.find(v => v.lang.startsWith('id')) ||
      voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'));
    if (preferred) utt.voice = preferred;
    ttsRef.current = utt;
    window.speechSynthesis.speak(utt);
  }

  function stopTts() { window.speechSynthesis?.cancel(); }

  return { sendNotification, haptic, speakText, stopTts };
}
