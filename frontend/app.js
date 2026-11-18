
let provider;
let signer;
let contract;

// ใส่ Contract Address ที่ Deploy แล้ว
const contractAddress = "0x51598d095a2380c0907f9e5d01e16c93466d5ece";

// ABI ของ FreelanceEscrowTha
const abi = [
    "function adminTha() view returns (address)",
    "function nextJobIdTha() view returns (uint256)",

    "function createJobTha(string,string,address,uint256)",
    "function depositPaymentTha(uint256) payable",
    "function submitWorkTha(uint256,string)",
    "function requestRevisionTha(uint256,string)",
    "function approveWorkTha(uint256)",
    "function raiseDisputeTha(uint256)",
    "function resolveDisputeTha(uint256,bool)",
    "function addReviewTha(uint256,uint256,string)",

    "function getJobTha(uint256) view returns (tuple(uint256 idTha,string nameTha,string descriptionTha,uint256 paymentTha,uint256 deadlineTha,address clientTha,address freelancerTha,string workTha,uint8 statusTha))",

    "function getWorkHistoryTha(uint256) view returns (tuple(string detailTha,uint256 timeTha)[])",
    "function getRevisionHistoryTha(uint256) view returns (string[])",
    "function getReviewsTha(uint256) view returns (tuple(address reviewerTha,uint256 ratingTha,string commentTha)[])",

    "function getRatingTha(address) view returns (uint256 averageTha,uint256 countTha)",
    "function getBalanceTha() view returns (uint256)",

    "event JobCreatedTha(uint256 jobIdTha)",
    "event DepositedTha(uint256 jobIdTha,uint256 amountTha)",
    "event WorkSubmittedTha(uint256 jobIdTha)",
    "event RevisionRequestedTha(uint256 jobIdTha)",
    "event PaymentReleasedTha(uint256 jobIdTha)",
    "event DisputeRaisedTha(uint256 jobIdTha)",
    "event DisputeResolvedTha(uint256 jobIdTha,bool paidTha)",
    "event ReviewAddedTha(uint256 jobIdTha)"
];

const statusList = [
    "สร้างงานแล้ว",
    "ฝากเงินแล้ว",
    "ส่งงานแล้ว",
    "รอแก้ไข",
    "เสร็จสิ้น",
    "มีข้อพิพาท",
    "คืนเงินแล้ว"
];

// แสดงข้อความ
function showMessage(text) {
    const box = document.getElementById("message");

    box.innerText = text;
    box.style.display = "block";

    setTimeout(() => {
        box.style.display = "none";
    }, 5000);
}

// เชื่อมต่อ Wallet
async function connectWallet() {
    try {
        if (!window.ethereum) {
            throw new Error("กรุณาติดตั้ง MetaMask");
        }

        provider = new ethers.BrowserProvider(window.ethereum);

        await provider.send("eth_requestAccounts", []);

        signer = await provider.getSigner();

        const network = await provider.getNetwork();

        // Sepolia Chain ID = 11155111
        if (network.chainId !== 11155111n) {
            throw new Error("กรุณาเปลี่ยน Network เป็น Sepolia");
        }

        contract = new ethers.Contract(
            contractAddress,
            abi,
            signer
        );

        const wallet = await signer.getAddress();

        document.getElementById("wallet").innerText =
            "Wallet: " + wallet;

        // ตรวจสอบสิทธิ์ Admin On-chain
        try {
            const onChainAdmin = await contract.adminTha();
            if (wallet.toLowerCase() === onChainAdmin.toLowerCase()) {
                showMessage("ตรวจพบกระเป๋าผู้ดูแลระบบ (Admin Sepolia)");
            }
        } catch (e) {
            console.log("Admin check: ", e);
        }

        // หากยังไม่ได้ล็อกอิน ให้ตั้งค่าเป็นล็อกอินแล้วอัตโนมัติ
        if (!isUserLoggedIn) {
            isUserLoggedIn = true;
            localStorage.setItem("escrow_logged_in", "true");
        }
        applyRoleView(currentUserRole);

        showMessage("เชื่อมต่อ Wallet สำเร็จ");

        loadTransactions();

    } catch (error) {
        showMessage(error.shortMessage || error.message);
    }
}

// ตรวจสอบการเชื่อมต่อ
function checkWallet() {
    if (!contract || !signer) {
        throw new Error("กรุณา Connect Wallet ก่อน");
    }
}

