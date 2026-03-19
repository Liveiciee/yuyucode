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

  // ── Camera capture (Capacitor native) ────────────────────────────────────────
  async function handleCameraCapture() {
    try {
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      const photo = await Camera.getPhoto({
        quality:      85,
        resultType:   CameraResultType.Base64,
        source:       CameraSource.Camera,
        correctOrientation: true,
      });
      if (photo.base64String) {
        setVisionImage(photo.base64String);
        haptic('light');
      }
    } catch (e) {
      // User cancelled or permission denied — silent fail
      if (!e.message?.includes('cancelled') && !e.message?.includes('cancel')) {
        console.warn('Camera error:', e.message);
      }
    }
  }

  // ── Gallery pick ──────────────────────────────────────────────────────────────
  async function handleGalleryPick() {
    try {
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      const photo = await Camera.getPhoto({
        quality:    85,
        resultType: CameraResultType.Base64,
        source:     CameraSource.Photos,
      });
      if (photo.base64String) {
        setVisionImage(photo.base64String);
        haptic('light');
      }
    } catch (_e) { /* cancelled */ }
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

  return { fileInputRef, handleImageAttach, handleDrop, handleCameraCapture, handleGalleryPick };
}
