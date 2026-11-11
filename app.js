
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyQFIXIcFuPdfsi9j0gY9Iz_sbW5FxFv8RgpAEMawCsD5B393t6yLHoc42xt2mFM11D1Q/exec";

const medicineData = {
  paracetamol: {
    name: "พาราเซตามอล (Paracetamol)",
    ingredient: "Paracetamol",
    use: "เป็นผลิตภัณฑ์ที่ใช้บรรเทาอาการปวดและลดไข้",
    detail: "ข้อมูลทั่วไปของผลิตภัณฑ์พาราเซตามอล",
    warning: "การใช้เกินขนาดอาจเป็นอันตรายต่อตับ",
    product: "ยังไม่ได้ระบุยี่ห้อและความแรงของผลิตภัณฑ์",
    status: "ข้อมูลผลิตภัณฑ์ยังไม่ได้รับการยืนยัน"
  },
  allergy: {
    name: "ยาแก้แพ้ (Antihistamine)",
    ingredient: "ยังไม่ระบุตัวยาสำคัญ",
    use: "ผลิตภัณฑ์แต่ละชนิดมีข้อบ่งใช้แตกต่างกัน",
    detail: "ยาแก้แพ้มีหลายประเภท",
    warning: "ยาแก้แพ้บางชนิดอาจทำให้ง่วงซึม",
    product: "ยังไม่ได้ระบุยี่ห้อและความแรงของผลิตภัณฑ์",
    status: "ข้อมูลผลิตภัณฑ์ยังไม่ได้รับการยืนยัน"
  },
  cough: {
    name: "ยาแก้ไอ (Cough Medicine)",
    ingredient: "ยังไม่ระบุตัวยาสำคัญ",
    use: "ผลิตภัณฑ์แต่ละประเภทมีข้อบ่งใช้แตกต่างกัน",
    detail: "ข้อมูลทั่วไปเกี่ยวกับผลิตภัณฑ์ยาแก้ไอ",
    warning: "ต้องตรวจสอบตัวยาสำคัญและคำเตือน",
    product: "ยังไม่ได้ระบุยี่ห้อและความแรงของผลิตภัณฑ์",
    status: "ข้อมูลผลิตภัณฑ์ยังไม่ได้รับการยืนยัน"
  }
};

const medicineForm = document.getElementById("medicineForm");
const medicineSelect = document.getElementById("medicine");

const medicineInfo = document.getElementById("medicineInfo");
const medicineInfoTitle = document.getElementById("medicineInfoTitle");
const medicineInfoDescription = document.getElementById("medicineInfoDescription");
const medicineInfoStatus = document.getElementById("medicineInfoStatus");
const medicineInfoDetails = document.getElementById("medicineInfoDetails");

const message = document.getElementById("message");
const submitButton = document.getElementById("submitBtn");

const formView = document.getElementById("formView");
const successView = document.getElementById("successView");
const backButton = document.getElementById("backButton");
const registrationView = document.getElementById("registrationView");
const registrationForm = document.getElementById("registrationForm");
const registrationName = document.getElementById("registrationName");
const registrationStudentId = document.getElementById("registrationStudentId");
const registrationSubmitButton = document.getElementById("registrationSubmitButton");
const loginButton = document.getElementById("loginButton");
const registrationMessage = document.getElementById("registrationMessage");
const signOutButton = document.getElementById("signOutButton");

const MEMBER_STORAGE_KEY = "medicineBoxMember";

// เก็บรหัสเดิมไว้เมื่อส่งข้อมูลแล้วเครือข่ายขัดข้อง
let currentSubmissionId = null;

function normalizeStudentId(studentId) {
  return String(studentId || "").replace(/[\s\u200B-\u200D\uFEFF-]/g, "");
}

function isValidStudentId(studentId) {
  return /^\d{5,15}$/.test(normalizeStudentId(studentId));
}

async function postAction(action, data = {}) {
  const formData = new URLSearchParams();
  formData.append("action", action);

  Object.entries(data).forEach(function ([key, value]) {
    formData.append(key, value);
  });

  const response = await fetch(SCRIPT_URL, {
    method: "POST",
    mode: "cors",
    redirect: "follow",
    body: formData
  });

  if (!response.ok) {
    throw new Error("เซิร์ฟเวอร์ไม่สามารถรับข้อมูลได้");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "ไม่สามารถดำเนินการได้");
  }

  return result;
}

function showRegistrationMessage(text, type) {
  registrationMessage.textContent = text;
  registrationMessage.className = "message " + type;
}

function showRegistrationView() {
  registrationView.hidden = false;
  formView.hidden = true;
  successView.hidden = true;
  signOutButton.hidden = true;
}