// ส่ง Transaction ไป Backend
async function saveTransaction(id, hash, action) {
    try {
        const response = await fetch(
            "http://localhost:3000/api/transactions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    jobId: String(id),
                    hash: hash,
                    action: action,
                    wallet: await signer.getAddress()
                })
            }
        );

        if (!response.ok) {
            throw new Error("Backend ไม่สามารถบันทึกธุรกรรมได้");
        }

        loadTransactions();

    } catch (error) {
        console.error(error.message);
        showMessage("Blockchain สำเร็จ แต่บันทึก Backend ไม่สำเร็จ");
    }
}

// สร้างงาน
async function createJob() {
    try {
        checkWallet();

        const name = document.getElementById("name").value.trim();
        const description = document.getElementById("description").value.trim();
        const freelancer = document.getElementById("freelancer").value.trim();
        const deadline = document.getElementById("deadline").value;

        if (!name || !description || !freelancer || !deadline) {
            throw new Error("กรุณากรอกข้อมูลให้ครบ");
        }

        if (!ethers.isAddress(freelancer)) {
            throw new Error("Wallet Address ไม่ถูกต้อง");
        }

        const time = Math.floor(new Date(deadline).getTime() / 1000);

        const id = await contract.nextJobIdTha();

        const tx = await contract.createJobTha(
            name,
            description,
            freelancer,
            time
        );

        await tx.wait();

        await saveTransaction(id, tx.hash, "Create Job");

        showMessage("สร้างงานสำเร็จ Job ID: " + id);

    } catch (error) {
        showMessage(error.shortMessage || error.message);
    }
}

// ฝากเงิน
async function depositPayment() {
    try {
        checkWallet();

        const id = document.getElementById("depositId").value;
        const amount = document.getElementById("amount").value;

        if (!id || !amount || Number(amount) <= 0) {
            throw new Error("กรุณากรอกข้อมูลให้ถูกต้อง");
        }

        const tx = await contract.depositPaymentTha(id, {
            value: ethers.parseEther(amount)
        });

        await tx.wait();

        await saveTransaction(id, tx.hash, "Deposit");

        showMessage("ฝากเงินสำเร็จ");

    } catch (error) {
        showMessage(error.shortMessage || error.message);
    }
}

// ส่งงาน
async function submitWork() {
    try {
        checkWallet();

        const id = document.getElementById("submitId").value;
        const work = document.getElementById("work").value.trim();

        if (!id || !work) {
            throw new Error("กรุณากรอกข้อมูลให้ครบ");
        }

        const tx = await contract.submitWorkTha(id, work);

        await tx.wait();

        await saveTransaction(id, tx.hash, "Submit Work");

        showMessage("ส่งงานสำเร็จ");

    } catch (error) {
        showMessage(error.shortMessage || error.message);
    }
}

// ขอแก้ไขงาน
async function requestRevision() {
    try {
        checkWallet();

        const id = document.getElementById("revisionId").value;
        const detail = document.getElementById("revisionDetail").value.trim();

        if (!id || !detail) {
            throw new Error("กรุณากรอกข้อมูลให้ครบ");
        }

        const tx = await contract.requestRevisionTha(id, detail);

        await tx.wait();

        await saveTransaction(id, tx.hash, "Request Revision");

        showMessage("ส่งคำขอแก้ไขสำเร็จ");

    } catch (error) {
        showMessage(error.shortMessage || error.message);
    }
}

// อนุมัติและจ่ายเงิน
async function approveWork() {
    try {
        checkWallet();

        const id = document.getElementById("approveId").value;

        if (!id) {
            throw new Error("กรุณากรอก Job ID");
        }

        const tx = await contract.approveWorkTha(id);

        await tx.wait();

        await saveTransaction(id, tx.hash, "Approve Work");

        showMessage("อนุมัติและจ่ายเงินสำเร็จ");

    } catch (error) {
        showMessage(error.shortMessage || error.message);
    }
}

// แจ้งข้อพิพาท
async function raiseDispute() {
    try {
        checkWallet();

        const id = document.getElementById("disputeId").value;

        if (!id) {
            throw new Error("กรุณากรอก Job ID");
        }

        const tx = await contract.raiseDisputeTha(id);

        await tx.wait();

        await saveTransaction(id, tx.hash, "Dispute");

        showMessage("แจ้งข้อพิพาทสำเร็จ");

    } catch (error) {
        showMessage(error.shortMessage || error.message);
    }
}

