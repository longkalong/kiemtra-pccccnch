window.violationCount = 0;

function handleViolation(message) {
    window.violationCount++;
    alert(`${message}\nSố lần vi phạm: ${window.violationCount}/3`);
    
    if (window.violationCount >= 3) {
        alert("Bạn đã vi phạm quá 3 lần. Hệ thống sẽ tự động nộp bài!");
        if (typeof window.forceSubmitQuiz === 'function') {
            window.forceSubmitQuiz();
        }
    }
}

document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    handleViolation("Cảnh báo: Bạn vừa rời khỏi trang làm bài!");
  }
});

// window.addEventListener('blur', () => {
//   console.log("Người dùng đã chuyển tab hoặc mở ứng dụng khác");
// });
// window.addEventListener('blur', () => {
//   // Khi người dùng nhấn phím tắt chụp ảnh, trình duyệt sẽ bị blur
//   document.body.classList.add('blur-content');
// });

// window.addEventListener('focus', () => {
//   // Khi họ quay lại trang web
//   document.body.classList.remove('blur-content');
// });

document.addEventListener('keydown', function(e) {
    // 1. Chặn F12 (Mở Inspect)
    if (e.key === "F12") {
        alert("Cảnh báo: Không được phép mở công cụ kiểm tra!");
        e.preventDefault();
    }

    // 2. Chặn Ctrl + Shift + I (Mở Inspect)
    if (e.ctrlKey && e.shiftKey && e.key === "I") {
        alert("Cảnh báo: Hành vi xâm nhập bị nghiêm cấm!");
        e.preventDefault();
    }

    // 3. Chặn Ctrl + U (Xem nguồn trang)
    if (e.ctrlKey && e.key === "u") {
        alert("Cảnh báo: Không được phép xem mã nguồn!");
        e.preventDefault();
    }

    // 4. Chặn Ctrl + P (In ấn - thường dùng để lưu PDF)
    if (e.ctrlKey && e.key === "p") {
        alert("Cảnh báo: Không được phép in bài thi!");
        e.preventDefault();
    }
    // 5. Chặn Ctrl + C (Copy nội dung trang)
    if (e.ctrlKey && e.key === "c") {
        alert("Cảnh báo: Không được phép sao chép nội dung bài thi!");
        e.preventDefault();
    }
    // 6. Cảnh báo khi dùng Shift + Win + S hoặc PrintScreen
    // Lưu ý: Trình duyệt không chặn được Win+S nhưng có thể phát hiện phím Shift/Meta
    if (e.key === "PrintScreen" || (e.key === "s" && e.metaKey && e.shiftKey)) {
        alert("Hệ thống phát hiện hành động chụp màn hình!");
    }
    if (e.shiftKey && e.key === "s") {
        alert("Cảnh báo: Không được phép in bài thi!");
        e.preventDefault();
    }
});