function showRequestView(member) {
  document.getElementById("studentId").value = member.studentId;
  document.getElementById("name").value = member.name;

  registrationView.hidden = true;
  formView.hidden = false;
  successView.hidden = true;
  signOutButton.hidden = false;
}

function saveMemberSession(member) {
  localStorage.setItem(MEMBER_STORAGE_KEY, JSON.stringify({
    name: member.name,
    studentId: member.studentId
  }));
}

async function registerMember(name, studentId) {
  const cleanName = String(name || "").trim();
  const cleanStudentId = normalizeStudentId(studentId);

  if (!cleanName) {
    throw new Error("กรุณากรอกชื่อ-นามสกุล");
  }

  if (!isValidStudentId(cleanStudentId)) {
    throw new Error("รหัสนักศึกษาต้องเป็นตัวเลข 5-15 หลัก");
  }

  const result = await postAction("register", {
    name: cleanName,
    studentId: cleanStudentId
  });

  const member = result.member || {
    name: cleanName,
    studentId: cleanStudentId
  };

  saveMemberSession(member);
  showRequestView(member);
}

async function loginMember(name, studentId) {
  const cleanName = String(name || "").trim();
  const cleanStudentId = normalizeStudentId(studentId);

  if (!cleanName) {
    throw new Error("กรุณากรอกชื่อ-นามสกุล");
  }

  if (!isValidStudentId(cleanStudentId)) {
    throw new Error("รหัสนักศึกษาต้องเป็นตัวเลข 5-15 หลัก");
  }

  const result = await postAction("member", { studentId: cleanStudentId });
  const member = result.member;

  if (!member || member.name !== cleanName || member.studentId !== cleanStudentId) {
    throw new Error("ชื่อ-นามสกุลหรือรหัสนักศึกษาไม่ตรงกับข้อมูลสมาชิก");
  }

  saveMemberSession(member);
  showRequestView(member);
}

async function restoreMemberSession() {
  const stored = localStorage.getItem(MEMBER_STORAGE_KEY);

  if (!stored) {
    showRegistrationView();
    return;
  }

  try {
    const member = JSON.parse(stored);

    if (!member || !isValidStudentId(member.studentId)) {
      throw new Error("ข้อมูลสมาชิกไม่ถูกต้อง");
    }

    const result = await postAction("member", { studentId: member.studentId });
    const verifiedMember = result.member;

    if (!verifiedMember || !verifiedMember.name || !isValidStudentId(verifiedMember.studentId)) {
      throw new Error("ไม่พบข้อมูลสมาชิก");
    }

    saveMemberSession(verifiedMember);
    showRequestView(verifiedMember);
  } catch (error) {
    showRegistrationView();

    if (error instanceof TypeError || /fetch|network/i.test(String(error.message || ""))) {
      showRegistrationMessage("ไม่สามารถเชื่อมต่อระบบได้ โปรดลองใหม่เมื่อมีอินเทอร์เน็ต", "warning");
      return;
    }

    localStorage.removeItem(MEMBER_STORAGE_KEY);
    showRegistrationMessage("กรุณาสมัครใช้งานก่อนลงทะเบียนรับยา", "warning");
  }
}

function signOut() {
  localStorage.removeItem(MEMBER_STORAGE_KEY);
  registrationForm.reset();
  showRegistrationMessage("", "");
  showRegistrationView();
}

registrationForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (registrationSubmitButton.disabled) return;

  registrationSubmitButton.disabled = true;
  registrationSubmitButton.textContent = "กำลังสมัคร...";
  showRegistrationMessage("กำลังบันทึกข้อมูลสมาชิก...", "warning");

  try {
    await registerMember(registrationName.value, registrationStudentId.value);
    showRegistrationMessage("", "");
  } catch (error) {
    showRegistrationMessage(error.message || "ไม่สามารถสมัครได้", "error");
  } finally {
    registrationSubmitButton.disabled = false;
    registrationSubmitButton.textContent = "สมัครและเข้าสู่ระบบ";
  }
});

signOutButton.addEventListener("click", signOut);

medicineForm.addEventListener("input", function () {
  currentSubmissionId = null;
});

medicineForm.addEventListener("change", function () {
  currentSubmissionId = null;
});

loginButton.addEventListener("click", async function () {
  if (loginButton.disabled) return;

  loginButton.disabled = true;
  showRegistrationMessage("กำลังตรวจสอบข้อมูลสมาชิก...", "warning");

  try {
    await loginMember(registrationName.value, registrationStudentId.value);
    showRegistrationMessage("", "");
  } catch (error) {
    showRegistrationMessage(error.message || "ไม่สามารถเข้าสู่ระบบได้", "error");
  } finally {
    loginButton.disabled = false;
  }
});

// ==========================================
// แสดงรายละเอียดผลิตภัณฑ์
// ==========================================

