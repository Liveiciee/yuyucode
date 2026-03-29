// src/utils/icon.js
export function getFileIcon(name) {
  const ext = name.split('.').pop()?.toLowerCase();
  const icons = {
    jsx:'jsx', tsx:'tsx', js:'js', ts:'ts', json:'{}',
    md:'md', yml:'yml', yaml:'yml', css:'css', html:'html', sh:'sh',
    txt:'txt', png:'img', jpg:'img', svg:'svg', py:'py', rb:'rb',
    go:'go', rs:'rs', java:'java', kt:'kt', swift:'sw',
  };
  return icons[ext] || ext || '?';
}
