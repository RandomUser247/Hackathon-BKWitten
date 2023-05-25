import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthguardService {

  constructor() { }

  public isLoggedIn() {
    return !!localStorage.getItem('token');
  }
}
