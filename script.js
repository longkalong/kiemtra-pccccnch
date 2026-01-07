document.addEventListener('DOMContentLoaded', function() {
    const nhapThongtinDiv = document.getElementById('nhapThongtin');
    const boDeRandomDiv = document.getElementById('boDeRandom');
    const questionContainer = document.getElementById('question-container');
    const startBtn = document.getElementById('start-btn');
    const submitBtn = document.getElementById('submit-btn');
    const confirmationMessageDiv = document.getElementById('confirmation-message');
    const confirmationText = document.getElementById('confirmation-text');
    const confirmSubmitBtn = document.getElementById('confirm-submit');
    const thankYouMessageDiv = document.getElementById('thank-you-message');
    const resumeBtn = document.getElementById('resume-btn');
    const timerContainer = document.getElementById('timer-container');
    const timerDisplay = document.getElementById('timer-display');

    // ==========================================
    // CẤU HÌNH HỆ THỐNG
    // ==========================================
    const CONFIG = {
        thoiGianLamBaiPhut: 15, 
        soLuongCauHoi: 15,
        danhSachFileJson: [
            './boCauHoi json/CTCC.B1.ChayHoaChat.json',
            './boCauHoi json/KTCN.III.SCC.json',
            './boCauHoi json/kyThuatCaNhan.json',
            './boCauHoi json/thongTu372025.json'
        ],
        scriptURL: 'https://script.google.com/macros/s/AKfycbzPp65ktWnD3IcGQl1_o6XJUDs9DQy_AX0vk8C1CrUDCgR0Rp8rJ3bp9A2uBwA6ByJ0/exec',
        cauKhichLe: [
            "Cố lên, bạn đang làm rất tốt! 💪",
            "Sắp hoàn thành rồi, kiên trì nhé! ✨",
            "Tuyệt vời! Tiếp tục phát huy nào! 🚀",
            "Bình tĩnh và tự tin nhé! 🍀",
            "Mọi nỗ lực sẽ được đền đáp! 🌟",
            "Bạn đang đi đúng hướng rồi đấy! 🎯",
            "Tập trung cao độ nào! 🔥",
            "Bạn thông minh hơn bạn nghĩ đấy! 🧠"
        ]
    };

    let timeLeft = CONFIG.thoiGianLamBaiPhut * 60; 
    let allQuestions = []; 
    let currentQuestions = []; 
    let timerInterval;

    const noteSpan = document.querySelector('.btn-note');
    if (noteSpan) noteSpan.textContent = `(Bạn có ${CONFIG.thoiGianLamBaiPhut} phút để làm bài)`;

    async function loadAllData() {
        try {
            const promises = CONFIG.danhSachFileJson.map(file => fetch(file).then(res => res.json()));
            const results = await Promise.all(promises);
            allQuestions = results.flat();
        } catch (error) { console.error("Lỗi tải dữ liệu:", error); }
    }
    loadAllData();

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    const statsDiv = document.createElement('div');
    statsDiv.id = 'live-stats';
    statsDiv.style.cssText = "margin-top:10px; padding:10px; background:rgba(255,255,255,0.2); border-radius:5px; font-size:0.85em;";
    statsDiv.innerHTML = `
        <div id="stat-progress">Đã trả lời: 0/${CONFIG.soLuongCauHoi}</div>
        <div id="encouragement-msg" style="margin-top:5px; font-style:italic; color:#fff; font-weight:normal;">Chúc bạn thi tốt!</div>
    `;
    timerContainer.appendChild(statsDiv);

    function updateLiveStats() {
        const answered = document.querySelectorAll('input[type="radio"]:checked').length;
        document.getElementById('stat-progress').textContent = `Đã trả lời: ${answered}/${currentQuestions.length}`;
        
        const msgDiv = document.getElementById('encouragement-msg');
        const randomMsg = CONFIG.cauKhichLe[Math.floor(Math.random() * CONFIG.cauKhichLe.length)];
        msgDiv.textContent = randomMsg;
    }

    function generateQuestions() {
        const validQuestions = allQuestions.filter(q => q.cauHoi && Array.isArray(q.luaChon));
        currentQuestions = shuffle([...validQuestions]).slice(0, CONFIG.soLuongCauHoi);
        questionContainer.innerHTML = '';
        currentQuestions.forEach((q, index) => {
            const qDiv = document.createElement('div');
            qDiv.className = 'question';
            qDiv.id = `q-block-${q.ID}`;
            qDiv.style.cssText = "margin-bottom:25px; padding:15px; background:#f9f9f9; border-radius:8px; border: 1px solid #ddd;";
            qDiv.innerHTML = `
                <p style="font-weight: bold; font-size: 1.1em;">Câu ${index + 1}: ${q.cauHoi}</p>
                <ul class="choices" id="choices-${q.ID}" style="list-style: none; padding: 0;">
                    ${q.luaChon.map((choice, i) => `
                        <li id="li-${q.ID}-${i + 1}" 
                            onclick="handleSelect('${q.ID}', ${i + 1})"
                            style="padding:12px; margin:8px 0; border:1px solid #ccc; border-radius:6px; cursor:pointer; background:#fff; transition: background 0.2s;">
                            <label style="display:flex; align-items:center; cursor:pointer; width:100%; margin:0;">
                                <input type="radio" name="radio-${q.ID}" value="${i + 1}" style="margin-right:12px; transform: scale(1.2);" onclick="event.stopPropagation(); handleSelect('${q.ID}', ${i + 1});">
                                <span>${choice}</span>
                            </label>
                        </li>
                    `).join('')}
                </ul>
            `;
            questionContainer.appendChild(qDiv);
        });
        updateLiveStats();
    }

    window.handleSelect = function(questionID, choiceIndex) {
        const choicesUl = document.getElementById(`choices-${questionID}`);
        if (choicesUl.classList.contains('finalized')) return;

        const radio = document.querySelector(`input[name="radio-${questionID}"][value="${choiceIndex}"]`);
        if (radio) radio.checked = true;

        choicesUl.querySelectorAll('li').forEach(li => {
            li.style.background = "#fff";
            li.style.borderColor = "#ccc";
        });

        const selectedLi = document.getElementById(`li-${questionID}-${choiceIndex}`);
        selectedLi.style.background = "#e3f2fd";
        selectedLi.style.borderColor = "#2196f3";

        updateLiveStats();
    };

    startBtn.addEventListener('click', function() {
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const donvi = document.getElementById('donvi').value;
        if (!name || !phone || !donvi) { alert("Vui lòng nhập đủ thông tin!"); return; }
        nhapThongtinDiv.style.display = 'none';
        boDeRandomDiv.style.display = 'block';
        timerContainer.style.display = 'block';
        generateQuestions();
        startTimer();
    });

    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            const mins = Math.floor(timeLeft/60), secs = timeLeft%60;
            timerDisplay.textContent = `${mins}:${secs<10?'0':''}${secs}`;
            if (timeLeft <= 0) { clearInterval(timerInterval); submitQuiz(true); }
        }, 1000);
    }

    submitBtn.addEventListener('click', function() {
        const answeredCount = document.querySelectorAll('input[type="radio"]:checked').length;
        confirmationText.innerHTML = `Bạn đã hoàn thành: ${answeredCount}/${currentQuestions.length} câu. Bạn có chắc chắn muốn nộp bài?`;
        confirmationMessageDiv.style.display = 'block';
        boDeRandomDiv.style.display = 'none';
        // Đảm bảo nút làm bài tiếp luôn hiển thị khi mở hộp thoại xác nhận thủ công
        resumeBtn.style.display = 'inline-block';
    });

    resumeBtn.addEventListener('click', () => { 
        confirmationMessageDiv.style.display = 'none'; 
        boDeRandomDiv.style.display = 'block'; 
    });

    confirmSubmitBtn.addEventListener('click', () => submitQuiz());

    function applyFinalColors() {
        let correctCount = 0;
        let detailsArray = [];
        let answeredCount = 0;

        currentQuestions.forEach(q => {
            const selected = document.querySelector(`input[name="radio-${q.ID}"]:checked`);
            const val = selected ? parseInt(selected.value) : 0;
            const choicesUl = document.getElementById(`choices-${q.ID}`);
            const qBlock = document.getElementById(`q-block-${q.ID}`);
            
            choicesUl.classList.add('finalized');
            choicesUl.style.pointerEvents = 'none';

            choicesUl.querySelectorAll('li').forEach(li => li.style.background = "#fff");

            if (val === 0) {
                qBlock.style.background = "#fff9c4"; 
            } else {
                answeredCount++;
                const selectedLi = document.getElementById(`li-${q.ID}-${val}`);
                const correctLi = document.getElementById(`li-${q.ID}-${q.dapan}`);

                if (val === q.dapan) {
                    correctCount++;
                    selectedLi.style.background = "#c8e6c9";
                    selectedLi.style.borderColor = "#2e7d32";
                } else {
                    selectedLi.style.background = "#ffcdd2";
                    selectedLi.style.borderColor = "#c62828";
                    
                    if (correctLi) {
                        correctLi.style.background = "#c8e6c9";
                        correctLi.style.borderColor = "#2e7d32";
                        correctLi.style.fontWeight = "bold";
                    }
                }
            }
            detailsArray.push(q.ID, val, q.dapan);
        });

        return { correctCount, answeredCount, detailsArray };
    }

    async function submitQuiz(isAuto = false) {
        clearInterval(timerInterval);
        confirmationMessageDiv.style.display = 'block';
        boDeRandomDiv.style.display = 'none';
        
        // VÔ HIỆU HÓA CÁC NÚT ĐIỀU KHIỂN KHI ĐANG NỘP
        confirmSubmitBtn.disabled = true;
        resumeBtn.style.display = 'none'; // Ẩn nút "Làm bài tiếp"
        
        confirmationText.innerHTML = isAuto ? "HẾT GIỜ! Hệ thống đang nộp bài..." : "Đang xử lý nộp bài...";

        const resultsData = applyFinalColors();
        const total = currentQuestions.length;
        const grade = ((resultsData.correctCount / total) * 10).toFixed(2);

        const data = {
            name: document.getElementById('name').value,
            phone: "'" + document.getElementById('phone').value,
            donvi: document.getElementById('donvi').value,
            correct_answers: resultsData.correctCount,
            score: `${resultsData.correctCount}/${total}`,
            grade: grade,
            details_array: JSON.stringify(resultsData.detailsArray)
        };

        try {
            await fetch(CONFIG.scriptURL, { 
                method: 'POST', 
                mode: 'no-cors', 
                body: new URLSearchParams(data) 
            });

            boDeRandomDiv.style.display = 'block';
            confirmationMessageDiv.style.display = 'none';
            submitBtn.style.display = 'none';
            timerContainer.style.display = 'none';

            thankYouMessageDiv.innerHTML = `
                <div style="background: #fff; padding: 25px; border-radius: 12px; margin-top: 30px; border: 4px solid #2e7d32; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <h2 style="color: #2e7d32; text-align: center; margin-top:0;">KẾT QUẢ BÀI LÀM</h2>
                    <p><strong>Thí sinh:</strong> ${data.name}</p>
                    <p><strong>SĐT:</strong> ${document.getElementById('phone').value}</p>
                    <p><strong>Đơn vị:</strong> ${data.donvi}</p>
                    <hr>
                    <p><strong>Số câu đúng:</strong> <span style="color: green; font-weight: bold; font-size: 1.2em;">${resultsData.correctCount}</span> / ${total}</p>
                    <p><strong>Điểm số:</strong> <span style="font-size: 2.5em; color: #d32f2f; font-weight: bold;">${grade}</span></p>
                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="location.reload()" style="padding: 12px 30px; cursor: pointer; background: #2e7d32; color: white; border: none; border-radius: 5px; font-weight: bold;">Thoát & Làm bài mới</button>
                    </div>
                </div>
            `;
            thankYouMessageDiv.style.display = 'block';
            
            setTimeout(() => {
                thankYouMessageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);

        } catch (e) { 
            alert("Lỗi kết nối khi nộp bài!"); 
            confirmSubmitBtn.disabled = false;
            resumeBtn.style.display = 'inline-block'; // Hiện lại nếu lỗi để người dùng xử lý
        }
    }
});