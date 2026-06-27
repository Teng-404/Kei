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
| `@Kei` | mention เปล่าๆ → ส่งรูปจากคีย์เวิร์ดเริ่มต้น / bare mention sends an image from the default keyword |
| `@Kei <คำ>` | mention พร้อมคำ → ส่งค่าของคีย์เวิร์ดนั้น / mention + word fires that keyword |
| `.[ข้อความ]` | พิมพ์จุดตามด้วยคีย์เวิร์ด / type a dot followed by the keyword |

**ตัวอย่าง / Example**

```ini
@Kei          → ส่งรูปเริ่มต้น (random)
@Kei peak     → ส่งค่าของ .peak
.peak         → ส่งค่าของ .peak
```

### สุ่มค่าตอบ / Random reply

คีย์เวิร์ดที่มีหลายค่า เวลาเรียกใช้บอทจะ **สุ่มส่งทีละค่า** ไม่ส่งทุกค่าพร้อมกัน (แต่ `/triggers` ยังพรีวิวให้ครบทุกค่า)

> When a keyword has multiple values, firing it sends **one random value** — `/triggers` still previews them all.

### อัปโหลดรูปแนบโดยตรง / Direct image upload

`/trigger add` แนบไฟล์รูปได้เลย บอทจะเก็บไฟล์ไว้ในเครื่อง (`data/assets/`) แล้วส่งกลับเป็น **ไฟล์แนบจริง** — ไม่หมดอายุเหมือนลิงก์ CDN ของ Discord

> Attach an image to `/trigger add`; Kei stores it locally and replies with the actual file, so it never expires like a Discord CDN link.

### คูลดาวน์กันสแปม / Anti-spam cooldown

จำกัดการเรียก trigger __ต่อผู้ใช้ต่อกิลด์__ (ค่าเริ่มต้น 3 วินาที, ตั้งค่าได้ด้วย `COOLDOWN_MS`) ถ้ายังติดคูลดาวน์บอทจะเงียบไว้

> Triggers are rate-limited __per user per guild__ (default 3s, set via `COOLDOWN_MS`); while on cooldown the bot stays silent.

---

## `/triggers`

คำสั่ง `/triggers` เป็นแดชบอร์ดสำหรับเรียกดูคีย์เวิร์ดทั้งหมด — **โหลดเร็วขึ้น** และมี **UI / UX ที่ดีกว่าเดิม**

The `/triggers` command is a dashboard for browsing every keyword — it **loads faster** and has **better UI / UX**.

### การจัดเรียง / Sorting

สามารถจัดเรียงรายการได้ตาม / You can sort by:

- **Date updated** — วันที่แก้ไขล่าสุด
- **Date created** — วันที่สร้าง
- **Top fired** — ถูกเรียกใช้บ่อยที่สุด
- **Alphabetical** — ตามตัวอักษร

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
| `/trigger add keyword [value] [file] [type]` | ผูกข้อความ/ลิงก์/URL หรือ **อัปโหลดรูปแนบ** เข้ากับคีย์เวิร์ด |
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

### สิ่งที่ต้องตั้งใน Developer Portal

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
| `DEFAULT_KEYWORD` | `kei` | คีย์เวิร์ดที่ยิงเมื่อ @mention เปล่าๆ |
| `COOLDOWN_MS` | `3000` | คูลดาวน์กันสแปมต่อผู้ใช้ (มิลลิวินาที, 0 = ปิด) |
| `MAX_UPLOAD_MB` | `25` | ขนาดไฟล์อัปโหลดสูงสุด (MB) |

ข้อมูล trigger ถูกเก็บเป็นไฟล์ JSON ที่ `data/triggers.json` และรูปที่อัปโหลดแนบจะถูกเก็บใน `data/assets/` (มีไฟล์ตัวอย่าง `data/triggers.example.json`)

### ทดสอบ / Test

```bash
npm test   # ทดสอบ logic หลัก (store, sorting, pagination, parser)
```

---

## โครงสร้างโปรเจกต์ / Project structure

```ini
kei/
├── src/
│   ├── index.js                 # จุดเริ่มต้น เชื่อมทุกส่วนเข้าด้วยกัน
│   ├── config.js                # อ่านค่าจาก .env
│   ├── store.js                 # คลังเก็บ trigger (ไฟล์ JSON)
│   ├── util/
│   │   ├── types.js             # ตรวจชนิดค่า image/link/text
│   │   ├── assets.js            # ดาวน์โหลด/เก็บ/ลบ รูปที่อัปโหลดแนบ
│   │   └── cooldown.js          # ตัวจับคูลดาวน์กันสแปม
│   ├── commands/
│   │   ├── triggers.js          # /triggers (แดชบอร์ด)
│   │   └── trigger.js           # /trigger add|remove|info
│   ├── handlers/
│   │   ├── messageHandler.js    # ทริกเกอร์ . และ @mention
│   │   └── interactionHandler.js# ปุ่ม/เมนู/modal ของแดชบอร์ด
│   └── ui/dashboard.js          # สร้าง embed + ปุ่ม pagination/sort
├── data/                        # ที่เก็บข้อมูล (triggers.json + assets/)
└── test/logic.test.js           # ชุดทดสอบ
```

---

## License

MIT
