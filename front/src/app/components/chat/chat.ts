import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { ChatService } from '../../services/chat';
import { Auth } from '../../services/auth';
@Component({
  selector: 'app-chat',
  imports: [FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy{
newMessage = signal('');
  messageList = signal<any[]>([]); 
  
  rooms = ['proyecto', 'sala1', 'sala2'];
  currentRoom = signal<string>('proyecto');

  globalUserList = signal<any[]>([]);
  roomUserList = signal<any[]>([]);
  
  private chatService = inject(ChatService);
  public authService = inject(Auth);

  ngOnInit() {
    const token = this.authService.getToken();
    if (token) {
      this.chatService.connect(token);

      this.chatService.joinRoom(this.currentRoom());
    }
    this.chatService.getChatHistory().subscribe((history: any[]) => {
      this.messageList.set(history);
    });
    this.chatService.getMessages().subscribe((msgData: any) => {
      if (msgData.room === this.currentRoom()) {
        this.messageList.update(msgs => [...msgs, msgData]);
      }
    });

    this.chatService.getGlobalUserList().subscribe((users: any[]) => {
      this.globalUserList.set(users);
    });

    this.chatService.getRoomUserList().subscribe((users: any[]) => {
      this.roomUserList.set(users);
    });
  }

  changeRoom(roomName: string) {
    if (roomName === this.currentRoom()) return;

    this.currentRoom.set(roomName);
    this.chatService.joinRoom(roomName);
  }

  send() {
    if (this.newMessage().trim()) {
      const msgData = {
        text: this.newMessage(),
        room: this.currentRoom()
      };
      this.chatService.sendMessage(msgData);
      this.newMessage.set('');
    }
  }

  logout() {
    this.chatService.disconnect(); // Cerramos el socket al salir
    this.authService.logout();
  }
  ngOnDestroy() {
    this.chatService.disconnect();
  }
}
