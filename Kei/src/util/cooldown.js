'use strict';

/**
 * ตัวจับคูลดาวน์อย่างง่าย / lightweight cooldown tracker.
 * เก็บเวลา "พร้อมใช้อีกครั้ง" ต่อ key ใน Map
 */
class Cooldowns {
  constructor(ms = 0) {
    this.ms = ms;
    /** @type {Map<string, number>} */
    this.map = new Map();
  }

  /**
   * เรียกใช้ key หนึ่ง / register a hit for a key.
   * @returns {number} มิลลิวินาทีที่เหลือถ้ายังติดคูลดาวน์, 0 ถ้าผ่าน (และบันทึกแล้ว)
   */
  hit(key) {
    if (this.ms <= 0) return 0;
    const now = Date.now();
    const until = this.map.get(key) || 0;
    if (now < until) return until - now; // ยังติดคูลดาวน์
    this.map.set(key, now + this.ms);
    if (this.map.size > 5000) this._prune(now); // กัน Map โตไม่จำกัด
    return 0;
  }

  _prune(now) {
    for (const [k, until] of this.map) {
      if (until <= now) this.map.delete(k);
    }
  }
}

module.exports = { Cooldowns };