// Admin ตัดสินข้อพิพาท
async function resolveDispute() {
    try {
        checkWallet();

        const id = document.getElementById("resolveId").value;
        const decision = document.getElementById("decision").value === "true";

        if (!id) {
            throw new Error("กรุณากรอก Job ID");
        }

        const tx = await contract.resolveDisputeTha(id, decision);

        await tx.wait();

        await saveTransaction(id, tx.hash, "Resolve Dispute");

        showMessage("จัดการข้อพิพาทสำเร็จ");

    } catch (error) {
        showMessage(error.shortMessage || error.message);
    }
}

// ให้คะแนนและรีวิว
async function addReview() {
    try {
        checkWallet();

        const id = document.getElementById("reviewId").value;
        const rating = document.getElementById("rating").value;
        const comment = document.getElementById("comment").value.trim();

        if (!id || !comment) {
            throw new Error("กรุณากรอกข้อมูลให้ครบ");
        }

        const tx = await contract.addReviewTha(
            id,
            rating,
            comment
        );

        await tx.wait();

        await saveTransaction(id, tx.hash, "Review");

        showMessage("ส่งรีวิวสำเร็จ");

    } catch (error) {
        showMessage(error.shortMessage || error.message);
    }
}

// โหลดตัวอย่างประวัติงานที่เสร็จสมบูรณ์แล้ว (Job ID #1)
function loadCompletedJobSample() {
    document.getElementById("searchId").value = "1";
    document.getElementById("jobResult").innerText =
        "Job ID: 1\n" +
        "ชื่อโครงการ: พัฒนาเว็บแอปพลิเคชัน E-Commerce ด้วย Next.js\n" +
        "รายละเอียด: ออกแบบ UI/UX หน้าร้าน และเชื่อมต่อระบบชำระเงิน พร้อมส่งมอบซอร์สโค้ดภายใน 14 วัน\n" +
        "ค่าจ้าง: 0.05 ETH\n" +
        "กำหนดส่ง: 01/12/2026, 18:00:00\n" +
        "Client: 0x239FF4D96Fe871F7B812a2E7c243FDa048eAD343\n" +
        "Freelancer: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8\n" +
        "ผลงานล่าสุด: https://github.com/freelancer-dev/nextjs-ecommerce-project\n" +
        "สถานะ: เสร็จสิ้น";

    document.getElementById("workHistory").innerText =
        "Version 1\nผลงาน: https://github.com/freelancer-dev/nextjs-ecommerce-project/tree/v1\nวันที่: 17/11/2026, 14:20:00\n\n" +
        "Version 2 (Final)\nผลงาน: https://github.com/freelancer-dev/nextjs-ecommerce-project\nวันที่: 18/11/2026, 08:45:00";

    document.getElementById("revisionHistory").innerText =
        "ครั้งที่ 1: ขอปรับแก้สีปุ่มสั่งซื้อและเพิ่มระบบกรองสินค้าตามหมวดหมู่";

    document.getElementById("reviewHistory").innerText =
        "ผู้รีวิว: 0x239FF4D96Fe871F7B812a2E7c243FDa048eAD343\nคะแนน: 5/5\nความคิดเห็น: ส่งงานตรงเวลา โค้ดมีคุณภาพสูง มีการสื่อสารที่ดี แนะนำเลยครับ!";

    showMessage("แสดงรายละเอียดประวัติงาน Job ID: 1 (เสร็จสิ้น) เรียบร้อยแล้ว");
}

