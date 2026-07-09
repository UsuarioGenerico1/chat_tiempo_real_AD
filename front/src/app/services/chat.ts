import { Injectable, NgZone, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
 private socket!: Socket; // Usamos ! porque se inicializará dinámicamente
  private url = 'http://localhost:3000';
  private ngZone = inject(NgZone);

  // NUEVO: Método para conectar enviando el JWT de forma oculta y segura
  connect(token: string) {
    if (this.socket?.connected) {
      this.socket.disconnect(); // Si ya había una conexión vieja, la cerramos
    }

    // Pasamos el token dentro de la propiedad 'auth' que exige el backend
    this.socket = io(this.url, {
      auth: { token }
    });
  }

  disconnect() {
    if (this.socket) this.socket.disconnect();
  }

  // OJO: Ya no enviamos el username, el backend lo sabe gracias al JWT
  joinRoom(room: string) {
    this.socket.emit('join-room', { room });
  }

  sendMessage(message: any) {
    this.socket.emit('chat message', message);
  }

  getMessages(): Observable<any> {
    return new Observable<any>(observer => {
      const listener = (data: any) => this.ngZone.run(() => observer.next(data));
      this.socket.on('chat message', listener);
      
      // ESTA ES LA OPTIMIZACIÓN: Cuando el componente se destruye, quitamos el 'oído'
      return () => this.socket.off('chat message', listener); 
    });
  }

  getChatHistory(): Observable<any[]> {
    return new Observable<any[]>(observer => {
      const listener = (history: any[]) => this.ngZone.run(() => observer.next(history));
      this.socket.on('chat-history', listener);
      
      return () => this.socket.off('chat-history', listener);
    });
  }

  getGlobalUserList(): Observable<any[]> {
    return new Observable<any[]>(observer => {
      const listener = (data: any[]) => this.ngZone.run(() => observer.next(data));
      this.socket.on('global-user-list', listener);
      
      return () => this.socket.off('global-user-list', listener);
    });
  }

  getRoomUserList(): Observable<any[]> {
    return new Observable<any[]>(observer => {
      const listener = (data: any[]) => this.ngZone.run(() => observer.next(data));
      this.socket.on('room-user-list', listener);
      
      return () => this.socket.off('room-user-list', listener);
    });
  }
}