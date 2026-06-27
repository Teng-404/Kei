'use strict';

// ตรวจชนิดของค่าที่ผูกกับคีย์เวิร์ด / detect the type of a bound value
const IMAGE_RE = /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i;
const URL_RE = /^https?:\/\/\S+$/i;

/**
 * @param {string} content
 * @returns {'image'|'link'|'text'}
 */
function detectType(content) {
  const c = String(content || '').trim();
  if (IMAGE_RE.test(c)) return 'image';
  if (URL_RE.test(c)) return 'link';
  return 'text';
}

// ไอคอนประจำชนิด / per-type icon used in previews
function typeIcon(type) {
  return type === 'image' ? '🖼️' : type === 'link' ? '🔗' : '💬';
}

module.exports = { detectType, typeIcon };
