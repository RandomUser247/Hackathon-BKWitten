import { Component } from '@angular/core';
import { LoginServiceService } from '../services/login.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private loginService: LoginServiceService, private routes: Router) { }

  password: any;
  email: any;

  setToken(token: string): void {
    return localStorage.setItem('token', token);
  }
  validateUserLogin() {
    this.loginService.loginUser(this.email, this.password).subscribe({
      next: () => {
        this.routes.navigate(['home']);
        this.setToken(this.email);
      },
      error: () => {
        console.log("Benutzername, Email oder Passwort falsch!");
      }
    })
  }
}
