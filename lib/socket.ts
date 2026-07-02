'use client';

import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, getAuthToken } from './api';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (typeof window === 'undefined') return null;
  const token = getAuthToken();
  if (!token) return null;

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socket;
}

export function subscribeToBooking(bookingId: string) {
  const s = getSocket();
  s?.emit('booking:subscribe', { bookingId });
}

export function unsubscribeFromBooking(bookingId: string) {
  const s = getSocket();
  s?.emit('booking:unsubscribe', { bookingId });
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
