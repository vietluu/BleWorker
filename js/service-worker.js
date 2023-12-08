import { start } from "./index.js";

// service-worker.js

// Khi Service Worker được khởi tạo
self.addEventListener('install', function(event) {
    // Cài đặt logic cho Worker
  });
  
  // Khi Service Worker bắt đầu hoạt động
  self.addEventListener('activate', function(event) {
    // Bắt đầu kích hoạt logic BLE
    setInterval(start, 30 * 60 * 1000); // Gửi lệnh start sau mỗi 30 phút
  });

  