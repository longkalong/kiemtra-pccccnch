/* script.js - Bản nâng cấp v2 cho Hệ thống Kiểm tra PCCC & CNCH */

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
    const emergencyStrip = document.getElementById('emergency-strip');

    // Slide navigation buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    // ==========================================
    // CẤU HÌNH HỆ THỐNG
    // ==========================================
    const CONFIG = {
        thoiGianLamBaiPhut: 20, 
        soLuongCauHoi: 20,
        danhSachFileJson: [
            '/boCauHoi json/thongTu372025.json',
            '/boCauHoi json/CTCC.ChuaChayRung.json',
            '/boCauHoi json/KTCN.III.SCC.json'
            // '/boCauHoi json/CTCC.B7.NhaCaoTang.json',
            // '/boCauHoi json/CTCC.CNCHDuoiNuoc.json'
        ],
        scriptURL: 'https://script.google.com/macros/s/AKfycbyIjWx_nRjepq4BY_NxPWCHqTI2vaYzEVU1J5w9CF5Kqajth6EcunghuNqXdZ6V61fA/exec',
        cauKhichLe: [
            "Cố lên, đồng chí đang làm rất tốt! 💪",
            "Sắp hoàn thành rồi, kiên trì nhé! ✨",
            "Tuyệt vời! Tiếp tục phát huy nào! 🚀",
            "Bình tĩnh và tự tin nhé! 🍀",
            "Mọi nỗ lực sẽ được đền đáp! 🌟",
            "Đừng bỏ cuộc, thành công đang đợi! 🏆"
        ]
    };

    // ==========================================
    // KHỞI TẠO BIẾN TRẠNG THÁI
    // ==========================================
    let timeLeft = CONFIG.thoiGianLamBaiPhut * 60; 
    let allQuestions = []; 
    let currentQuestions = []; 
    let selectedAnswers = {}; // Lưu trữ dạng: { [questionID]: choiceValue }
    let currentQuestionIndex = 0;
    let timerInterval;
    let startTime;
    let isExamStarted = false;
    let isSubmitted = false;


    // ==========================================
    // CHẾ ĐỘ SÁNG / TỐI (THEME MODE)
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    
    function applyTheme() {
        const isDark = localStorage.getItem('theme') === 'dark' || 
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        if (isDark) {
            document.documentElement.classList.add('dark');
            themeToggleLightIcon.classList.remove('hidden');
            themeToggleDarkIcon.classList.add('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            themeToggleLightIcon.classList.add('hidden');
            themeToggleDarkIcon.classList.remove('hidden');
        }
    }
    
    themeToggleBtn.addEventListener('click', function() {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        applyTheme();
    });
    
    // Áp dụng theme ngay khi tải trang
    applyTheme();

    // ==========================================
    // TẢI NGÂN HÀNG CÂU HỎI
    // ==========================================
    async function loadAllData() {
        try {
            const promises = CONFIG.danhSachFileJson.map(file => 
                fetch(file).then(res => {
                    if (!res.ok) throw new Error(`Không thể tải file: ${file}`);
                    return res.json();
                })
            );
            
            const results = await Promise.all(promises);
            allQuestions = results.flat();
            
            console.log("--- THỐNG KÊ NGÂN HÀNG CÂU HỎI ---");
            console.log(`Tổng số file JSON đã nạp: ${CONFIG.danhSachFileJson.length}`);
            console.log(`Tổng số câu hỏi có trong ngân hàng: ${allQuestions.length}`);
            console.log("---------------------------------");
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu câu hỏi:", error);
            alert("Không thể nạp dữ liệu câu hỏi. Vui lòng kiểm tra lại đường dẫn file JSON.");
        }
    }
    loadAllData();

    // Thuật toán xáo trộn Fisher-Yates
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // ==========================================
    // RENDER GIAO DIỆN LÀM BÀI
    // ==========================================
    function generateQuestions() {
        const validQuestions = allQuestions.filter(q => q.cauHoi && Array.isArray(q.luaChon));
        currentQuestions = shuffle([...validQuestions]).slice(0, CONFIG.soLuongCauHoi);
        
        currentQuestionIndex = 0;
        selectedAnswers = {};
        
        // Tạo bảng số câu hỏi điều hướng bên cạnh
        generateNavigationGrid();
        
        // Hiển thị câu hỏi đầu tiên
        renderQuestion(currentQuestionIndex);
        updateLiveStats();
    }

    function generateNavigationGrid() {
        const grid = document.getElementById('navigation-grid');
        grid.innerHTML = '';
        currentQuestions.forEach((q, index) => {
            const box = document.createElement('div');
            box.className = 'nav-box';
            box.textContent = index + 1;
            box.setAttribute('data-index', index);
            box.setAttribute('data-qid', q.ID);
            box.onclick = () => {
                currentQuestionIndex = index;
                renderQuestion(currentQuestionIndex);
            };
            grid.appendChild(box);
        });
    }

    function renderQuestion(index) {
        if (index < 0 || index >= currentQuestions.length) return;
        const q = currentQuestions[index];
        const userChoice = selectedAnswers[q.ID] || null;
        
        let imageTag = "";
        if (q.hinhAnh && q.hinhAnh.trim() !== "") {
            imageTag = `
            <div class="my-4 text-center">
                <img src="${q.hinhAnh}" alt="Hình minh họa" class="max-w-full h-auto mx-auto rounded border border-gray-300 dark:border-gray-700 shadow-sm max-h-[250px]">
            </div>`;
        }
        
        // KHÔNG TRỘN ĐÁP ÁN: Giữ nguyên thứ tự mặc định trong file JSON
        let choicesHtml = q.luaChon.map((choice, i) => {
            const textContent = typeof choice === 'object' ? choice.text : choice;
            const imgHtml = (typeof choice === 'object' && choice.img) 
                ? `<img src="${choice.img}" class="block max-w-[150px] mt-2 rounded border border-gray-200 dark:border-gray-800">` 
                : '';
            const choiceValue = i + 1;
            const isSelected = userChoice === choiceValue;
            const finalized = isSubmitted;
            
            let choiceClass = "choice-item p-4 mb-3 flex items-start cursor-pointer border rounded transition-all";
            if (isSelected) {
                choiceClass += " selected text-[var(--brand-color)] font-bold";
            }
            
            // Giao diện sau khi đã nộp bài (Phân tích Đúng/Sai)
            if (finalized) {
                const isCorrectAnswer = choiceValue === q.dapan;
                const isWrongUserAnswer = isSelected && choiceValue !== q.dapan;
                
                if (isCorrectAnswer) {
                    choiceClass += " border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 shadow-[inset_4px_0_0_0_#059669]";
                } else if (isWrongUserAnswer) {
                    choiceClass += " border-red-600 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 shadow-[inset_4px_0_0_0_#dc2626]";
                }
            }
            
            return `
                <li class="${choiceClass}" onclick="handleSelectAnswer('${q.ID}', ${choiceValue})">
                    <input type="radio" name="radio-${q.ID}" value="${choiceValue}" class="mt-1 mr-3 accent-[var(--brand-color)] cursor-pointer" ${isSelected ? 'checked' : ''} ${finalized ? 'disabled' : ''} onclick="event.stopPropagation(); handleSelectAnswer('${q.ID}', ${choiceValue});">
                    <div class="flex-grow">
                        <span class="text-sm md:text-base font-semibold leading-relaxed">${textContent}</span>
                        ${imgHtml}
                    </div>
                </li>
            `;
        }).join('');
        
        let isQuestionCorrectText = "";
        if (isSubmitted) {
            const isCorrect = userChoice === q.dapan;
            if (isCorrect) {
                isQuestionCorrectText = `<div class="p-3 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 rounded font-bold text-sm mb-4">✓ Trả lời đúng!</div>`;
            } else if (userChoice === null) {
                isQuestionCorrectText = `<div class="p-3 bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded font-bold text-sm mb-4">! Câu này đồng chí bỏ trống. Đáp án đúng là: ${String.fromCharCode(64 + q.dapan)}</div>`;
            } else {
                isQuestionCorrectText = `<div class="p-3 bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300 rounded font-bold text-sm mb-4">✗ Trả lời sai! Đáp án đúng là: ${String.fromCharCode(64 + q.dapan)}</div>`;
            }
        }
        
        questionContainer.innerHTML = `
            <div class="border rounded-lg p-5 md:p-6 bg-[var(--bg-card)] border-[var(--border-color)] transition-all shadow-sm">
                <div class="flex items-center justify-between mb-4 border-b border-[var(--border-color)] pb-3">
                    <span class="font-extrabold text-[var(--brand-color)] text-sm uppercase tracking-wider">Câu hỏi ${index + 1}</span>
                    <span class="text-xs opacity-75 font-semibold">Mã câu hỏi: #${q.ID}</span>
                </div>
                <p class="font-bold text-base md:text-lg mb-6 leading-relaxed">${q.cauHoi}</p>
                ${imageTag}
                ${isQuestionCorrectText}
                <ul class="choices list-none p-0 m-0">
                    ${choicesHtml}
                </ul>
            </div>
        `;
        
        // Đồng bộ ô số điều hướng hiện tại
        document.querySelectorAll('.nav-box').forEach(box => {
            box.classList.remove('current');
            if (parseInt(box.getAttribute('data-index')) === index) {
                box.classList.add('current');
            }
        });
        
        // Đồng bộ bộ đếm câu hiển thị
        document.getElementById('question-counter-display').textContent = `Câu ${index + 1} / ${currentQuestions.length}`;
    }

    window.handleSelectAnswer = function(questionID, choiceValue) {
        if (isSubmitted) return;
        selectedAnswers[questionID] = choiceValue;
        
        updateLiveStats();
        renderQuestion(currentQuestionIndex);
    };

    function updateLiveStats() {
        let answeredCount = 0;
        currentQuestions.forEach((q, index) => {
            const userAns = selectedAnswers[q.ID];
            const box = document.querySelector(`.nav-box[data-index="${index}"]`);
            if (box) {
                box.classList.remove('answered', 'answered-correct', 'answered-wrong');
                if (userAns !== undefined && userAns !== null) {
                    answeredCount++;
                    if (isSubmitted) {
                        if (userAns === q.dapan) {
                            box.classList.add('answered-correct');
                        } else {
                            box.classList.add('answered-wrong');
                        }
                    } else {
                        box.classList.add('answered');
                    }
                }
            }
        });
        
        document.getElementById('stat-progress').textContent = `Đã trả lời: ${answeredCount}/${currentQuestions.length}`;
        
        // Chọn câu khích lệ ngẫu nhiên
        const msgElement = document.getElementById('encouragement-msg');
        if (msgElement) {
            const randomMsg = CONFIG.cauKhichLe[Math.floor(Math.random() * CONFIG.cauKhichLe.length)];
            msgElement.textContent = randomMsg;
        }
    }

    // Điều hướng Slide qua Nút
    prevBtn.addEventListener('click', function() {
        if (currentQuestions.length === 0) return;
        // Đi lùi có vòng lặp (wrap-around)
        currentQuestionIndex = (currentQuestionIndex - 1 + currentQuestions.length) % currentQuestions.length;
        renderQuestion(currentQuestionIndex);
    });

    nextBtn.addEventListener('click', function() {
        if (currentQuestions.length === 0) return;
        // Đi tới có vòng lặp (wrap-around)
        currentQuestionIndex = (currentQuestionIndex + 1) % currentQuestions.length;
        renderQuestion(currentQuestionIndex);
    });

    // ==========================================
    // KHỞI ĐỘNG BÀI THI & BỘ ĐẾM THỜI GIAN
    // ==========================================
    startBtn.addEventListener('click', function() {
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const chucvu = document.getElementById('chucvu').value;
        const donvi = document.getElementById('donvi').value;

        if (!name || !phone || !donvi || !chucvu) { 
            alert("Vui lòng nhập đầy đủ thông tin cá nhân trước khi làm bài!"); 
            return; 
        }
        
        startTime = new Date().toLocaleString('vi-VN');
        isExamStarted = true;
        isSubmitted = false;
        
        nhapThongtinDiv.style.display = 'none';
        boDeRandomDiv.style.display = 'block';
        timerContainer.style.display = 'block';
        
        generateQuestions();
        startTimer();
    });

    function startTimer() {
        timeLeft = CONFIG.thoiGianLamBaiPhut * 60;
        timerInterval = setInterval(() => {
            timeLeft--;
            const mins = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            timerDisplay.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
            
            // Hiệu ứng dải đỏ khẩn cấp nhấp nháy Pulse khi thời gian còn dưới 3 phút
            if (timeLeft <= 180) {
                emergencyStrip.classList.add('emergency-active');
                timerDisplay.classList.add('text-red-500', 'animate-pulse');
            } else {
                emergencyStrip.classList.remove('emergency-active');
                timerDisplay.classList.remove('text-red-500', 'animate-pulse');
            }
            
            if (timeLeft <= 0) { 
                clearInterval(timerInterval); 
                submitQuiz(true); // Tự động nộp bài khi hết giờ
            }
        }, 1000);
    }



    // ==========================================
    // NỘP BÀI THI & XỬ LÝ KẾT QUẢ
    // ==========================================
    submitBtn.addEventListener('click', function() {
        const answeredCount = Object.keys(selectedAnswers).length;
        confirmationText.innerHTML = `Đồng chí đã hoàn thành: ${answeredCount}/${currentQuestions.length} câu. Đồng chí có chắc chắn muốn nộp bài?`;
        confirmationMessageDiv.style.display = 'block';
        boDeRandomDiv.style.display = 'none';
        timerContainer.style.display = 'none';
    });

    resumeBtn.addEventListener('click', () => { 
        confirmationMessageDiv.style.display = 'none'; 
        boDeRandomDiv.style.display = 'block'; 
        timerContainer.style.display = 'block';
    });

    async function submitQuiz(isAuto = false) {
        clearInterval(timerInterval);
        isExamStarted = false;
        isSubmitted = true;
        
        confirmationMessageDiv.style.display = 'none';
        boDeRandomDiv.style.display = 'none';
        timerContainer.style.display = 'none';
        emergencyStrip.classList.remove('emergency-active');

        // Mở một popup báo nộp bài tạm thời
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-overlay';
        loadingDiv.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:10000; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:1.5rem;";
        loadingDiv.textContent = isAuto ? "HẾT GIỜ! Hệ thống đang nộp bài..." : "Đang xử lý nộp bài...";
        document.body.appendChild(loadingDiv);

        let correctCount = 0;
        let detailsArray = [];
        currentQuestions.forEach(q => {
            const val = selectedAnswers[q.ID] || 0;
            if (val === q.dapan) correctCount++;
            detailsArray.push(q.ID, val, q.dapan);
        });

        const total = currentQuestions.length;
        const grade = ((correctCount / total) * 10).toFixed(2);

        // Đóng gói dữ liệu gửi về Google Sheets
        const data = {
            name: document.getElementById('name').value,
            cccd: "",
            ngaycap: "",
            phone: "'" + document.getElementById('phone').value,
            chucvu: document.getElementById('chucvu').value,
            donvi: document.getElementById('donvi').value,
            start_time: startTime,
            submit_time: new Date().toLocaleString('vi-VN'),
            correct_answers: correctCount,
            score: `${correctCount}/${total}`,
            grade: grade,
            details_array: JSON.stringify(detailsArray),
            hanh_vi_vi_pham: "",
            so_lan_vi_pham: 0
        };

        try {
            await fetch(CONFIG.scriptURL, { 
                method: 'POST', 
                mode: 'no-cors', 
                body: new URLSearchParams(data) 
            });
            
            // Xóa loading overlay
            const loadOverlay = document.getElementById('loading-overlay');
            if (loadOverlay) loadOverlay.remove();

            // Hiển thị kết quả thi sinh động
            renderScoreReport(correctCount, total, grade, data);
            
        } catch (e) { 
            console.error("Gửi dữ liệu lỗi:", e);
            const loadOverlay = document.getElementById('loading-overlay');
            if (loadOverlay) loadOverlay.remove();
            
            alert("Lỗi kết nối khi nộp bài! Đang hiển thị kết quả cục bộ...");
            renderScoreReport(correctCount, total, grade, data);
        }
    }

    function renderScoreReport(correctCount, total, grade, data) {
        boDeRandomDiv.style.display = 'block'; // Mở lại đề thi để thí sinh click xem câu hỏi chi tiết
        
        // Tạo SVG circular progress
        const dashArray = 2 * Math.PI * 69;
        const percent = (correctCount / total);
        const dashOffset = dashArray * (1 - percent);
        
        let breakdownHtml = currentQuestions.map((q, idx) => {
            const userAns = selectedAnswers[q.ID] || 0;
            const isCorrect = userAns === q.dapan;
            
            let btnClass = "nav-box ";
            if (userAns === 0) {
                btnClass += "answered-wrong border-amber-500 bg-amber-50 text-amber-800";
            } else if (isCorrect) {
                btnClass += "answered-correct";
            } else {
                btnClass += "answered-wrong";
            }
            
            return `
                <button type="button" class="${btnClass} font-bold text-xs" onclick="showQuestionReview(${idx})">
                    ${idx + 1}
                </button>
            `;
        }).join('');

        thankYouMessageDiv.innerHTML = `
            <div class="bg-[var(--bg-card)] border-2 border-[var(--brand-color)] p-6 md:p-8 rounded shadow-xl text-left max-w-2xl mx-auto space-y-6 transition-all">
                <h2 class="text-center font-black text-2xl text-[var(--brand-color)] border-b border-[var(--border-color)] pb-3 uppercase tracking-wide">Kết Quả Bài Làm</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div class="space-y-2 text-sm">
                        <p class="font-medium"><strong class="opacity-80">Thí sinh:</strong> ${data.name}</p>
                        <p class="font-medium"><strong class="opacity-80">Chức vụ:</strong> ${data.chucvu}</p>
                        <p class="font-medium"><strong class="opacity-80">Đơn vị:</strong> ${data.donvi}</p>
                    </div>
                    
                    <!-- Biểu đồ điểm tròn -->
                    <div class="text-center">
                        <div class="score-circle-container">
                            <svg class="w-full h-full" viewBox="0 0 150 150">
                                <circle class="score-circle-bg" cx="75" cy="75" r="69"></circle>
                                <circle class="score-circle-progress" cx="75" cy="75" r="69" 
                                        stroke-dasharray="${dashArray}" 
                                        stroke-dashoffset="${dashArray}"></circle>
                            </svg>
                            <div class="absolute inset-0 flex flex-col items-center justify-center">
                                <span class="text-4xl font-black text-[var(--brand-color)]">${grade}</span>
                                <span class="text-xs opacity-75 font-semibold">${correctCount} / ${total} câu</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Bảng phân tích câu hỏi chi tiết -->
                <div class="border-t border-[var(--border-color)] pt-4 space-y-3">
                    <h4 class="font-bold text-xs tracking-wider uppercase opacity-85 text-center">Bảng phân tích câu trả lời (Click để xem lại câu)</h4>
                    <div class="flex flex-wrap gap-2 justify-center">
                        ${breakdownHtml}
                    </div>
                    <p class="text-xs text-center opacity-75 italic">Chú thích: Nút màu Xanh = Đúng | Màu Đỏ/Vàng = Sai hoặc Bỏ trống.</p>
                </div>

                <div class="border-t border-[var(--border-color)] pt-5 text-center">
                    <button onclick="location.reload()" class="px-8 py-3 btn-tactile cursor-pointer uppercase text-xs tracking-wider">Thoát & Làm bài mới</button>
                </div>
            </div>
        `;
        
        thankYouMessageDiv.style.display = 'block';
        
        // Đồng bộ lại toàn bộ bảng số điều hướng sang màu kết quả
        updateLiveStats();
        
        // Khóa các nút điều hướng câu hỏi không cho hover chuyển trạng thái linh tinh nữa, chỉ cho xem lại bài
        renderQuestion(currentQuestionIndex);
        
        // Cuộn mượt lên đầu kết quả
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Tạo chuyển động cho vòng tròn tiến trình vẽ điểm
        setTimeout(() => {
            const circleProgress = thankYouMessageDiv.querySelector('.score-circle-progress');
            if (circleProgress) {
                circleProgress.style.strokeDashoffset = dashOffset;
            }
        }, 150);
    }

    window.showQuestionReview = function(index) {
        currentQuestionIndex = index;
        renderQuestion(index);
    };

    confirmSubmitBtn.addEventListener('click', () => submitQuiz());
    
    // Tự động nộp bài khi hết giờ hoặc vi phạm (tương thích ngược nếu cần gọi ép nộp bài)
    window.forceSubmitQuiz = function() {
        submitQuiz(true); 
    };
});
