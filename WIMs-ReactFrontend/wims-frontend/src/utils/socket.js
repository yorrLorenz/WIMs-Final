// utils/socket.js
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let stompClient = null;

export function connect(onMessage) {
  const socket = new SockJS("https://wims-w48m.onrender.com/ws");
  stompClient = new Client({
    webSocketFactory: () => socket,
    onConnect: () => {
      stompClient.subscribe("/topic/logs", (message) => {
        const data = JSON.parse(message.body);
        onMessage(data);
      });
    },
  });
  stompClient.activate();
}

export function disconnect() {
  if (stompClient) {
    stompClient.deactivate();
  }
}
