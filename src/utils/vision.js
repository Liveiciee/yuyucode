// src/utils/vision.js
export function injectVisionImage(messages, imageBase64, imageMimeType = 'image/jpeg') {
  if (!imageBase64) return messages;

  return messages.map((msg, idx) => {
    if (idx !== messages.length - 1 || msg.role !== 'user') {
      return msg;
    }

    const text = typeof msg.content === 'string'
      ? msg.content
      : Array.isArray(msg.content)
        ? msg.content.filter(c => c.type === 'text').map(c => c.text).join(' ')
        : '';

    return {
      ...msg,
      content: [
        { type: 'text', text },
        { type: 'image_url', image_url: { url: `data:${imageMimeType};base64,${imageBase64}` } },
      ],
    };
  });
}