medicineSelect.addEventListener("change", function () {
  const selectedMedicine = this.value;

  if (!selectedMedicine || !medicineData[selectedMedicine]) {
    medicineInfo.hidden = true;
    medicineInfoDetails.replaceChildren();
    return;
  }

  const medicine = medicineData[selectedMedicine];

  medicineInfo.hidden = false;
  medicineInfoTitle.textContent = medicine.name;
  medicineInfoDescription.textContent = medicine.detail;
  medicineInfoStatus.textContent = medicine.status;

  medicineInfoDetails.replaceChildren();

  [
    ["ตัวยาสำคัญ", medicine.ingredient],
    ["ข้อมูลทั่วไป", medicine.use],
    ["ข้อมูลผลิตภัณฑ์", medicine.product],
    ["คำเตือน", medicine.warning]
  ].forEach(function (item) {
    const row = document.createElement("div");
    row.className = "medicine-detail-row";

    const label = document.createElement("strong");
    label.textContent = item[0];

    const value = document.createElement("p");
    value.textContent = item[1];

    row.append(label, value);
    medicineInfoDetails.appendChild(row);
  });
});

// ==========================================
// ส่งคำขอและรับผลอัตโนมัติ
// ==========================================

medicineForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (submitButton.disabled) return;

  const studentId =
    document.getElementById("studentId").value.trim();

  const studentName =
    document.getElementById("name").value.trim();

  const studentRoom =
    document.getElementById("room").value.trim();

  const selectedMedicine = medicineSelect.value;

  const symptom =
    document.getElementById("symptom").value.trim();

  if (!studentId || !studentName || !studentRoom ||
      !selectedMedicine || !symptom) {
    showMessage("กรุณากรอกข้อมูลให้ครบทุกช่อง", "error");
    return;
  }

  if (!isValidStudentId(studentId)) {
    showMessage("รหัสนักศึกษาต้องเป็นตัวเลข 5-15 หลัก", "error");
    return;
  }

  if (!medicineData[selectedMedicine]) {
    showMessage("ไม่พบชนิดยาที่เลือก", "error");
    return;
  }

  if (!currentSubmissionId) {
    currentSubmissionId =
      window.crypto && crypto.randomUUID
        ? crypto.randomUUID()
        : "MB-" + Date.now() + "-" +
          Math.random().toString(36).slice(2);
  }

  submitButton.disabled = true;
  submitButton.textContent = "กำลังตรวจสอบ...";
  showMessage(
    "ระบบกำลังตรวจสอบเงื่อนไข กรุณารอสักครู่...",
    "warning"
  );

  try {
    const result = await postAction("saveRequest", {
      submissionId: currentSubmissionId,
      studentId: studentId,
      name: studentName,
      room: studentRoom,
      medicine: selectedMedicine,
      symptom: symptom
    });

    currentSubmissionId = null;

    showSuccessPage({
      requestId: result.requestId,
      remaining: result.remaining,
      message: result.message,
      name: studentName,
      room: studentRoom,
      medicine: selectedMedicine,
      symptom: symptom
    });

  } catch (error) {
    console.error("MEDICINE BOX ERROR:", error);

    showMessage(
      error.message || "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง",
      "error"
    );

  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "ส่งคำขอให้เจ้าหน้าที่ตรวจสอบ";
  }
});

// ==========================================
// แสดงหน้าสำเร็จ
// ==========================================

function showSuccessPage(data) {
  const selectedMedicine = medicineData[data.medicine];

  document.getElementById("successRequestId").textContent =
    data.requestId || "-";

  document.getElementById("successName").textContent =
    data.name;

  document.getElementById("successRoom").textContent =
    data.room;

  document.getElementById("successMedicine").textContent =
    selectedMedicine ? selectedMedicine.name : data.medicine;

  document.getElementById("successSymptom").textContent =
    data.symptom;

  const remainingElement =
    document.getElementById("successRemaining");

  document.getElementById("successServerMessage").textContent =
    data.message || "ไม่พบสถานะจากระบบ";

  if (remainingElement) {
    remainingElement.textContent =
      data.remaining + " รายการ";
  }

  formView.hidden = true;
  successView.hidden = false;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// ==========================================
// กลับหน้าหลัก
// ==========================================

backButton.addEventListener("click", function () {
  medicineForm.reset();

  medicineInfo.hidden = true;
  medicineInfoDetails.replaceChildren();

  message.textContent = "";
  message.className = "message";

  successView.hidden = true;
  formView.hidden = false;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

// ==========================================
// แสดงข้อความ
// ==========================================

function showMessage(text, type) {
  message.textContent = text;
  message.className = "message " + type;
}

window.MedicineBox = {
  registerMember,
  loginMember,
  restoreMemberSession,
  signOut
};

restoreMemberSession();
