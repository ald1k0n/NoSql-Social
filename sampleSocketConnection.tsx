import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
	const clientRef = useRef<WebSocket | null>(null);
	const messageRef = useRef<WebSocket | null>(null);
	const [login, setLogin] = useState('');
	const [password, setPassword] = useState('');
	const [message, setMessage] = useState('');
	const [toWho, setToWho] = useState('');
	const [waitingToReconnect, setWaitingToReconnect] = useState<boolean | null>(
		false
	);

	const sendMessage = () => {
		messageRef.current?.send(
			JSON.stringify({
				secondId: toWho,
				msg: message,
				method: 'message',
			})
		);
		// console.log(toWho, message);
	};

	const Login = () => {
		axios
			.post(
				'http://localhost:8080/auth/login',
				{ login, password },
				{ withCredentials: true }
			)
			.then((res) => console.log(res.data))
			.catch((err) => console.error(err));
	};

	useEffect(() => {
		if (waitingToReconnect) {
			return;
		}

		if (!clientRef.current) {
			const client = new WebSocket('ws://localhost:8080/online');
			const messageWs = new WebSocket('ws://localhost:8080/chats');

			clientRef.current = client;
			messageRef.current = messageWs;

			client.onerror = (err) => {
				console.error(err);
			};

			messageWs.onerror = (err) => {
				console.error(err);
			};

			client.onopen = () => {
				console.log('Сокет подключен');
				client.send(
					JSON.stringify({
						method: 'online',
					})
				);
			};

			messageWs.onopen = () => {
				console.log('Чат подключен');
				messageWs.send(
					JSON.stringify({
						method: 'chat',
					})
				);
			};

			client.onclose = () => {
				if (!clientRef.current) {
					console.log('connection was closed');
				} else {
					console.log('connection closed by app component unmount');
				}
				if (waitingToReconnect) {
					return;
				}
				console.log('connection closed');
				setWaitingToReconnect(true);

				setTimeout(() => setWaitingToReconnect(null), 5000);
			};
			client.onmessage = (message) => {
				const newData = JSON.parse(message.data);
				console.log(newData);
			};

			messageWs.onmessage = (message) => {
				console.log(message.data);
			};

			window.addEventListener('beforeunload', () => {
				client.send(
					JSON.stringify({
						method: 'offline',
					})
				);
			});
		}
	}, [waitingToReconnect]);

	return (
		<div className='App'>
			<div>
				<h2>Войти</h2>
				<input
					type='text'
					placeholder='login'
					onChange={(e) => setLogin(e.target.value)}
				/>
				<input
					type='password'
					placeholder='password'
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button onClick={Login}>Войти</button>
			</div>
			<div>
				<h2>Отправить сообщение</h2>
				<select onChange={(e) => setToWho(e.target.value)}>
					<option value=''>Выберите кому отправить сообщение</option>
					<option value='63c19255f3e8b589c05a2414'>Ерик</option>
					<option value='63c18d7254738d5ca86cb1c3'>Алдик</option>
				</select>
				<textarea onChange={(e) => setMessage(e.target.value)} />
				<button onClick={sendMessage}>Отправить сообщение</button>
			</div>
		</div>
	);
};

export default App;
