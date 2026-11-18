# 🛡️ Freelance Escrow Platform (Web3 Freelance Marketplace)
> **CSI301 Quiz 2 Project** | รหัสนักศึกษา: **66078633**  
> แพลตฟอร์มจ้างงานและสัญญาอัจฉริยะ (Smart Contract Escrow) แบบกระจายศูนย์ ปลอดภัย โปร่งใส คุ้มครองทั้งผู้ว่าจ้างและฟรีแลนซ์

---

## 📌 ภาพรวมโครงการ (Project Overview)

**Freelance Escrow Platform** เป็นเว็บแอปพลิเคชันกระจายศูนย์ (DApp) สำหรับการจ้างงานฟรีแลนซ์ โดยใช้ **Smart Contract** บนเครือข่าย **Ethereum Sepolia Testnet** ในการดูแลและล็อกเงินค่าจ้าง (Escrow) ไว้ในสัญญาระหว่างการดำเนินงาน เงินจะถูกโอนให้ฟรีแลนซ์เมื่อผู้ว่าจ้างตรวจรับงานแล้วเท่านั้น พร้อมทั้งมีระบบบันทึกประวัติธุรกรรมลงฐานข้อมูล **SQLite (Node.js/Express API)** และระบบคัดกรองการเข้าใช้งานตามบทบาท (**Role-Based Access Control**) เสมือนระบบฟรีแลนซ์ระดับมืออาชีพจริง

---

## 🌟 ฟังก์ชันหลักทั้ง 8 ระบบ (Core Features)

ระบบครอบคลุมฟังก์ชันการทำงานตามข้อกำหนดอย่างสมบูรณ์:

| ลำดับ | ชื่อฟังก์ชัน | บทบาทที่ใช้งานได้ | รายละเอียดการทำงาน |
| :---: | :--- | :---: | :--- |
| **1** | **สร้างข้อตกลงการจ้างงาน (Create Job)** | ผู้ว่าจ้าง (Client) | กำหนดชื่องาน, รายละเอียดงาน, Wallet ฟรีแลนซ์ และกำหนดส่งงาน (Deadline) ขึ้น Smart Contract |
| **2** | **ฝากเงินค่าจ้างผ่าน Smart Contract (Deposit)** | ผู้ว่าจ้าง (Client) | ล็อกเงินค่าจ้าง (ETH) เข้าสัญญา Escrow อย่างปลอดภัย เงินจะไม่ถูกปล่อยจนกว่างานจะผ่านการอนุมัติ |
| **3** | **บันทึกการส่งมอบงาน (Submit Work)** | ฟรีแลนซ์ (Freelancer) | แนบลิงก์ผลงาน เช่น GitHub หรือ Cloud Drive พร้อมบันทึก Timestamp และเวอร์ชันของงาน |
| **4** | **ระบบขอแก้ไขและส่งงานใหม่ (Revision)** | ผู้ว่าจ้าง (Client) | ส่งคำขอแก้ไขงานพร้อมระบุรายละเอียด โดยฟรีแลนซ์สามารถส่งงานเวอร์ชันใหม่ทับได้ |
| **5** | **อนุมัติและจ่ายเงิน (Approve & Release Payment)** | ผู้ว่าจ้าง (Client) | ปลดล็อกและโอนเงิน ETH จาก Smart Contract เข้ากระเป๋าฟรีแลนซ์โดยตรงทันที |
| **6** | **จัดการข้อพิพาท (Dispute & Arbitration)** | ผู้ว่าจ้าง, ฟรีแลนซ์, แอดมิน | ฝ่ายใดฝ่ายหนึ่งสามารถแจ้งข้อพิพาทได้ และมีส่วนผู้ดูแลระบบ (Admin) ตัดสินชี้ขาด (จ่ายเงินหรือคืนเงิน) |
| **7** | **ระบบให้คะแนนและรีวิว (Rating & Review)** | ผู้ว่าจ้าง, ฟรีแลนซ์ | ให้คะแนน 1-5 ดาว พร้อมความคิดเห็น และคำนวณคะแนนเฉลี่ยสะสม (Reputation Score) |
| **8** | **ติดตามสถานะและประวัติธุรกรรม (Tracking & Ledger)** | ทุกบทบาท (Public) | ตรวจสอบสถานะงาน ประวัติส่งมอบ ประวัติการขอแก้ และดึง Ledger จาก Database / Blockchain |

---

## 🔐 ระบบล็อกอินและแบ่งแยกบทบาท (Role-Based Access Control)

เพื่อความปลอดภัยและความเป็นมืออาชีพ ระบบมีหน้าต่าง **Login / Role Selector** ให้เลือกและสลับโหมดการทำงานได้ตลอดเวลา:

