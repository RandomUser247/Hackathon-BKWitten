import { Component } from '@angular/core';
import { UserloginService } from '../services/userlogin.service';
@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  constructor(private loginService: UserloginService) { }

  actualpassword: string;
  newpassword: string;
  repeatpassword: string;


  validateUserLogin() {
    this.loginService.loginUser(this.actualpassword, this.newpassword).subscribe({
      next: () => {
      },
      error: () => {
        console.log("Passwort falsch!");
      }
    })
  }
}
