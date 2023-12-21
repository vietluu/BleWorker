const serviceUUID = "0000fff0-0000-1000-8000-00805f9b34fb";
const characteristicUUID = "0000fff2-0000-1000-8000-00805f9b34fb";
const readUUID = "0000fff1-0000-1000-8000-00805f9b34fb";
let characteristic;
let read;
const connectbtn = document.getElementById("btn-connect");
const startBtn = document.getElementById("btn-start");
const endBtn = document.getElementById("btn-disable");
const shutdownBtn = document.getElementById("btn-shutdown");
const powerBtn = document.getElementById("btn-power");
const status  = document.getElementById("status");
const value = document.getElementById("value");
const list = document.getElementById("list");
connectbtn.addEventListener("click", connect);
startBtn.addEventListener("click", start);
endBtn.addEventListener("click", end);
shutdownBtn.addEventListener("click", shutdown);
powerBtn.addEventListener("click", powerQuery);
let i = 0;
window.addEventListener('load',async  function() {
  await window.Notification.requestPermission();
  await navigator.permissions.query({
    name: 'periodic-background-sync',
  });
   //Notification.requestPermission()
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/service-worker.js", { scope: "./" })
      .then(function (registration) {
        
        console.log("Registration successful, scope is:", registration.scope);
     
        navigator.serviceWorker.addEventListener('message', function(event) {
          if (event.data && event.data.action === 'next-action-ready') {
            // Thực hiện lệnh ở đây khi nhận được thông điệp từ Service Worker
            status.innerHTML = 'Running code in index.js'

            console.log('Running code in index.js every 10 minutes');
            setTimeout(() => {
              navigator.serviceWorker.ready.then(function(registration) {
                // Gửi thông điệp tới service worker
                registration.active.postMessage({action: 'doing-action'});
              });
             return start();
            }, 3 * 60 * 1000);
          }
        });
  
      })
      .catch(function (error) {
        console.log("Service worker registration failed, error:", error);
      });
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('background-sync-task')
          .then(() => {
            console.log('Background sync registered');
          })
          .catch(error => {
            console.error('Background sync registration failed:', error);
          });
      });
      
  }
}
)
async function connection() {
  const data = new Uint8Array([0xcc, 0x80, 0x02, 0x03, 0x01, 0x01, 0x00, 0x01]);
  await characteristic.writeValue(data);
  status.innerHTML = "Đã kết nối";
}
async function powerQuery() {
  const data = new Uint8Array([0xcc, 0x80, 0x02, 0x03, 0x04, 0x04, 0x00, 0x01]);
  await characteristic.writeValue(data);
}

// Hàm xử lý sự kiện khi nhận được dữ liệu từ characteristic
 async function handleCharacteristicValueChanged(event) {
  const receivedData = event.target.value;
  const currentDate = new Date();

  // Lấy thông tin ngày, tháng, năm
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1; // Tháng bắt đầu từ 0
  const year = currentDate.getFullYear();

  // Lấy thông tin giờ, phút, giây
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();

  // Định dạng lại chuỗi theo dd/mm/yyyy, hh:mm:ss
  const formattedDateTime = `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;

  // Chuyển dữ liệu hexa sang mảng byte
  const byteArray = new Uint8Array(receivedData.buffer);
 // list.innerHTML = `${formattedDateTime}: Received data: ` + byteArray;
  if(byteArray.length == 13){
    value.innerHTML = `processing: ${byteArray[10]}`;
  }
  let div  = document.createElement("p");
  div.innerHTML =  `<p>${formattedDateTime}: Received data:  + ${byteArray} </p>`;
  list.appendChild(div);
  console.log(`${formattedDateTime}: Received data:`, byteArray);
  if(byteArray.length == 20){
    value.innerHTML = `result - Sys :${byteArray[14]} , Dia: ${byteArray[16]} , pulse: ${byteArray[18]}`;
    status.innerHTML = "Đã đo xong";
    let div  = document.createElement("p");
    div.innerHTML =  `<p>${formattedDateTime}: Received result:  + ${byteArray} </p>`;
    list.appendChild(div);
    if ('serviceWorker' in navigator) {
      
      navigator.serviceWorker.ready.then(function(registration) {
        // Gửi thông điệp tới service worker
        registration.active.postMessage({action: 'schedule-next-action'});
      });
    }
  }

  if(byteArray.length == 8 && byteArray[6] != 0){
    status.innerHTML = "";
    value.innerHTML = `error code: ${byteArray[6]}`;
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(async function(registration) {
        // Gửi thông điệp tới service worker
        await registration.active.postMessage({action: 'schedule-next-action'});
      });
    }
  }
}
let intervalId; // Biến lưu trữ ID của interval
export async function start() {
  status.innerHTML = "Đang tiền hành đo...";
 
  try {
    const data = new Uint8Array([
      0xcc, 0x80, 0x02, 0x03, 0x01, 0x02, 0x00, 0x02,
    ]);
    await characteristic.writeValue(data);
  } catch (error) {
   // alert("Lỗi kết nối: " + error);
  //  window.location.reload();
    console.log(error);
  }
}
async function end() {
  const data = new Uint8Array([0xcc, 0x80, 0x02, 0x03, 0x01, 0x03, 0x00, 0x03]);
  await characteristic.writeValue(data);
  status.innerHTML = "Đã dừng đo";
  //clearInterval(interval);
}
async function shutdown() {
  const data = new Uint8Array([0xcc, 0x80, 0x02, 0x03, 0x01, 0x04, 0x00, 0x04]);
  await characteristic.writeValue(data);
}
async function connect() { 
  try {
    // Yêu cầu quyền truy cập Bluetooth
    const device = await navigator.bluetooth.requestDevice({
      // Lọc các thiết bị với serviceUUID cụ thể
      filters: [{ services: [serviceUUID] }],
    });
    // Kết nối đến thiết bị đã chọn
    status.innerHTML = "Đang kết nối...";

    const server = await device.gatt.connect();

    // Nhận service từ thiết bị
    const service = await server.getPrimaryService(serviceUUID);
    // Nhận characteristic từ service
    characteristic = await service.getCharacteristic(characteristicUUID);
    read = await service.getCharacteristic(readUUID);
    // Lắng nghe sự kiện nhận dữ liệu
    
    read.addEventListener("characteristicvaluechanged", handleCharacteristicValueChanged);

    // Kích hoạt lắng nghe dữ liệu
    await read.startNotifications();
    // Gửi lệnh kết nối
    await connection();
  } catch (error) {
    alert("Lỗi kết nối: " + error);
    window.location.reload();
    console.error("Lỗi kết nối:", error);
  }
}
