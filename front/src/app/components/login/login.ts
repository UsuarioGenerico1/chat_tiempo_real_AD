import { Component,inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  currentView = signal<'login' | 'register'>('login');
  
  loginForm = { username: '', password: '' };
  registerForm = { name: '', username: '', password: '' };
  
  private authService = inject(Auth);

  onLogin() {
   this.authService.login(this.loginForm).subscribe({
      next: (res) => {
        // Guardamos tanto el usuario como el token JWT que devolvió el backend
        this.authService.setCurrentUser(res.user, res.token);
      },
      error: (err) => alert(err.error.message || 'Error al iniciar sesión')
    });
  }

  onRegister() {
    this.authService.register(this.registerForm).subscribe({
      next: () => {
        alert('Registro exitoso. Ahora inicia sesión.');
        this.currentView.set('login');
      },
      error: (err) => alert(err.error.message || 'Error al registrar')
    });
  }
}
