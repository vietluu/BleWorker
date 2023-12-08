const serviceUUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const characteristicUUID = '0000fff2-0000-1000-8000-00805f9b34fb';
const readUUID = '0000fff1-0000-1000-8000-00805f9b34fb';
let characteristic;
let read;
const connectbtn = document.getElementById('btn-connect');
const startBtn = document.getElementById('btn-start');
const endBtn = document.getElementById('btn-disable');
const shutdownBtn = document.getElementById('btn-shutdown');
const powerBtn = document.getElementById('btn-power');

connectbtn.addEventListener('click', connect);
startBtn.addEventListener('click', start);
endBtn.addEventListener('click', end);
shutdownBtn.addEventListener('click', shutdown);
powerBtn.addEventListener('click', powerQuery);

if('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
  .then(function(registration) {
    console.log('Registration successful, scope is:', registration.scope);
  })
  .catch(function(error) {
    console.log('Service worker registration failed, error:', error);
  });
}
async function connection(){
    console.log('connection')
  const data = new Uint8Array([0xcc, 0x80, 0x02, 0x03, 0x01, 0x01, 0x00, 0x01]);
    await characteristic.writeValue(data)
}
async function powerQuery() {
  const data = new Uint8Array([0xcc, 0x80, 0x02, 0x03, 0x04, 0x04, 0x00, 0x01]);
  await characteristic.writeValue(data);
}
export async function start() {
  const data = new Uint8Array([0xcc, 0x80, 0x02, 0x03, 0x01, 0x02, 0x00, 0x02]);
  await characteristic.writeValue(data);
}
async function end() {
  const data = new Uint8Array([0xcc, 0x80, 0x02, 0x03, 0x01, 0x03, 0x00, 0x03]);
  await characteristic.writeValue(data);
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
    const server = await device.gatt.connect();

    // Nhận service từ thiết bị
    const service = await server.getPrimaryService(serviceUUID);
    // Nhận characteristic từ service
    characteristic = await service.getCharacteristic(characteristicUUID);
    read = await service.getCharacteristic(readUUID);
    // Lắng nghe sự kiện nhận dữ liệu
    read.addEventListener('characteristicvaluechanged', (event) => {
      const receivedData = event.target.value;
      console.log('Received data:', receivedData);
      // Chuyển dữ liệu hexa sang mảng byte
      const byteArray = new Uint8Array(receivedData.buffer);
      console.log('Byte array:', byteArray);
    });

    // Kích hoạt lắng nghe
    await read.startNotifications();
    // Gửi lệnh kết nối
    await connection();
  } catch (error) {

    console.error('Lỗi kết nối:', error);
  }

}