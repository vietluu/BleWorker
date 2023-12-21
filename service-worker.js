// service-worker.js

// Khi Service Worker được khởi tạo
self.addEventListener("install", function (event) {
  self.skipWaiting(); // Kích hoạt Service Worker ngay lập tức
});

self.addEventListener("activate", function (event) {
  console.log("Activated", event);
  
});
self.addEventListener("message", (event) => {
  console.log("Received message from main thread", event.data);
  if (event.data && event.data.action === "schedule-next-action") {
    console.log("run");
    event.waitUntil(scheduleNextAction());
  }
  if (event.data && event.data.action === "doing-action") {
    console.log("run");
    event.waitUntil(
      self.registration.showNotification("Globi", {
        body: "Uứng dụng đang đo...",
        data: {
          url: "https://2gt04bc6-5502.asse.devtunnels.ms/",
        },
      })
    );
  }
});

// async function start() {
//  // status.innerHTML = "Đang tiền hành đo...";
 
//   try {
//     const data = new Uint8Array([
//       0xcc, 0x80, 0x02, 0x03, 0x01, 0x02, 0x00, 0x02,
//     ]);
//     await characteristic.writeValue(data);
//   } catch (error) {
//    // alert("Lỗi kết nối: " + error);
//   //  window.location.reload();
//     console.log(error);
//   }
// }

// Đăng ký sự kiện sync
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync-task') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Thực hiện công việc cần thiết ở đây
  console.log('Doing background sync...');
  // Ví dụ: gửi dữ liệu lên server
  fetch('/')
    .then(response => {
      // Xử lý kết quả nếu cần
      console.log('Sync successful');
    })
    .catch(error => {
      console.error('Sync failed:', error);
    });
}

// Đăng ký periodic sync (định kỳ)
self.addEventListener('activate', event => {
  event.waitUntil(registerPeriodicSync());
});

async function registerPeriodicSync() {
  if ('periodicSync' in self.registration) {
    try {
      await self.registration.periodicSync.register('background-sync-task', {
        minInterval: 3 * 60 * 1000, // Định kỳ 24 giờ
      });
      console.log('Periodic sync registered');
    } catch (error) {
      console.error('Periodic sync registration failed:', error);
    }
  } else {
    console.error('Periodic background sync not supported');
  }
}


function scheduleNextAction() {
    console.log("Other function activated after 10 minutes");

    // Gửi tin nhắn tới trang web để thông báo rằng đã qua 10 phút và có thể kích hoạt hàm khác tiếp theo
    self.clients
      .matchAll({
        includeUncontrolled: true,
        type: "all",
      })
      .then((clients) => {
        console.log(clients);
        clients.forEach((client) => {
          self.registration.showNotification("Globi", {
            body: "Uứng dụng bắt đầu đo sau 3p...",
            data: {
              url: "https://2gt04bc6-5502.asse.devtunnels.ms/",
            },
          });
          client.postMessage({ action: "next-action-ready" });
        });
      });
}
self.addEventListener("notificationclick", (event) => {
  event.notification.close(); // Đóng thông báo
  const urlToOpen = event.notification.data.url; // Lấy URL từ dữ liệu thông báo

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clients) => {
        // Kiểm tra xem có cửa sổ nào đang mở không
        for (let client of clients) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus(); // Focus vào cửa sổ đang mở có URL tương ứng
          }
        }
        // Nếu không có cửa sổ nào mở với URL tương ứng, mở một cửa sổ mới
        return clients.openWindow(urlToOpen);
      })
  );
});
