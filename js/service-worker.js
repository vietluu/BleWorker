// service-worker.js

// Khi Service Worker được khởi tạo
self.addEventListener('install', function(event) {
    // Cài đặt logic cho Worker
  });
  
  // Khi Service Worker bắt đầu hoạt động
  self.addEventListener('activate', function(event) {
    // Bắt đầu kích hoạt logic BLE
    console.log('Service Worker activated');
  });

  self.addEventListener('sync', (event) => {
    if (event.tag === 'measurement-sync') {
      event.waitUntil(
        new Promise((resolve) => {
          // Sau khi delay 30 phút, gửi tin nhắn tới trang web thông qua postMessage
          setTimeout(() => {
            self.clients.matchAll().then((clients) => {
              clients.forEach((client) => {
                client.postMessage({ action: 'start-measurement' });
              });
              resolve();
            });
          }, 30 * 60 * 1000); // 30 phút * 60 giây/phút * 1000 milliseconds/giây
        })
      );
    }
  });