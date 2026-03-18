import { useRef } from 'react';

export function useMediaHandlers({ setVisionImage, setInput, haptic, setDragOver }) {
  const fileInputRef = useRef(null);

  function handleImageAttach(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => { setVisionImage(ev.target.result.split(',')[1]); haptic('light'); };
    reader.readAsDataURL(f);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => { setVisionImage(ev.target.result.split(',')[1]); haptic('light'); };
      reader.readAsDataURL(f);
    } else {
      const reader = new FileReader();
      reader.onload = ev => { setInput(i => i + '\n```\n' + ev.target.result.slice(0, 3000) + '\n```'); };
      reader.readAsText(f);
    }
  }

  return { fileInputRef, handleImageAttach, handleDrop };
}
