/**
 * GOOGLE APPS SCRIPT FOR GOOGLE SHEETS (ĐÃ CHỌN CÁCH B)
 * Ghi kết quả bài thi trắc nghiệm theo thứ tự cột cố định (từ Cột A đến Cột N).
 * 
 * Cách cài đặt:
 * 1. Mở file Google Sheet nhận kết quả.
 * 2. Chọn "Tiện ích mở rộng" (Extensions) -> "Apps Script".
 * 3. Xóa TOÀN BỘ code cũ và dán toàn bộ code dưới đây vào.
 * 4. Nhấn Lưu (Save).
 * 5. Chọn "Triển khai" (Deploy) -> "Tăng cường triển khai mới" (New deployment).
 * 6. Chọn loại triển khai là "Ứng dụng web" (Web app).
 * 7. Cấu hình:
 *    - Thực thi dưới danh nghĩa: "Tôi" (Me)
 *    - Ai có quyền truy cập: "Mọi người" (Anyone)
 * 8. Nhấn Triển khai và copy URL web app dán vào CONFIG.scriptURL (dòng 32) trong script.js.
 */

// =========================================================================
// CÁCH B: Ghi cột theo thứ tự cố định (Index-based)
// Tự động lưu dữ liệu vào các cột từ A đến N mà không cần viết tiêu đề trước.
// Dữ liệu cột tương ứng:
// Cột A: Họ tên | Cột B: CCCD | Cột C: Ngày cấp | Cột D: SĐT | Cột E: Chức vụ | Cột F: Đơn vị
// Cột G: Giờ bắt đầu | Cột H: Giờ nộp | Cột I: Số câu đúng | Cột J: Tỉ lệ | Cột K: Điểm số | Cột L: Mảng đáp án chi tiết
// Cột M: Chi tiết hành vi vi phạm | Cột N: Tổng số lần vi phạm
// =========================================================================
function doPost(e) {
  try {
    // Luôn ghi vào Sheet đầu tiên bên trái
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    
    var name = e.parameter.name;
    var cccd = e.parameter.cccd;
    var ngaycap = e.parameter.ngaycap;
    var phone = e.parameter.phone;
    var chucvu = e.parameter.chucvu;
    var donvi = e.parameter.donvi;
    var start_time = e.parameter.start_time;
    var submit_time = e.parameter.submit_time;
    var correct_answers = e.parameter.correct_answers;
    var score = e.parameter.score;
    var grade = e.parameter.grade;
    var details_array = e.parameter.details_array;
    
    // Thu thập dữ liệu chống gian lận
    var hanh_vi_vi_pham = e.parameter.hanh_vi_vi_pham || "Không phát hiện vi phạm";
    var so_lan_vi_pham = e.parameter.so_lan_vi_pham || 0;
    
    // Ghi một hàng mới xuống sheet theo đúng thứ tự các cột A -> N
    sheet.appendRow([
      name,            // Cột A
      cccd,            // Cột B
      ngaycap,         // Cột C
      phone,           // Cột D
      chucvu,          // Cột E
      donvi,           // Cột F
      start_time,      // Cột G
      submit_time,     // Cột H
      correct_answers, // Cột I
      score,           // Cột J
      grade,           // Cột K
      details_array,   // Cột L
      hanh_vi_vi_pham, // Cột M
      so_lan_vi_pham   // Cột N
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

// =========================================================================
// PHƯƠNG ÁN 1 (ĐANG KHÓA): Tự động khớp theo tiêu đề cột
// =========================================================================
/*
function doPost_Option1(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var lastColumn = Math.max(1, sheet.getLastColumn());
    var headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
    var newRow = new Array(headers.length).fill("");
    var keyMap = {
      "name": ["Họ và tên", "Họ tên", "name"],
      "cccd": ["CCCD", "Số CCCD", "cccd"],
      "ngaycap": ["Ngày cấp", "ngaycap"],
      "phone": ["Số điện thoại", "SĐT", "phone"],
      "chucvu": ["Chức vụ", "chucvu"],
      "donvi": ["Đơn vị", "donvi"],
      "start_time": ["Thời gian bắt đầu", "Giờ bắt đầu", "start_time"],
      "submit_time": ["Thời gian nộp bài", "Giờ nộp bài", "submit_time"],
      "correct_answers": ["Số câu đúng", "correct_answers"],
      "score": ["Tỉ lệ đúng", "Số câu đúng/Tổng", "score"],
      "grade": ["Điểm số", "grade"],
      "details_array": ["Chi tiết đáp án", "details_array"],
      "hanh_vi_vi_pham": ["Hành vi vi phạm", "hanh_vi_vi_pham"],
      "so_lan_vi_pham": ["Số lần vi phạm", "so_lan_vi_pham"]
    };
    for (var i = 0; i < headers.length; i++) {
      var header = headers[i].toString().trim();
      for (var key in keyMap) {
        if (keyMap[key].indexOf(header) > -1 || header.toLowerCase() === key.toLowerCase()) {
          if (e.parameter[key] !== undefined) {
            newRow[i] = e.parameter[key];
          }
          break;
        }
      }
    }
    sheet.appendRow(newRow);
    return ContentService.createTextOutput(JSON.stringify({ "result": "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
*/
