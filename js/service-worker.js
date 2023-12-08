// service-worker.js
import { start } from "./index.js";
// Lưu ý: Đây là pseudocode, bạn cần điều chỉnh để phù hợp với logic cụ thể của mình

// Khi Service Worker được khởi tạo
self.addEventListener('install', function(event) {
    // Cài đặt logic cho Worker
  });
  
  // Khi Service Worker bắt đầu hoạt động
  self.addEventListener('activate', function(event) {
    // Bắt đầu kích hoạt logic BLE
    setInterval(start, 30 * 60 * 1000); // Gửi lệnh start sau mỗi 30 phút
  });

  