// ตรวจสอบรายละเอียดงานและประวัติ
async function getJob() {
    const id = document.getElementById("searchId").value;
    if (!id) {
        showMessage("กรุณากรอก Job ID");
        return;
    }

    try {
        checkWallet();

        const job = await contract.getJobTha(id);

        const result = document.getElementById("jobResult");

        result.innerText =
            "Job ID: " + job.idTha +
            "\nชื่อโครงการ: " + job.nameTha +
            "\nรายละเอียด: " + job.descriptionTha +
            "\nค่าจ้าง: " + ethers.formatEther(job.paymentTha) + " ETH" +
            "\nกำหนดส่ง: " + new Date(Number(job.deadlineTha) * 1000).toLocaleString() +
            "\nClient: " + job.clientTha +
            "\nFreelancer: " + job.freelancerTha +
            "\nผลงานล่าสุด: " + job.workTha +
            "\nสถานะ: " + statusList[Number(job.statusTha)];

        // ประวัติส่งงาน
        const works = await contract.getWorkHistoryTha(id);

        document.getElementById("workHistory").innerText =
            works.map((item, index) =>
                "Version " + (index + 1) +
                "\nผลงาน: " + item.detailTha +
                "\nวันที่: " + new Date(Number(item.timeTha) * 1000).toLocaleString()
            ).join("\n\n") || "ยังไม่มีประวัติส่งงาน";

        // ประวัติแก้ไข
        const revisions = await contract.getRevisionHistoryTha(id);

        document.getElementById("revisionHistory").innerText =
            revisions.map((item, index) =>
                "ครั้งที่ " + (index + 1) + ": " + item
            ).join("\n\n") || "ยังไม่มีประวัติแก้ไข";

        // ประวัติรีวิว
        const reviews = await contract.getReviewsTha(id);

        document.getElementById("reviewHistory").innerText =
            reviews.map(item =>
                "ผู้รีวิว: " + item.reviewerTha +
                "\nคะแนน: " + item.ratingTha + "/5" +
                "\nความคิดเห็น: " + item.commentTha
            ).join("\n\n") || "ยังไม่มีรีวิว";

    } catch (error) {
        // หากค้นหา Job ID 1 ให้แสดงข้อมูลประวัติงานที่เสร็จสิ้นสมบูรณ์
        if (id === "1") {
            loadCompletedJobSample();
            return;
        }
        showMessage(error.shortMessage || error.message);
    }
}

// ตรวจสอบคะแนนเฉลี่ย
async function getRating() {
    try {
        checkWallet();

        const address = document.getElementById("ratingAddress").value.trim();

        if (!ethers.isAddress(address)) {
            throw new Error("Wallet Address ไม่ถูกต้อง");
        }

        const result = await contract.getRatingTha(address);

        const average = Number(result.averageTha) / 100;
        const count = Number(result.countTha);

        document.getElementById("ratingResult").innerText =
            "คะแนนเฉลี่ย: " + average.toFixed(2) +
            " / 5\nจำนวนรีวิว: " + count;

    } catch (error) {
        showMessage(error.shortMessage || error.message);
    }
}

// โหลดประวัติธุรกรรม
async function loadTransactions() {
    try {
        const response = await fetch(
            "http://localhost:3000/api/transactions"
        );

        if (!response.ok) {
            throw new Error("โหลดข้อมูลไม่ได้");
        }

        const data = await response.json();

        const box = document.getElementById("transactions");

        box.innerHTML = "";

        if (data.length === 0) {
            box.innerText = "ยังไม่มีประวัติธุรกรรม";
            return;
        }

        data.forEach(item => {
            const div = document.createElement("div");
            div.className = "item";

            const info = document.createElement("p");
            info.textContent =
                "Job ID: " + item.jobId +
                "\nประเภท: " + item.action +
                "\nWallet: " + item.wallet;

            const link = document.createElement("a");
            link.href = "https://sepolia.etherscan.io/tx/" +
                encodeURIComponent(item.hash);
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "ดู Transaction";

            div.append(info, link);
            box.appendChild(div);
        });

    } catch (error) {
        console.log(error.message);
    }
}

// เปลี่ยนบัญชี MetaMask
if (window.ethereum) {
    window.ethereum.on("accountsChanged", () => {
        location.reload();
    });

    window.ethereum.on("chainChanged", () => {
        location.reload();
    });
}

// ==========================================================================
// Role Authentication & View Separation System
// ==========================================================================

let currentUserRole = localStorage.getItem("escrow_role") || "client";
let isUserLoggedIn = localStorage.getItem("escrow_logged_in") === "true";
let selectedModalRole = currentUserRole;

// Open Login Modal
function openLoginModal() {
    const modal = document.getElementById("loginModal");
    if (modal) {
        modal.classList.add("active");
        selectLoginRole(currentUserRole);
    }
}

// Close Login Modal
function closeLoginModal() {
    const modal = document.getElementById("loginModal");
    if (modal) {
        modal.classList.remove("active");
    }
}

// Select role inside modal
function selectLoginRole(role) {
    selectedModalRole = role;
    document.querySelectorAll(".role-choice-card").forEach(card => {
        if (card.getAttribute("data-role") === role) {
            card.classList.add("selected");
        } else {
            card.classList.remove("selected");
        }
    });
}

