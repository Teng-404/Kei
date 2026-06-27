# Kei

> บอท Discord ที่ตอบกลับด้วยรูปภาพ ข้อความ หรือลิงก์ที่กำหนดไว้ล่วงหน้า ผ่านคีย์เวิร์ดแบบ trigger
> A Discord bot that replies with predefined images, messages, or links via keyword triggers.

---

## คุณสมบัติ / Features

Kei ทำงานด้วยระบบ **trigger** — กำหนดคีย์เวิร์ดไว้ล่วงหน้า แล้วบอทจะส่งรูปภาพ/ข้อความ/ลิงก์ที่ผูกไว้กลับมาให้

Kei works on a **trigger** system — define a keyword ahead of time, and the bot replies with the asset, message, or link bound to it.

### การเรียกใช้ / How to trigger

มีสองวิธีในการเรียก trigger:

| รูปแบบ / Syntax | คำอธิบาย / Description |
|-----------------|------------------------|
| `@` | mention บอทเพื่อเรียกใช้งาน / mention the bot |
| `.[ข้อความ]` | พิมพ์จุดตามด้วยคีย์เวิร์ด / type a dot followed by the keyword |

**ตัวอย่าง / Example**

```
.peak
```

---

## `/triggers`

คำสั่ง `/triggers` เป็นแดชบอร์ดสำหรับเรียกดูคีย์เวิร์ดทั้งหมด — **โหลดเร็วขึ้น** และมี **UI / UX ที่ดีกว่าเดิม**

The `/triggers` command is a dashboard for browsing every keyword — it **loads faster** and has **better UI / UX**.

### การจัดเรียง / Sorting

สามารถจัดเรียงรายการได้ตาม / You can sort by:

-  **Date updated** — วันที่แก้ไขล่าสุด
-  **Date created** — วันที่สร้าง
-  **Top fired** — ถูกเรียกใช้บ่อยที่สุด
-  **Alphabetical** — ตามตัวอักษร

### การเรียกดู / Browsing

- แสดง **จำนวนหน้า** และ **จำนวน asset** ทั้งหมด / Shows the total **number of pages** and **number of assets**
- **กระโดดไปยังหน้าที่ต้องการ** ได้ทันที / **Jump to a specific page**
- **พรีวิว** asset, ข้อความ หรือลิงก์ของแต่ละคีย์เวิร์ด / **Previews** each keyword's asset, message, or link
- คีย์เวิร์ดที่มีหลายค่า จะพรีวิว **ทุกค่า** ที่ผูกไว้ / Keywords with multiple return values preview **all** of them

**ตัวอย่าง / Example:** `.peak` มีหลายค่า → `/triggers` จะพรีวิวให้ครบทุกอัน
> e.g. `.peak` has multiple values → `/triggers` previews every one of them.

---

## เริ่มต้นใช้งาน / Getting Started

```bash
# clone โปรเจกต์
git clone <your-repo-url>
cd kei

# ติดตั้ง dependencies
npm install

# ตั้งค่า token ในไฟล์ .env
# BOT_TOKEN=your_discord_bot_token

# รันบอท
npm start
```

---

## License

MIT