1. **ผู้ว่าจ้าง (Client / Employer):**
   - เข้าถึงฟังก์ชัน: สร้างงาน, ฝากเงินค่าจ้าง, ขอแก้ไขงาน, อนุมัติปล่อยเงิน, แจ้งข้อพิพาท, รีวิวผลงาน และติดตามสถานะ
2. **ฟรีแลนซ์ (Freelancer):**
   - เข้าถึงฟังก์ชัน: ส่งมอบผลงาน, ตรวจสอบรายละเอียดงาน, แจ้งข้อพิพาท, ให้คะแนนรีวิว, ดูคะแนนความน่าเชื่อถือ
3. **ผู้ดูแลระบบ (Admin Arbitrator):**
   - เข้าถึงฟังก์ชัน: ตรวจสอบข้อพิพาท และออกคำตัดสินชี้ขาดข้อพิพาท (Release / Refund)
4. **ดูภาพรวมทั้งหมด (All Services):**
   - แสดงทุกการทำงานสำหรับการทดสอบและสาธิตระบบ

---

## 🏆 ตัวอย่างงานที่เสร็จสมบูรณ์ในระบบ (Sample Completed Job: Job #1)

ในระบบได้ติดตั้งและจำลองประวัติงานจริงที่สำเร็จครบทุกกระบวนการ (**Job ID #1**):
- **ชื่องาน:** พัฒนาเว็บแอปพลิเคชัน E-Commerce ด้วย Next.js
- **ค่าจ้าง:** 0.05 ETH (ล็อกและโอนผ่าน Escrow เรียบร้อยแล้ว)
- **สถานะ:** เสร็จสิ้น (Completed)
- **ประวัติการส่งงาน:** Version 1 (UI Initial Draft) และ Version 2 (Final Deliverable)
- **ประวัติการขอแก้ไข:** "ขอปรับแก้สีปุ่มสั่งซื้อและเพิ่มระบบกรองสินค้าตามหมวดหมู่"
- **รีวิวและคะแนน:** ⭐️⭐️⭐️⭐️⭐️ (5/5 ดาว) "ส่งงานตรงเวลา โค้ดมีคุณภาพสูง มีการสื่อสารที่ดี แนะนำเลยครับ!"
- **ประวัติธุรกรรมบนบล็อกเชน:** บันทึก 5 ธุรกรรมครบวงจร (Create Job -> Deposit -> Submit Work -> Approve Work -> Review) พร้อม TX Hash บน Sepolia

*(สามารถกดปุ่มสีเขียว **"ดูรายละเอียดงานนี้ (Job #1)"** ในส่วนที่ 8 ของหน้าเว็บเพื่อดูข้อมูลได้ทันที)*

---

## 🛠️ สถาปัตยกรรมและเทคโนโลยีที่ใช้ (Tech Stack)

### 1. Smart Contract & Web3
- **Network:** Ethereum Sepolia Testnet
- **Contract Address:** `0x51598d095a2380c0907f9e5d01e16c93466d5ece`
- **Library:** Ethers.js v6
- **Wallet Provider:** MetaMask (EIP-1193)

### 2. Backend API & Database
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Middleware:** CORS, Express JSON parser
- **Database:** SQLite3 (`better-sqlite3` / `freelance.db`)
- **Port:** `3000`

### 3. Frontend UI/UX
- **Languages:** HTML5, Modern CSS3, Vanilla JavaScript (ES6 Modules)
- **Theme:** Modern Web3 Dark/Light Neumorphic Cards, Responsive Flexbox & Grid
- **Design System:** Job Step Badges, Status Indicators, Quick Autofill Chips, Role Switcher Modal

---

## 💻 วิธีการติดตั้งและรันระบบ (Installation & Getting Started)

### ความต้องการของระบบ (Prerequisites)
1. **Node.js** (แนะนำเวอร์ชัน 18 ขึ้นไป)
2. เว็บบราวเซอร์ เช่น Google Chrome หรือ Brave
3. ส่วนขยายกระเป๋าเงิน **MetaMask** ติดตั้งบนบราวเซอร์ พร้อมเลือกเครือข่าย **Sepolia Testnet**

---

### ขั้นตอนที่ 1: ติดตั้งและรัน Backend API Server

เปิด Terminal ในโฟลเดอร์โครงการ:

```bash
cd backend
npm install
node server.js
```

> เซิร์ฟเวอร์ Backend จะเริ่มทำงานที่: `http://localhost:3000`  
> ตรวจสอบสถานะ API ได้ที่ `http://localhost:3000/` จะพบข้อความ `"Freelance Escrow Tha API is running"`

---

### ขั้นตอนที่ 2: รัน Frontend Web Application

เปิด Terminal อีกหน้าต่างหนึ่ง (หรือแท็บใหม่):

```bash
# เลือกวิธีใดวิธีหนึ่งที่สะดวก:

# วิธีที่ 1: ใช้ Python HTTP Server
python -m http.server 4173 --directory frontend

# หรือ วิธีที่ 2: ใช้ npx serve
npx serve frontend -p 4173

# หรือ วิธีที่ 3: ใช้ Live Server (VS Code Extension) เปิดไฟล์ frontend/index.html
```

เปิดเว็บบราวเซอร์แล้วไปที่:
👉 **`http://localhost:4173`** (หรือ URL ที่ Live Server กำหนด)

---

### ขั้นตอนที่ 3: เชื่อมต่อกระเป๋าและเริ่มใช้งาน

1. กดปุ่ม **"Connect Wallet"** ด้านมุมขวาบน เพื่อเชื่อมต่อ MetaMask เข้ากับบัญชี Sepolia ของคุณ
2. เลือกรหัสบทบาทการทำงานที่ต้องการ (ผู้ว่าจ้าง / ฟรีแลนซ์ / ผู้ดูแลระบบ) จากปุ่ม **"สลับบทบาทการใช้งาน"**
3. เริ่มต้นทดสอบฟังก์ชันตามลำดับขั้นตอน หรือกดปุ่มตัวอย่างงานในแต่ละการ์ดเพื่อกรอกข้อมูลอัตโนมัติ

---

## 📡 โครงสร้าง Backend REST API

| Method | Endpoint | คำอธิบาย | ตัวอย่าง Request Body |
| :---: | :--- | :--- | :--- |
| `GET` | `/` | Health Check สถานะ API Server | - |
| `GET` | `/api/transactions` | ดึงรายการธุรกรรมทั้งหมด เรียงจากล่าสุด | - |
| `GET` | `/api/transactions/:jobId` | ดึงรายการธุรกรรมเฉพาะตามรหัสงาน `jobId` | - |
| `POST` | `/api/transactions` | บันทึกธุรกรรมใหม่ลงฐานข้อมูล SQLite | `{"jobId": 1, "hash": "0x...", "action": "Deposit", "wallet": "0x..."}` |

---

## 📁 โครงสร้างโปรเจกต์ (Project Directory Structure)

```text
CSI301_quiz2_66078633/
├── backend/
│   ├── database.js               # การเชื่อมต่อและตาราง SQLite (better-sqlite3)
│   ├── freelance.db              # ไฟล์ฐานข้อมูล SQLite เก็บบันทึกธุรกรรม
│   ├── package.json              # กำหนดค่า dependencies (express, cors, better-sqlite3)
│   ├── package-lock.json
│   └── server.js                 # Express API Server รันบนพอร์ต 3000
├── frontend/
│   ├── app.js                    # ฟังก์ชัน Web3 เชื่อมต่อ Smart Contract & Backend API
│   ├── index.html                # หน้าเว็บหลัก โครงสร้าง UI และการ์ดฟังก์ชันทั้ง 8
│   └── style.css                 # สไตล์ชีทตกแต่งแบบโมเดิร์น แพลตฟอร์มฟรีแลนซ์ Web3
├── รายงานผลการทดสอบระบบ_Freelance_Escrow.docx # เอกสารรายงานผลการทดสอบระบบพร้อมภาพประกอบ
├── CSI301_Quiz2_66078633.pdf      # โจทย์และข้อกำหนดของโครงงาน
└── README.md                     # เอกสารคู่มืออธิบายระบบและการติดตั้งฉบับสมบูรณ์
```

---

## 📑 เอกสารรายงานผลการทดสอบ (Test Reports)

โครงการนี้ได้จัดทำเอกสารการทดสอบระบบและแคปเจอร์ผลการทดสอบของแต่ละฟังก์ชันไว้อย่างละเอียด:
- 📄 **[รายงานผลการทดสอบระบบ_Freelance_Escrow.docx](รายงานผลการทดสอบระบบ_Freelance_Escrow.docx)**: รายงานสรุปผลการทดสอบครบทั้ง 8 ฟังก์ชัน พร้อมตารางสรุปผล ค่าพารามิเตอร์ และรูปภาพประกอบหน้าจอแต่ละขั้นตอน

---

## 👨‍💻 ข้อมูลผู้พัฒนา (Author)
- **วิชา:** CSI301 (Quiz 2)
- **รหัสนักศึกษา:** 66078633
- **Smart Contract Address:** `0x51598d095a2380c0907f9e5d01e16c93466d5ece` (Sepolia Testnet)
