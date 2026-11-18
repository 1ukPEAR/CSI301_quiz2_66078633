
const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();

app.use(cors());
app.use(express.json());

// หน้าแรก
app.get("/", (req, res) => {
    res.send("Freelance Escrow Tha API is running");
});

// บันทึกธุรกรรม
app.post("/api/transactions", (req, res) => {

    const { jobId, hash, action, wallet } = req.body;

    if (!jobId || !hash || !action || !wallet) {
        return res.status(400).json({
            message: "กรุณากรอกข้อมูลให้ครบ"
        });
    }

    try {

        const sql = db.prepare(`
            INSERT INTO transactions
            (jobId, hash, action, wallet)
            VALUES (?, ?, ?, ?)
        `);

        sql.run(jobId, hash, action, wallet);

        res.json({
            message: "บันทึกธุรกรรมสำเร็จ"
        });

    } catch (error) {

        res.status(400).json({
            message: "ไม่สามารถบันทึกข้อมูลได้"
        });

    }
});

// ดูธุรกรรมทั้งหมด
app.get("/api/transactions", (req, res) => {

    const data = db.prepare(`
        SELECT * FROM transactions
        ORDER BY id DESC
    `).all();

    res.json(data);
});

// ดูธุรกรรมตาม Job ID
app.get("/api/transactions/:jobId", (req, res) => {

    const data = db.prepare(`
        SELECT * FROM transactions
        WHERE jobId = ?
        ORDER BY id DESC
    `).all(req.params.jobId);

    res.json(data);
});

// เริ่ม Server
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