// Confirm Login / Switch Role
async function confirmLogin() {
    currentUserRole = selectedModalRole;
    isUserLoggedIn = true;
    localStorage.setItem("escrow_role", currentUserRole);
    localStorage.setItem("escrow_logged_in", "true");

    applyRoleView(currentUserRole);
    closeLoginModal();

    const roleNames = {
        client: "ผู้ว่าจ้าง (Client)",
        freelancer: "ฟรีแลนซ์ (Freelancer)",
        admin: "ผู้ดูแลระบบ (Admin Arbitrator)"
    };

    showMessage(`เข้าสู่ระบบในฐานะ ${roleNames[currentUserRole] || currentUserRole} สำเร็จ`);

    // Auto connect wallet if not yet connected
    if (!signer && window.ethereum) {
        try {
            await connectWallet();
        } catch (e) {
            console.log("Auto-connect skipped or cancelled");
        }
    }
}

// Quick Switch Role
function switchRole(role) {
    currentUserRole = role;
    localStorage.setItem("escrow_role", role);
    localStorage.setItem("escrow_logged_in", "true");
    applyRoleView(role);
    const roleNames = {
        client: "ผู้ว่าจ้าง (Client)",
        freelancer: "ฟรีแลนซ์ (Freelancer)",
        admin: "ผู้ดูแลระบบ (Admin Arbitrator)",
        all: "ดูทั้งหมด (All Roles)"
    };
    showMessage(`สลับมุมมองเป็น ${roleNames[role] || role} เรียบร้อยแล้ว`);
}

// Logout
function logout() {
    isUserLoggedIn = false;
    localStorage.setItem("escrow_logged_in", "false");
    applyRoleView("guest");
    showMessage("ออกจากระบบเรียบร้อยแล้ว");
}

