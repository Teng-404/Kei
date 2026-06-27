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
| `@` | mention เพื่อทริคเกอร์คำสั่ง / mention the bot |
| `.[ข้อความ]` | พิมพ์จุดตามด้วยคีย์เวิร์ด / type a dot followed by the keyword |

**ตัวอย่าง / Example**

```
@Kei
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

## การจัดการ trigger / Managing triggers

ใช้ slash command `/trigger` (ต้องมีสิทธิ์ **Manage Server**):

| คำสั่ง / Command | คำอธิบาย / Description |
|------------------|------------------------|
| `/trigger add keyword value [type]` | ผูกรูป/ข้อความ/ลิงก์เข้ากับคีย์เวิร์ด (ชนิดตรวจอัตโนมัติ) |
| `/trigger remove keyword [index]` | ลบทั้งคีย์เวิร์ด หรือเฉพาะค่าลำดับที่ระบุ |
| `/trigger info keyword` | ดูรายละเอียด: ทุกค่า, จำนวนครั้งที่ถูกเรียก, วันที่ |

> คีย์เวิร์ดเดียวเพิ่มได้หลายค่า — `add` ซ้ำคีย์เดิมจะ "เพิ่ม" ค่าใหม่เข้าไป
> Add `value` multiple times to the same keyword to bind several assets.

---

## เริ่มต้นใช้งาน / Getting Started

```bash
# clone โปรเจกต์
git clone <your-repo-url>
cd kei

# ติดตั้ง dependencies
npm install

# ตั้งค่า token ในไฟล์ .env
cp .env.example .env
# แล้วแก้ค่า BOT_TOKEN=your_discord_bot_token

# รันบอท
npm start
```

### ⚠️ สิ่งที่ต้องตั้งใน Developer Portal

ระบบ `.keyword` ต้องอ่านเนื้อหาข้อความ จึงต้องเปิด **Message Content Intent** (privileged):

> Discord Developer Portal → เลือกแอป → **Bot** → เปิด **Message Content Intent**

และเชิญบอทด้วยสโคป `bot` + `applications.commands`

### ค่าตั้งเสริม / Optional env

| ตัวแปร | ค่าเริ่มต้น | คำอธิบาย |
|--------|-----------|----------|
| `BOT_TOKEN` | — | โทเคนบอท (จำเป็น) |
| `GUILD_ID` | — | ลงทะเบียนคำสั่งเฉพาะกิลด์ → ขึ้นทันที (ระหว่างพัฒนา) |
| `PREFIX` | `.` | ตัวนำหน้าคีย์เวิร์ด |
| `PER_PAGE` | `8` | จำนวน trigger ต่อหน้าใน `/triggers` |

ข้อมูล trigger ถูกเก็บเป็นไฟล์ JSON ที่ `data/triggers.json` (มีไฟล์ตัวอย่าง `data/triggers.example.json`)

### ทดสอบ / Test

```bash
npm test   # ทดสอบ logic หลัก (store, sorting, pagination, parser)
```

---

## โครงสร้างโปรเจกต์ / Project structure

```
kei/
├── src/
│   ├── index.js                 # จุดเริ่มต้น เชื่อมทุกส่วนเข้าด้วยกัน
│   ├── config.js                # อ่านค่าจาก .env
│   ├── store.js                 # คลังเก็บ trigger (ไฟล์ JSON)
│   ├── util/types.js            # ตรวจชนิดค่า image/link/text
│   ├── commands/
│   │   ├── triggers.js          # /triggers (แดชบอร์ด)
│   │   └── trigger.js           # /trigger add|remove|info
│   ├── handlers/
│   │   ├── messageHandler.js    # ทริกเกอร์ . และ @mention
│   │   └── interactionHandler.js# ปุ่ม/เมนู/modal ของแดชบอร์ด
│   └── ui/dashboard.js          # สร้าง embed + ปุ่ม pagination/sort
├── data/                        # ที่เก็บข้อมูล
└── test/logic.test.js           # ชุดทดสอบ
```

---

## License

MIT
