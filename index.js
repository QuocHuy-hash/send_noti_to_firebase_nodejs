const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./ada-notification-3bf21-firebase-adminsdk-hukoq-6ce35535be.json');
const TOKEN = require('./tokenDevice.json'); 
// Khởi tạo ứng dụng Express
const app = express();
app.use(express.json());

// Khởi tạo Firebase Admin SDK
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
});


// Route mặc định
app.get('/', (req, res) => {
	res.send('Server đang hoạt động');
});
app.get('/send', (req, res) => {
	res.send('gửi tin nhắn');
		sendNotification();


	
});
// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server đang lắng nghe trên cổng ${PORT}`);
});

// Route để gửi tin nhắn
const sendNotification = async () => {
	const badge = 1;
	try {
		// Danh sách token nhận thông báo
		// const tokens = [TOKEN.IOS];
		const tokens = [TOKEN.ANDROID]; 
		console.log(tokens);
		const title = "Thông báo";
		const content = "đây là nội dung thông báo"

		if (tokens.length === 0 || !title || !content) {
			console.log('Thiếu thông tin cần thiết');
			return;
		}

		const message = {
			notification: {
				title: title,
				body: content,
			},
			android: {	//gửi cho Android
				notification: {
					channel_id:"vn.adstechnology.tracking",
					sound: 'default', // âm thanh mặc định
					default_sound: true, 
					default_vibrate_timings: true, // chế độ rung mặc định
					default_light_settings: true, // đèn mặc định
					notification_priority: 'PRIORITY_HIGH', // ưu tiên cao
					visibility: 'PUBLIC' // hiển thị trên màn hình khóa
				},
				priority: 'high'
			},
			apns: { //gửi cho IOS
				payload: {
					aps: {
						sound: 'default', // âm thanh mặc định
						badge: 1,   // badge
						'content-available': 1 // cho phép gửi thông báo ngầm
					}
				}
			},
			data: { //data gửi kèm theo thông báo
				name: 'ada_test',
				badge: badge.toString(),
				"content-available": '1'
			}
		};
		// Gửi tin nhắn đến từng token
		const sendPromises = tokens.map(token =>
			admin.messaging().send({ ...message, token })
		);
		// Chuyển các giá trị trong object data thành string
		Object.keys(message.data).forEach(key => {
			message.data[key] = message.data[key].toString();
		});
		// Gửi tin nhắn
		const responses = await Promise.all(sendPromises);
		console.log('Tin nhắn đã được gửi thành công:', responses);
	} catch (error) {
		console.error('Lỗi khi gửi tin nhắn:', error);
	}
};