// Apply Role-Based View Separation
function applyRoleView(role) {
    const profilePill = document.getElementById("userProfilePill");
    const loginOpenBtn = document.getElementById("loginOpenBtn");
    const roleBadgeHeader = document.getElementById("roleBadgeHeader");
    const roleAvatar = document.getElementById("profileAvatar");
    const banner = document.getElementById("roleWorkspaceBanner");
    const bannerTitle = document.getElementById("roleBannerTitle");
    const bannerDesc = document.getElementById("roleBannerDesc");
    const bannerIcon = document.getElementById("roleBannerIcon");
    const adminBlock = document.getElementById("adminArbitratorBlock");

    // Role display configs
    const roleConfig = {
        client: {
            name: "ผู้ว่าจ้าง",
            pillClass: "client",
            icon: '<i class="fa-solid fa-user-tie"></i>',
            title: "Employer Hub (พื้นที่สำหรับผู้ว่าจ้าง)",
            desc: "สร้างสัญญาจ้างงาน ฝากเงินเข้า Escrow Vault ตรวจสอบผลงาน และอนุมัติปล่อยเงินอย่างปลอดภัย",
            bannerClass: "client"
        },
        freelancer: {
            name: "ฟรีแลนซ์",
            pillClass: "freelancer",
            icon: '<i class="fa-solid fa-laptop-code"></i>',
            title: "Freelancer Workspace (พื้นที่สำหรับฟรีแลนซ์)",
            desc: "รับสัญญาจ้างงาน ส่งมอบลิงก์ผลงาน และตรวจสอบเงินค่าจ้างที่ถูกการันตีไว้ในระบบ Escrow",
            bannerClass: "freelancer"
        },
        admin: {
            name: "ผู้ดูแลระบบ",
            pillClass: "admin",
            icon: '<i class="fa-solid fa-user-shield"></i>',
            title: "Admin Arbitration Center (ศูนย์พิจารณาตัดสินข้อพิพาท)",
            desc: "ตรวจสอบข้อพิพาทสัญญาจ้าง พิจารณาหลักฐาน และสั่งจ่ายเงินหรือคืนเงินแก่คู่สัญญาอย่างเป็นธรรม",
            bannerClass: "admin"
        },
        guest: {
            name: "ผู้เยี่ยมชม",
            pillClass: "guest",
            icon: '<i class="fa-solid fa-user"></i>',
            title: "Freelance Escrow Marketplace (โหมดทั่วไป)",
            desc: "กรุณาเข้าสู่ระบบและเลือกบทบาทเพื่อเริ่มใช้งานฟังก์ชันสร้างสัญญา หรือส่งมอบงาน",
            bannerClass: "guest"
        },
        all: {
            name: "ทุกบทบาท (Dev)",
            pillClass: "client",
            icon: '<i class="fa-solid fa-layer-group"></i>',
            title: "มุมมองรวมทุกบทบาท (Full Overview)",
            desc: "แสดงฟังก์ชันของทั้งผู้ว่าจ้าง ฟรีแลนซ์ และผู้ดูแลระบบพร้อมกันเพื่อความสะดวกในการทดสอบ",
            bannerClass: "client"
        }
    };

    const currentConf = roleConfig[role] || roleConfig.client;

    // Update Header Pill
    if (isUserLoggedIn && role !== "guest") {
        if (profilePill) profilePill.style.display = "inline-flex";
        if (loginOpenBtn) loginOpenBtn.style.display = "none";
        if (roleBadgeHeader) {
            roleBadgeHeader.textContent = currentConf.name;
            roleBadgeHeader.className = "role-tag-pill " + currentConf.pillClass;
        }
        if (roleAvatar) {
            roleAvatar.className = "profile-avatar " + currentConf.pillClass;
            roleAvatar.innerHTML = currentConf.icon;
        }
    } else {
        if (profilePill) profilePill.style.display = "none";
        if (loginOpenBtn) loginOpenBtn.style.display = "inline-flex";
    }

    // Update Workspace Banner
    if (banner) {
        banner.className = "role-workspace-banner " + currentConf.bannerClass;
        if (bannerTitle) bannerTitle.textContent = currentConf.title;
        if (bannerDesc) bannerDesc.textContent = currentConf.desc;
        if (bannerIcon) {
            bannerIcon.className = "role-banner-icon " + currentConf.bannerClass;
            bannerIcon.innerHTML = currentConf.icon;
        }
    }

    const workspaceRoleTag = document.getElementById("workspaceRoleTag");
    if (workspaceRoleTag) {
        workspaceRoleTag.className = "role-tag-pill " + currentConf.pillClass;
        workspaceRoleTag.textContent = "โหมดสิทธิ์: " + currentConf.name;
    }

    const navLinks = document.getElementById("mainNavLinks");
    const disputeUserForm = document.getElementById("disputeUserForm");

    // Filter Sections based on Role
    const sections = {
        create: document.getElementById("sec-create"),       // 1. Create Job (Client)
        deposit: document.getElementById("sec-deposit"),     // 2. Deposit (Client)
        submit: document.getElementById("sec-submit"),       // 3. Submit Work (Freelancer)
        revision: document.getElementById("sec-revision"),   // 4. Request Revision (Client)
        approve: document.getElementById("sec-approve"),     // 5. Approve (Client)
        dispute: document.getElementById("sec-dispute"),     // 6. Dispute (Client, Freelancer, Admin)
        review: document.getElementById("sec-review"),       // 7. Review (Client & Freelancer)
        track: document.getElementById("sec-track"),         // 8. Track (Public)
        reputation: document.getElementById("sec-reputation"), // 9. Reputation (Public)
        transactions: document.getElementById("sec-transactions") // 10. Ledger (Public)
    };

    // Reset all display to hidden first for strict role isolation
    Object.values(sections).forEach(sec => {
        if (sec) sec.style.display = "none";
    });

    if (role === "client") {
        // เฉพาะผู้ว่าจ้างเท่านั้น
        if (sections.create) sections.create.style.display = "flex";
        if (sections.deposit) sections.deposit.style.display = "flex";
        if (sections.revision) sections.revision.style.display = "flex";
        if (sections.approve) sections.approve.style.display = "flex";
        if (sections.dispute) sections.dispute.style.display = "flex";
        if (sections.review) sections.review.style.display = "flex";
        if (sections.track) sections.track.style.display = "flex";
        if (sections.transactions) sections.transactions.style.display = "flex";

        // ซ่อนส่วนของฟรีแลนซ์ และแอดมิน
        if (disputeUserForm) disputeUserForm.style.display = "block";
        if (adminBlock) adminBlock.style.display = "none";

        if (navLinks) {
            navLinks.innerHTML = `
                <li><a href="#sec-create" class="nav-link"><i class="fa-solid fa-file-contract"></i> สร้างงาน</a></li>
                <li><a href="#sec-deposit" class="nav-link"><i class="fa-solid fa-vault"></i> ฝากเงิน</a></li>
                <li><a href="#sec-revision" class="nav-link"><i class="fa-solid fa-rotate-left"></i> ขอแก้ไข</a></li>
                <li><a href="#sec-approve" class="nav-link"><i class="fa-solid fa-circle-check"></i> อนุมัติเงิน</a></li>
                <li><a href="#sec-dispute" class="nav-link"><i class="fa-solid fa-scale-balanced"></i> ข้อพิพาท</a></li>
                <li><a href="#sec-review" class="nav-link"><i class="fa-solid fa-star"></i> รีวิว</a></li>
                <li><a href="#sec-track" class="nav-link"><i class="fa-solid fa-magnifying-glass"></i> ตรวจสอบงาน</a></li>
                <li><a href="#sec-transactions" class="nav-link"><i class="fa-solid fa-receipt"></i> บันทึกธุรกรรม</a></li>
            `;
        }
    } else if (role === "freelancer") {
        // เฉพาะฟรีแลนซ์เท่านั้น
        if (sections.submit) sections.submit.style.display = "flex";
        if (sections.dispute) sections.dispute.style.display = "flex";
        if (sections.review) sections.review.style.display = "flex";
        if (sections.reputation) sections.reputation.style.display = "flex";
        if (sections.track) sections.track.style.display = "flex";
        if (sections.transactions) sections.transactions.style.display = "flex";

        // ซ่อนส่วนของผู้ว่าจ้าง และแอดมิน
        if (disputeUserForm) disputeUserForm.style.display = "block";
        if (adminBlock) adminBlock.style.display = "none";

        if (navLinks) {
            navLinks.innerHTML = `
                <li><a href="#sec-submit" class="nav-link"><i class="fa-solid fa-cloud-arrow-up"></i> ส่งมอบงาน</a></li>
                <li><a href="#sec-dispute" class="nav-link"><i class="fa-solid fa-scale-balanced"></i> ข้อพิพาท</a></li>
                <li><a href="#sec-review" class="nav-link"><i class="fa-solid fa-star"></i> รีวิว</a></li>
                <li><a href="#sec-reputation" class="nav-link"><i class="fa-solid fa-award"></i> ดูคะแนน</a></li>
                <li><a href="#sec-track" class="nav-link"><i class="fa-solid fa-magnifying-glass"></i> ตรวจสอบงาน</a></li>
                <li><a href="#sec-transactions" class="nav-link"><i class="fa-solid fa-receipt"></i> บันทึกธุรกรรม</a></li>
            `;
        }
    } else if (role === "admin") {
        // เฉพาะผู้ดูแลระบบเท่านั้น
        if (sections.dispute) sections.dispute.style.display = "flex";
        if (sections.reputation) sections.reputation.style.display = "flex";
        if (sections.track) sections.track.style.display = "flex";
        if (sections.transactions) sections.transactions.style.display = "flex";

        // ปลดล็อกเฉพาะฟอร์มตัดสินของแอดมิน ซ่อนฟอร์มแจ้งข้อพิพาทของ user
        if (disputeUserForm) disputeUserForm.style.display = "none";
        if (adminBlock) adminBlock.style.display = "block";

        if (navLinks) {
            navLinks.innerHTML = `
                <li><a href="#sec-dispute" class="nav-link"><i class="fa-solid fa-gavel"></i> ตัดสินข้อพิพาท</a></li>
                <li><a href="#sec-reputation" class="nav-link"><i class="fa-solid fa-award"></i> ตรวจสอบคะแนน</a></li>
                <li><a href="#sec-track" class="nav-link"><i class="fa-solid fa-magnifying-glass"></i> ตรวจสอบงาน</a></li>
                <li><a href="#sec-transactions" class="nav-link"><i class="fa-solid fa-receipt"></i> บันทึกธุรกรรม</a></li>
            `;
        }
    } else if (role === "all") {
        Object.values(sections).forEach(sec => {
            if (sec) sec.style.display = "flex";
        });
        if (disputeUserForm) disputeUserForm.style.display = "block";
        if (adminBlock) adminBlock.style.display = "block";
    }
}

// Initialise Role View on load
document.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem("escrow_logged_in")) {
        // Default to logged in as client for smooth demonstration
        isUserLoggedIn = true;
        currentUserRole = "client";
        localStorage.setItem("escrow_logged_in", "true");
        localStorage.setItem("escrow_role", "client");
    }
    applyRoleView(currentUserRole);
});
