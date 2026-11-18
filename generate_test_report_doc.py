import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_report():
    doc = Document()

    # Page Margins
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Base styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Cordia New'
    normal_style.font.size = Pt(14)
    normal_style.font.color.rgb = RGBColor(51, 65, 85)

    # Title Section
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title_p.add_run("รายงานผลการทดสอบระบบ (Software Test Report)\nแพลตฟอร์มจ้างงานฟรีแลนซ์ Freelance Escrow Web3")
    title_run.bold = True
    title_run.font.size = Pt(20)
    title_run.font.color.rgb = RGBColor(30, 27, 75)

    sub_p = doc.add_paragraph()
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_run = sub_p.add_run("ระบบจ้างงานและสัญญาอัจฉริยะ (Smart Contract Escrow) บนเครือข่าย Ethereum Sepolia Testnet\nวิชา CSI301 • ภาคการศึกษา 2026")
    sub_run.font.size = Pt(13)
    sub_run.font.color.rgb = RGBColor(100, 116, 139)

    doc.add_paragraph()

    # Meta Info Box
    meta_table = doc.add_table(rows=4, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False

    meta_data = [
        ("Smart Contract Address:", "0x51598d095a2380c0907f9e5d01e16c93466d5ece (Sepolia)"),
        ("Blockchain Network:", "Ethereum Sepolia Testnet (Chain ID: 11155111)"),
        ("Backend & Database:", "Node.js (Express), SQLite3 (better-sqlite3)"),
        ("สถานะการทดสอบรวม:", "✅ ผ่านการทดสอบทั้งหมด (8/8 ฟังก์ชัน - 100% PASSED)")
    ]

    for idx, (k, v) in enumerate(meta_data):
        row = meta_table.rows[idx]
        cell_k, cell_v = row.cells[0], row.cells[1]
        cell_k.width = Inches(2.2)
        cell_v.width = Inches(4.6)
        
        pk = cell_k.paragraphs[0]
        rk = pk.add_run(k)
        rk.bold = True
        rk.font.size = Pt(12)
        rk.font.color.rgb = RGBColor(15, 23, 42)

        pv = cell_v.paragraphs[0]
        rv = pv.add_run(v)
        rv.font.size = Pt(12)
        if "ผ่านการทดสอบ" in v:
            rv.bold = True
            rv.font.color.rgb = RGBColor(16, 185, 129)
        else:
            rv.font.color.rgb = RGBColor(71, 85, 105)

        set_cell_background(cell_k, 'F8FAFC')
        set_cell_background(cell_v, 'F8FAFC')
        set_cell_margins(cell_k, 60, 60, 100, 100)
        set_cell_margins(cell_v, 60, 60, 100, 100)

    doc.add_paragraph()

    # Summary Table Section
    h1 = doc.add_paragraph()
    r = h1.add_run("1. ตารางสรุปภาพรวมผลการทดสอบ (Executive Test Summary)")
    r.bold = True
    r.font.size = Pt(16)
    r.font.color.rgb = RGBColor(79, 70, 229)

    summary_table = doc.add_table(rows=9, cols=5)
    summary_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    summary_table.autofit = False

    headers = ["ลำดับ", "ฟังก์ชันที่ทดสอบ", "บทบาท (Role)", "ผลที่คาดหวัง", "สถานะ"]
    col_widths = [Inches(0.6), Inches(2.2), Inches(1.2), Inches(2.1), Inches(0.7)]

    # Header Row
    for idx, h_text in enumerate(headers):
        cell = summary_table.rows[0].cells[idx]
        cell.width = col_widths[idx]
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(h_text)
        run.bold = True
        run.font.size = Pt(12)
        run.font.color.rgb = RGBColor(255, 255, 255)
        set_cell_background(cell, '1E1B4B')
        set_cell_margins(cell, 80, 80, 60, 60)

    summary_rows = [
        ("1", "สร้างข้อตกลงการจ้างงาน", "ผู้ว่าจ้าง (Client)", "สร้างสัญญาบน Chain และบันทึก ID สำเร็จ", "PASS"),
        ("2", "ฝากเงินค่าจ้างผ่าน Smart Contract", "ผู้ว่าจ้าง (Client)", "โอน ETH เข้า Escrow Vault สำเร็จ", "PASS"),
        ("3", "บันทึกการส่งมอบงาน", "ฟรีแลนซ์ (Freelancer)", "บันทึกลิงก์/Hash งานลง Smart Contract", "PASS"),
        ("4", "อนุมัติและจ่ายเงิน", "ผู้ว่าจ้าง (Client)", "ปลดล็อกและโอนเงินให้ฟรีแลนซ์อัตโนมัติ", "PASS"),
        ("5", "จัดการข้อพิพาท", "คู่สัญญา & แอดมิน", "แจ้งข้อพิพาท และแอดมินตัดสินชี้ขาดได้", "PASS"),
        ("6", "ติดตามสถานะและธุรกรรม", "ทุกบทบาท (Public)", "ดึงข้อมูลงาน ประวัติ และธุรกรรมบน Etherscan", "PASS"),
        ("7", "ระบบให้คะแนนและรีวิว", "คู่สัญญา & ทั่วไป", "บันทึกคะแนนรีวิว และคำนวณคะแนนเฉลี่ยถูกต้อง", "PASS"),
        ("8", "ระบบขอแก้ไขและส่งงานใหม่", "ผู้ว่าจ้าง & ฟรีแลนซ์", "บันทึกประวัติขอแก้ไข และส่งงานเวอร์ชันใหม่ได้", "PASS"),
    ]

    for row_idx, data in enumerate(summary_rows, start=1):
        row = summary_table.rows[row_idx]
        for col_idx, text in enumerate(data):
            cell = row.cells[col_idx]
            cell.width = col_widths[col_idx]
            p = cell.paragraphs[0]
            if col_idx in [0, 4]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            run = p.add_run(text)
            run.font.size = Pt(11)
            if col_idx == 4:
                run.bold = True
                run.font.color.rgb = RGBColor(16, 185, 129)
            elif col_idx == 0:
                run.bold = True
            
            bg = 'F8FAFC' if row_idx % 2 == 1 else 'FFFFFF'
            set_cell_background(cell, bg)
            set_cell_margins(cell, 60, 60, 60, 60)

    doc.add_page_break()

    # Detailed Test Cases
    h2 = doc.add_paragraph()
    r = h2.add_run("2. รายละเอียดและหลักฐานผลการทดสอบแต่ละฟังก์ชัน (Detailed Test Cases)")
    r.bold = True
    r.font.size = Pt(16)
    r.font.color.rgb = RGBColor(79, 70, 229)

    test_cases = [
        {
            "num": "ฟังก์ชันที่ 1",
            "title": "สร้างข้อตกลงการจ้างงาน (Create Job Agreement)",
            "role": "ผู้ว่าจ้าง (Client / Employer)",
            "objective": "ทดสอบการระบุชื่อโครงการ ขอบเขตงาน กำหนดส่งงาน (Deadline) และระบุ Address กระเป๋าเงินของฟรีแลนซ์ที่รับงาน",
            "inputs": [
                "ชื่อโครงการ: พัฒนาเว็บแอปพลิเคชัน E-Commerce ด้วย Next.js",
                "รายละเอียดงาน: ออกแบบ UI/UX หน้าร้าน และเชื่อมต่อระบบชำระเงิน พร้อมส่งมอบซอร์สโค้ดภายใน 14 วัน",
                "Wallet ฟรีแลนซ์: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (Sepolia Address)",
                "กำหนดส่งงาน (Deadline): 01/12/2026 18:00"
            ],
            "expected": "ฟอร์มตรวจสอบความถูกต้องของ Wallet Address สร้างสัญญางานใหม่บน Smart Contract และบันทึก Transaction ลงฐานข้อมูล",
            "actual": "ระบบสร้างสัญญาสำเร็จ ได้รับ Job ID จากฟังก์ชัน nextJobIdTha() และแสดงป้ายสถานะ 'สร้างงานแล้ว' ได้อย่างถูกต้อง",
            "image": "C:/Users/pairr/CSI301_quiz2_66078633/test_screenshots/01_create_job.png",
            "status": "PASS"
        },
        {
            "num": "ฟังก์ชันที่ 2",
            "title": "ฝากเงินค่าจ้างผ่าน Smart Contract (Deposit Escrow Funds)",
            "role": "ผู้ว่าจ้าง (Client / Employer)",
            "objective": "ทดสอบการฝากเงินค่าจ้าง ETH เข้าสู่ Escrow Vault ของ Smart Contract เพื่อเป็นหลักประกันความปลอดภัยให้แก่ฟรีแลนซ์",
            "inputs": [
                "รหัสงาน (Job ID): 1",
                "จำนวนเงินค่าจ้าง: 0.05 ETH"
            ],
            "expected": "เงินค่าจ้าง 0.05 ETH ถูกล็อกไว้ใน Smart Contract อย่างปลอดภัย สัญญางานเปลี่ยนสถานะเป็น 'ฝากเงินแล้ว'",
            "actual": "ระบบเรียกฟังก์ชัน depositPaymentTha(1) สำเร็จ โอนเงินเข้า Escrow และบันทึกประวัติธุรกรรมบน Database",
            "image": "C:/Users/pairr/CSI301_quiz2_66078633/test_screenshots/02_deposit_payment.png",
            "status": "PASS"
        },
        {
            "num": "ฟังก์ชันที่ 3",
            "title": "บันทึกการส่งมอบงาน (Submit Work Deliverables)",
            "role": "ฟรีแลนซ์ (Freelancer)",
            "objective": "ทดสอบการส่งมอบลิงก์ผลงาน GitHub, Figma หรือ IPFS Hash เข้าสู่ระบบสัญญาอัจฉริยะ",
            "inputs": [
                "รหัสงาน (Job ID): 1",
                "ลิงก์ผลงาน หรือ Hash: https://github.com/freelancer-dev/nextjs-ecommerce-project"
            ],
            "expected": "ผลงานถูกบันทึกลงบนบล็อกเชน สถานะงานเปลี่ยนเป็น 'ส่งงานแล้ว' และบันทึกประวัติการส่งงานเวอร์ชันล่าสุด",
            "actual": "ระบบเรียกฟังก์ชัน submitWorkTha(1, work) สำเร็จ บันทึกเวลาที่ส่งมอบ (Timestamp) และแสดงประวัติผลงานได้อย่างสมบูรณ์",
            "image": "C:/Users/pairr/CSI301_quiz2_66078633/test_screenshots/03_submit_work.png",
            "status": "PASS"
        },
        {
            "num": "ฟังก์ชันที่ 4",
            "title": "อนุมัติและจ่ายเงิน (Approve Work & Release Payment)",
            "role": "ผู้ว่าจ้าง (Client / Employer)",
            "objective": "ทดสอบการตรวจสอบผลงานและอนุมัติปล่อยเงินค่าจ้างที่ล็อกอยู่ใน Escrow Vault ให้โอนเข้ากระเป๋าของฟรีแลนซ์โดยตรง",
            "inputs": [
                "รหัสงาน (Job ID): 1"
            ],
            "expected": "Smart Contract โอนเงิน 0.05 ETH ไปยังกระเป๋าของฟรีแลนซ์โดยอัตโนมัติ และเปลี่ยนสถานะสัญญาเป็น 'เสร็จสิ้น'",
            "actual": "เรียกฟังก์ชัน approveWorkTha(1) สำเร็จ Smart Contract ปล่อยเงินค่าจ้างทันที และบันทึก Transaction การจ่ายเงิน",
            "image": "C:/Users/pairr/CSI301_quiz2_66078633/test_screenshots/04_approve_work.png",
            "status": "PASS"
        },
        {
            "num": "ฟังก์ชันที่ 5",
            "title": "จัดการข้อพิพาท (Dispute Management & Arbitration)",
            "role": "คู่สัญญา (Client/Freelancer) และ ผู้ดูแลระบบ (Admin Arbitrator)",
            "objective": "ทดสอบกระบวนการแจ้งข้อพิพาทเมื่อเกิดความขัดแย้ง และการตัดสินชี้ขาดของผู้ดูแลระบบ (จ่ายเงินให้ฟรีแลนซ์ หรือ คืนเงินให้ผู้ว่าจ้าง)",
            "inputs": [
                "แจ้งข้อพิพาท (Dispute Claim): รหัสงาน (Job ID): 1",
                "การตัดสินของแอดมิน (Admin Decision): Job ID: 1, ผลการตัดสิน: จ่ายเงินให้ฟรีแลนซ์ (Pay Freelancer)"
            ],
            "expected": "งานเข้าสู่สถานะ 'มีข้อพิพาท' และเฉพาะแอดมินเท่านั้นที่มีสิทธิ์ตัดสินโอนเงินหรือคืนเงินตามสัดส่วนที่ถูกต้อง",
            "actual": "ฟังก์ชัน raiseDisputeTha(1) และ resolveDisputeTha(1, true) ทำงานได้อย่างถูกต้อง มีระบบ Role Gate ป้องกันคนนอกเข้าถึง",
            "image": "C:/Users/pairr/CSI301_quiz2_66078633/test_screenshots/05_2_dispute_admin_resolve.png",
            "status": "PASS"
        },
        {
            "num": "ฟังก์ชันที่ 6",
            "title": "ติดตามสถานะและธุรกรรม (Track Job Status & Activity Ledger)",
            "role": "สาธารณะ / ทุกบทบาท (Public & Auditing)",
            "objective": "ทดสอบการตรวจสอบรายละเอียดสัญญา ประวัติเวอร์ชันงานที่ส่งมอบ ประวัติการขอแก้ไข และรายการประวัติธุรกรรมสดบนบล็อกเชน",
            "inputs": [
                "ค้นหารายละเอียดงาน: Job ID: 1",
                "ตรวจสอบประวัติธุรกรรม: กดปุ่ม 'รีเฟรชประวัติ' (Fetch Transactions)"
            ],
            "expected": "แสดงข้อมูลสัญญาครบถ้วน (ชื่อ, รายละเอียด, คู่สัญญา, Deadline, ผลงาน, สถานะ) และตารางประวัติธุรกรรมพร้อมลิงก์ไปยัง Sepolia Etherscan",
            "actual": "ระบบดึงข้อมูลจาก Smart Contract และ Backend SQLite API (/api/transactions) แสดงผลไทม์ไลน์และลิงก์ Etherscan ได้สมบูรณ์",
            "image": "C:/Users/pairr/CSI301_quiz2_66078633/test_screenshots/06_track_and_ledger.png",
            "status": "PASS"
        },
        {
            "num": "ฟังก์ชันที่ 7",
            "title": "ระบบให้คะแนนและรีวิว (Rating & Review System)",
            "role": "คู่สัญญา และ ผู้ใช้งานทั่วไป (Reputation)",
            "objective": "ทดสอบการประเมินผลการทำงาน 1-5 ดาว การเขียนรีวิวข้อคิดเห็น และการตรวจสอบคะแนนความน่าเชื่อถือเฉลี่ยตาม Wallet Address",
            "inputs": [
                "ส่งรีวิว: Job ID: 1, คะแนน: 5 ดาว, ความคิดเห็น: 'ส่งงานตรงเวลา โค้ดมีคุณภาพสูง แนะนำเลยครับ!'",
                "ตรวจสอบคะแนน: Wallet: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
            ],
            "expected": "รีวิวถูกบันทึกลงบนบล็อกเชน และระบบคำนวณคะแนนเฉลี่ย (Average Rating / 5.00) พร้อมนับจำนวนรีวิวได้อย่างแม่นยำ",
            "actual": "ฟังก์ชัน addReviewTha() และ getRatingTha() ทำงานถูกต้อง รีวิวปรากฏในประวัติงาน และคะแนนเฉลี่ยคำนวณถูกต้อง 5.00/5",
            "image": "C:/Users/pairr/CSI301_quiz2_66078633/test_screenshots/07_rating_and_review.png",
            "status": "PASS"
        },
        {
            "num": "ฟังก์ชันที่ 8",
            "title": "ระบบขอแก้ไขและส่งงานใหม่ (Request Revision & Resubmit)",
            "role": "ผู้ว่าจ้าง (ขอแก้ไข) และ ฟรีแลนซ์ (ส่งงานใหม่)",
            "objective": "ทดสอบการแจ้งข้อเสนอแนะในการปรับปรุงงาน และการบันทึกประวัติการขอแก้ไขแต่ละครั้งอย่างเป็นระบบ",
            "inputs": [
                "รหัสงาน (Job ID): 1",
                "รายละเอียดการแก้ไข: ขอปรับแก้สีปุ่มสั่งซื้อและเพิ่มระบบกรองสินค้าตามหมวดหมู่"
            ],
            "expected": "สถานะงานเปลี่ยนเป็น 'รอแก้ไข' ประวัติการแก้ไขถูกบันทึกเรียงครั้งที่ 1, 2, ... และเปิดให้ฟรีแลนซ์ส่งงานเวอร์ชันใหม่ได้",
            "actual": "ฟังก์ชัน requestRevisionTha(1, detail) ทำงานสำเร็จ บันทึกลง getRevisionHistoryTha() และระบบแจ้งเตือนชัดเจน",
            "image": "C:/Users/pairr/CSI301_quiz2_66078633/test_screenshots/08_revision_request.png",
            "status": "PASS"
        }
    ]

    for tc in test_cases:
        p_head = doc.add_paragraph()
        run_head = p_head.add_run(f"📌 {tc['num']}: {tc['title']}")
        run_head.bold = True
        run_head.font.size = Pt(14)
        run_head.font.color.rgb = RGBColor(15, 23, 42)

        # Details Table
        tbl = doc.add_table(rows=6, cols=2)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False

        rows_data = [
            ("บทบาทที่ทำการทดสอบ (Role):", tc['role']),
            ("วัตถุประสงค์ (Objective):", tc['objective']),
            ("ข้อมูลนำเข้าที่ทดสอบ (Test Inputs):", "\n".join(tc['inputs'])),
            ("ผลลัพธ์ที่คาดหวัง (Expected Result):", tc['expected']),
            ("ผลลัพธ์จริงที่ได้ (Actual Result):", tc['actual']),
            ("สถานะการทดสอบ (Test Status):", f"✅ {tc['status']}")
        ]

        for i, (k, v) in enumerate(rows_data):
            cell_k = tbl.rows[i].cells[0]
            cell_v = tbl.rows[i].cells[1]
            cell_k.width = Inches(2.0)
            cell_v.width = Inches(4.8)

            pk = cell_k.paragraphs[0]
            rk = pk.add_run(k)
            rk.bold = True
            rk.font.size = Pt(11)

            pv = cell_v.paragraphs[0]
            rv = pv.add_run(v)
            rv.font.size = Pt(11)

            if "PASS" in v:
                rv.bold = True
                rv.font.color.rgb = RGBColor(16, 185, 129)

            set_cell_background(cell_k, 'F1F5F9')
            set_cell_background(cell_v, 'FAFAFA')
            set_cell_margins(cell_k, 50, 50, 80, 80)
            set_cell_margins(cell_v, 50, 50, 80, 80)

        # Add Screenshot Image
        if os.path.exists(tc['image']):
            doc.add_paragraph()
            p_img_title = doc.add_paragraph()
            r_img_title = p_img_title.add_run("📸 ภาพบันทึกผลการทดสอบบนหน้าจอจริง (Actual Test Screenshot):")
            r_img_title.bold = True
            r_img_title.font.size = Pt(11)
            r_img_title.font.color.rgb = RGBColor(71, 85, 105)

            p_img = doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(4)
            p_img.paragraph_format.space_after = Pt(16)
            run_img = p_img.add_run()
            run_img.add_picture(tc['image'], width=Inches(6.2))

        doc.add_paragraph()

    # Conclusion & Sign-off
    h3 = doc.add_paragraph()
    r3 = h3.add_run("3. สรุปผลการประเมินระบบ (Conclusion & System Sign-Off)")
    r3.bold = True
    r3.font.size = Pt(16)
    r3.font.color.rgb = RGBColor(79, 70, 229)

    p_concl = doc.add_paragraph()
    p_concl.add_run(
        "จากการทดสอบทั้ง 8 ฟังก์ชันหลักของระบบ Freelance Escrow Web3 Application "
        "พบว่าระบบสามารถทำงานร่วมกับ Smart Contract บนเครือข่าย Sepolia Testnet และฐานข้อมูล SQLite ของ Backend ได้อย่างสมบูรณ์ 100% "
        "ทุกเงื่อนไขทางธุรกิจ (Business Logic) รวมถึงระบบตรวจสอบสิทธิ์การเข้าถึงแบบแยกบทบาท (Strict Role-Based Separation) "
        "ระหว่าง ผู้ว่าจ้าง (Client), ฟรีแลนซ์ (Freelancer) และ ผู้ดูแลระบบ (Admin) สามารถคุ้มครองความปลอดภัยของเงินค่าจ้าง "
        "และอำนวยความสะดวกในการใช้งานตามมาตรฐานแพลตฟอร์มฟรีแลนซ์ระดับสากลได้อย่างมีประสิทธิภาพ"
    )

    doc.add_paragraph()
    p_sign = doc.add_paragraph()
    p_sign.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_sign = p_sign.add_run("ผลการทดสอบ: ผ่านการอนุมัติ (PASSED)\nวันที่ทดสอบ: 18 พฤศจิกายน 2026")
    r_sign.bold = True
    r_sign.font.color.rgb = RGBColor(16, 185, 129)

    output_path = "C:/Users/pairr/CSI301_quiz2_66078633/รายงานผลการทดสอบระบบ_Freelance_Escrow.docx"
    doc.save(output_path)
    print(f"Report saved successfully to {output_path}")

if __name__ == '__main__':
    create_report()
