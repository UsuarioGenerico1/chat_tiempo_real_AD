import { Component, OnInit, inject, signal } from '@angular/core';
import { Login } from './components/login/login';
import { Chat } from './components/chat/chat';
import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [Login,Chat],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App  {
  authService = inject(Auth);
}
