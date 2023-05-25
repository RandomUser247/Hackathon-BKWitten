import { Component } from '@angular/core';
import { UserloginService } from '../services/userlogin.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private loginService: UserloginService) { }

  email: any;
  password: any;

  validateUserLogin() {
    this.loginService.loginUser(this.email, this.password).subscribe({
      next: () => {
        localStorage.setItem("token123", this.email);
      },
      error: () => {
        console.log("Benutzername oder Passwort falsch!");
      }
    })
  }
}
