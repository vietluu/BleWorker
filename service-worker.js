// service-worker.js
// Khi Service Worker được khởi tạo
self.addEventListener("install", function (event) {
  self.skipWaiting(); // Kích hoạt Service Worker ngay lập tức
});

self.addEventListener("activate", function (event) {
  console.log("Activated", event);
  event.waitUntil(registerPeriodicSync());
});
0
self.addEventListener("message", (event) => {
  console.log("Received message from main thread", event.data);
  if (event.data && event.data.action === "schedule-next-action") {
    console.log("run");
    event.waitUntil(
      self.registration.showNotification("Globi", {
        body: "Ứng dụng bắt đầu đo sau 10 phút...",
        data: {
          url: "https://vietluu.github.io/BleWorker/",
        },
      }).then(() => {
        return new Promise((resolve) => {

          self.setTimeout(() => {
            self.registration.showNotification("Globi", {
              body: "test",
              data: {
                url: "https://vietluu.github.io/BleWorker/",
              },
            });
            resolve(scheduleNextAction());
          }, 3 * 60 * 1000);
        });
      })
    );
  }

  if (event.data && event.data.action === "doing-action") {
    event.waitUntil(
      self.registration.showNotification("Globi", {
        body: "Ứng dụng đang đo...",
        data: {
          url: "https://vietluu.github.io/BleWorker/",
        },
      })
    );
  }
});


self.addEventListener('sync', event => {
  if (event.tag === 'background-sync-task') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  console.log('Doing background sync...');
  fetch('/')
    .then(response => {
      console.log('Sync successful');
    })
    .catch(error => {
      console.error('Sync failed:', error);
    });
}

async function registerPeriodicSync() {
  if ('periodicSync' in self.registration) {
    try {
      await self.registration.periodicSync.register('background-sync-task', {
        minInterval: 60 * 60 * 1000,
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
    self.clients
      .matchAll({
        includeUncontrolled: true,
        type: "all",
      })
      .then((clients) => {
        console.log(clients);
        clients.forEach((client) => {
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
