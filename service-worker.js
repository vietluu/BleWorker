// service-worker.js

// Khi Service Worker được khởi tạo
self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting()); // Activate worker immediately
});

self.addEventListener('activate', function(event) {
  console.log('Activated', event);
  clients.claim();
  event.waitUntil(self.clients.claim()); // Become available to all pages
});

 // Khi nhận được tin nhắn từ trang web
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'schedule-next-action') {
    console.log('run')
    scheduleNextAction();
  }
});
// Hàm thực hiện công việc sau mỗi 10 phút
function scheduleNextAction() {
  setTimeout(() => {
    // Gọi hàm khác bạn muốn kích hoạt sau mỗi 10 phút ở đây
    // Ví dụ:
    // otherFunction();
    console.log('Other function activated after 10 minutes');

    // Gửi tin nhắn tới trang web để thông báo rằng đã qua 10 phút và có thể kích hoạt hàm khác tiếp theo
    self.clients.matchAll({includeUncontrolled: true,
      type: 'window',}).then((clients) => {
        console.log(clients)
      clients.forEach((client) => {
        client.postMessage({ action: 'next-action-ready' });
      });
    });

    // Lặp lại việc gọi hàm này sau mỗi 10 phút
    scheduleNextAction();
  },  60 * 1000); // 10 phút * 60 giây/phút * 1000 milliseconds/giây
}
