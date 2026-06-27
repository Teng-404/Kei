'use strict';

const fs = require('fs');
const path = require('path');
const { detectType } = require('./util/types');
const { dataFile } = require('./config');

/**
 * คลังเก็บ trigger แบบไฟล์ JSON / Simple JSON-file backed trigger store.
 *
 * โครงสร้างของแต่ละ trigger / shape of each trigger:
 * {
 *   keyword: string,                                  // คีย์เวิร์ด (ตัวพิมพ์เล็ก)
 *   values: { type: 'image'|'link'|'text', content }[], // ค่าที่ผูกไว้ (มีได้หลายค่า)
 *   createdAt: number,                                // วันที่สร้าง (epoch ms)
 *   updatedAt: number,                                // วันที่แก้ไขล่าสุด
 *   fired: number,                                    // จำนวนครั้งที่ถูกเรียกใช้
 *   createdBy: string|null                            // ผู้สร้าง (user id)
 * }
 */
class TriggerStore {
  constructor(file = dataFile) {
    this.file = file;
    /** @type {Map<string, object>} */
    this.map = new Map();
    this._load();
  }

  _load() {
    try {
      const raw = fs.readFileSync(this.file, 'utf8');
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        for (const t of arr) this.map.set(t.keyword, t);
      }
    } catch (err) {
      if (err.code !== 'ENOENT') console.error('[store] failed to load:', err.message);
      // ไม่มีไฟล์ = เริ่มจากว่าง / no file yet -> start empty
    }
  }

  _save() {
    const dir = path.dirname(this.file);
    fs.mkdirSync(dir, { recursive: true });
    const tmp = `${this.file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify([...this.map.values()], null, 2));
    fs.renameSync(tmp, this.file); // เขียนแบบ atomic / atomic write
  }

  // ทำให้คีย์เวิร์ดเป็นรูปแบบมาตรฐาน / normalise a keyword
  static norm(keyword) {
    return String(keyword || '').trim().toLowerCase().replace(/^\.+/, '');
  }

  get(keyword) {
    return this.map.get(TriggerStore.norm(keyword)) || null;
  }

  all() {
    return [...this.map.values()];
  }

  count() {
    return this.map.size;
  }

  /**
   * เพิ่มค่าให้คีย์เวิร์ด (สร้างใหม่ถ้ายังไม่มี) / add a value to a keyword.
   * คืน trigger ที่อัปเดตแล้ว
   */
  add(keyword, content, { type, userId } = {}) {
    const key = TriggerStore.norm(keyword);
    if (!key) throw new Error('keyword ว่างไม่ได้ / keyword cannot be empty');
    if (!content || !String(content).trim()) {
      throw new Error('value ว่างไม่ได้ / value cannot be empty');
    }

    const value = { type: type || detectType(content), content: String(content).trim() };
    const now = Date.now();
    let trigger = this.map.get(key);

    if (!trigger) {
      trigger = { keyword: key, values: [value], createdAt: now, updatedAt: now, fired: 0, createdBy: userId || null };
      this.map.set(key, trigger);
    } else {
      trigger.values.push(value);
      trigger.updatedAt = now;
    }
    this._save();
    return trigger;
  }

  // ลบทั้งคีย์เวิร์ด / remove an entire keyword
  remove(keyword) {
    const key = TriggerStore.norm(keyword);
    const existed = this.map.delete(key);
    if (existed) this._save();
    return existed;
  }

  // ลบเฉพาะค่าที่ระบุ (index เริ่มที่ 1) / remove one value by 1-based index
  removeValue(keyword, index1) {
    const t = this.get(keyword);
    if (!t) return false;
    const i = index1 - 1;
    if (i < 0 || i >= t.values.length) return false;
    t.values.splice(i, 1);
    if (t.values.length === 0) {
      this.map.delete(t.keyword);
    } else {
      t.updatedAt = Date.now();
    }
    this._save();
    return true;
  }

  // นับครั้งที่ถูกเรียกใช้ / record a fire
  recordFire(keyword) {
    const t = this.get(keyword);
    if (!t) return;
    t.fired = (t.fired || 0) + 1;
    this._save();
  }
}

module.exports = { TriggerStore };
