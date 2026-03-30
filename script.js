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
        thoiGianLamBaiPhut: 20, 
        soLuongCauHoi: 20,
        danhSachFileJson: [
            '/boCauHoi json/CTCC.CCOTO.json',
            // '/boCauHoi json/KTCN.III.SCC.json',
            '/boCauHoi json/kyThuatCaNhan.json',
            // '/boCauHoi json/mayCuaCamTayStihlTs420.json',
            '/boCauHoi json/thongTu372025.json'
            
            // './boCauHoi json/KTCN.III.SCC.json',
            // './boCauHoi json/kyThuatCaNhan.json',
            // './boCauHoi json/thongTu372025.json',
            // './boCauHoi json/test_hinhanh.json'

        ],
        scriptURL: 'https://script.google.com/macros/s/AKfycbyF2ftPJS84Yz2aG-l2ut_HbAi1YAkdbtpefUC31S59G53cm2iXjnKkB5ns5SIgVn8H/exec',
        cauKhichLe: [
            "Cố lên, bạn đang làm rất tốt! 💪",
            "Sắp hoàn thành rồi, kiên trì nhé! ✨",
            "Tuyệt vời! Tiếp tục phát huy nào! 🚀",
            "Bình tĩnh và tự tin nhé! 🍀",
            "Mọi nỗ lực sẽ được đền đáp! 🌟",
            "Đừng bỏ cuộc, thành công đang đợi! 🏆"
        ]
    };

    let timeLeft = CONFIG.thoiGianLamBaiPhut * 60; 
    let allQuestions = []; 
    let currentQuestions = []; 
    let timerInterval;

    // KHÔI PHỤC DÒNG THÔNG BÁO CỦA BẠN
    const noteSpan = document.querySelector('.btn-note');
    if (noteSpan) {
        noteSpan.textContent = `(Bộ đề gồm ${CONFIG.soLuongCauHoi} câu hỏi. Đồng chí có ${CONFIG.thoiGianLamBaiPhut} phút để làm bài. Hết thời gian hệ thống sẽ tự động nộp bài.)`;
    }

    // Khởi tạo vùng hiển thị thống kê và khích lệ
    const statsDiv = document.createElement('div');
    statsDiv.id = 'live-stats';
    statsDiv.style.cssText = "margin-top:10px; padding:10px; background:rgba(255,255,255,0.2); border-radius:5px; font-size:0.85em; border-top: 1px solid rgba(255,255,255,0.3);";
    statsDiv.innerHTML = `
        <div id="stat-progress">Đã trả lời: 0/${CONFIG.soLuongCauHoi}</div>
        <div id="encouragement-msg" style="margin-top:5px; font-style:italic; color:#fff; font-weight: normal;">Chúc đồng chí thi tốt!</div>
    `;
    timerContainer.appendChild(statsDiv);

    async function loadAllData() {
        try {
            const promises = CONFIG.danhSachFileJson.map(file => 
                fetch(file).then(res => {
                    if (!res.ok) throw new Error(`Không thể tải file: ${file}`);
                    return res.json();
                })
            );
            
            const results = await Promise.all(promises);
            
            // Gộp tất cả các mảng từ các file JSON vào allQuestions
            allQuestions = results.flat();

            // IN TỔNG SỐ CÂU HỎI TRONG NGÂN HÀNG RA CONSOLE
            console.log("--- THỐNG KÊ NGÂN HÀNG CÂU HỎI ---");
            console.log(`Tổng số file JSON đã nạp: ${CONFIG.danhSachFileJson.length}`);
            console.log(`Tổng số câu hỏi có trong ngân hàng: ${allQuestions.length}`);
            console.log("---------------------------------");

        } catch (error) {
            console.error("Lỗi khi tải dữ liệu câu hỏi:", error);
            alert("Không thể nạp dữ liệu câu hỏi. Vui lòng kiểm tra file JSON.");
        }
    }
    loadAllData();

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function updateLiveStats() {
        const answered = document.querySelectorAll('input[type="radio"]:checked').length;
        document.getElementById('stat-progress').textContent = `Đã trả lời: ${answered}/${currentQuestions.length}`;
        
        // Hiển thị câu khích lệ ngẫu nhiên
        const msgElement = document.getElementById('encouragement-msg');
        const randomMsg = CONFIG.cauKhichLe[Math.floor(Math.random() * CONFIG.cauKhichLe.length)];
        msgElement.textContent = randomMsg;
    }

    function generateQuestions() {
        const validQuestions = allQuestions.filter(q => q.cauHoi && Array.isArray(q.luaChon));
        currentQuestions = shuffle([...validQuestions]).slice(0, CONFIG.soLuongCauHoi);
        questionContainer.innerHTML = '';
        currentQuestions.forEach((q, index) => {
            const qDiv = document.createElement('div');
            qDiv.className = 'question w-[420px] md:w-80/100 p-2 mx-auto my-2';
            qDiv.id = `q-block-${q.ID}`;
            // TRẠNG THÁI LÚC LÀM BÀI: Màu bình thường
            qDiv.style.cssText = "margin-bottom:25px; padding:15px; background:#f9f9f9; border-radius:8px; border: 1px solid #ddd; transition: all 0.3s ease;";

            let imageTag = "";
            if (q.hinhAnh && q.hinhAnh.trim() !== "") {
            imageTag = `<div style="text-align:center; margin:10px 0;">
                    <img src="${q.hinhAnh}" alt="Hình minh họa" style="max-width:100%; height:auto; border-radius:5px; border:1px solid #ccc;">
                </div>`;
            }

            qDiv.innerHTML = `
                <p style="font-weight: bold;">Câu ${index + 1}: ${q.cauHoi}</p>
    ${imageTag} 
    <ul class="choices" id="choices-${q.ID}" style="list-style: none; padding: 0;">
                    ${q.luaChon.map((choice, i) => {

                        const textContent = typeof choice === 'object' ? choice.text : choice;
                        const imgHtml = (typeof choice === 'object' && choice.img) 
                            ? `<img src="${choice.img}" style="display:block; max-width:150px; margin-top:5px; border-radius:4px;">` 
                            : '';

                        return `
                            <li id="li-${q.ID}-${i + 1}" 
                                onclick="handleSelect('${q.ID}', ${i + 1})"
                                style="padding:10px; margin:5px 0; border:1px solid #ccc; border-radius:4px; cursor:pointer; background:#fff;">
                                <label style="display:flex; align-items:flex-start; cursor:pointer; width:100%;">
                                    <input type="radio" name="radio-${q.ID}" value="${i + 1}" style="margin-right:10px; margin-top:5px;" onclick="event.stopPropagation(); handleSelect('${q.ID}', ${i + 1});">
                                    <div>
                                        <span>${textContent}</span>
                                        ${imgHtml}
                                    </div>
                                </label>
                            </li>
                        `;
                    }).join('')}        
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
        choicesUl.querySelectorAll('li').forEach(li => li.style.background = "#fff");
        const selectedLi = document.getElementById(`li-${questionID}-${choiceIndex}`);
        selectedLi.style.background = "#e3f2fd";
        updateLiveStats();
    };

    startBtn.addEventListener('click', function() {
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const chucvu = document.getElementById('chucvu').value;
        const donvi = document.getElementById('donvi').value;

        if (!name || !phone || !donvi || !chucvu) { 
            alert("Vui lòng nhập đầy đủ thông tin!"); 
            return; 
        }
        
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
        confirmationText.innerHTML = `Đồng chí đã hoàn thành: ${answeredCount}/${currentQuestions.length} câu. Đồng chí có chắc chắn muốn nộp bài?`;
        confirmationMessageDiv.style.display = 'block';
        boDeRandomDiv.style.display = 'none';
        resumeBtn.style.display = 'inline-block';
        confirmSubmitBtn.disabled = false;
        confirmSubmitBtn.textContent = "Xác nhận nộp bài";
    });

    resumeBtn.addEventListener('click', () => { 
        confirmationMessageDiv.style.display = 'none'; 
        boDeRandomDiv.style.display = 'block'; 
    });

    async function submitQuiz(isAuto = false) {
        clearInterval(timerInterval);
        confirmationMessageDiv.style.display = 'block';
        boDeRandomDiv.style.display = 'none';
        
        confirmSubmitBtn.disabled = true;
        confirmSubmitBtn.textContent = "Đang gửi...";
        resumeBtn.style.display = 'none'; 
        
        confirmationText.innerHTML = isAuto ? "HẾT GIỜ! Hệ thống đang nộp bài..." : "Đang xử lý nộp bài...";

        let correctCount = 0;
        let detailsArray = [];
        currentQuestions.forEach(q => {
            const selected = document.querySelector(`input[name="radio-${q.ID}"]:checked`);
            const val = selected ? parseInt(selected.value) : 0;
            if (val === q.dapan) correctCount++;
            detailsArray.push(q.ID, val, q.dapan);
            
            const choicesUl = document.getElementById(`choices-${q.ID}`);
            choicesUl.classList.add('finalized');
            const correctLi = document.getElementById(`li-${q.ID}-${q.dapan}`);
            const qBlock = document.getElementById(`q-block-${q.ID}`);
            
            // TRẠNG THÁI SAU KHI NỘP BÀI:
            if (val === 0) {
                // NẾU CHƯA TRẢ LỜI: Hiện màu vàng cảnh báo
                qBlock.style.background = "#fff9c4";
                qBlock.style.borderColor = "#fbc02d";
            } else {
                qBlock.style.background = "#f9f9f9"; 
                qBlock.style.borderColor = "#ddd";
            }

            if (correctLi) correctLi.style.background = "#c8e6c9";
            if (val !== 0 && val !== q.dapan) {
                const wrongLi = document.getElementById(`li-${q.ID}-${val}`);
                if (wrongLi) wrongLi.style.background = "#ffcdd2";
            }
        });

        const total = currentQuestions.length;
        const grade = ((correctCount / total) * 10).toFixed(2);

        const data = {
            name: document.getElementById('name').value,
            cccd: "'" + document.getElementById('cccd').value,
            ngaycap: "'" + document.getElementById('ngaycap').value,
            phone: "'" + document.getElementById('phone').value,
            chucvu: document.getElementById('chucvu').value,
            donvi: document.getElementById('donvi').value,
            correct_answers: correctCount,
            score: `${correctCount}/${total}`,
            grade: grade,
            details_array: JSON.stringify(detailsArray)
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
                <div style="background: #fff; padding: 25px; border-radius: 12px; margin-top: 30px; border: 4px solid #2e7d32; box-shadow: 0 10px 20px rgba(0,0,0,0.1);">
                    <h2 style="color: #2e7d32; text-align: center; margin-top:0;">KẾT QUẢ BÀI LÀM</h2>
                    <p><strong>Thí sinh:</strong> ${data.name}</p>
                    <p><strong>Chức vụ:</strong> ${data.chucvu}</p>
                    <p><strong>Đơn vị:</strong> ${data.donvi}</p>
                    <hr>
                    <p><strong>Số câu đúng:</strong> <span style="color: green; font-weight: bold; font-size: 1.2em;">${correctCount}</span> / ${total}</p>
                    <p><strong>Điểm số:</strong> <span style="font-size: 2.5em; color: #d32f2f; font-weight: bold;">${grade}</span></p>
                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="location.reload()" style="padding: 12px 30px; cursor: pointer; background: #2e7d32; color: white; border: none; border-radius: 5px; font-weight: bold;">Thoát & Làm bài mới</button>
                    </div>
                </div>
            `;
            thankYouMessageDiv.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (e) { 
            alert("Lỗi kết nối khi nộp bài!"); 
            confirmSubmitBtn.disabled = false;
            confirmSubmitBtn.textContent = "Thử nộp lại";
            resumeBtn.style.display = 'inline-block';
        }
    }

    confirmSubmitBtn.addEventListener('click', () => submitQuiz());
    window.forceSubmitQuiz = function() {
        submitQuiz(true); 
    };
});
