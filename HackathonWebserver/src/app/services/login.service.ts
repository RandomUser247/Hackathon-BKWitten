import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {

  constructor(private http: HttpClient) { }
  //user: BehaviorSubject<User> = new BehaviorSubject({} as User);

  setToken(token: string): void {
    return localStorage.setItem('token', token);
  }
  logout() {
    localStorage.removeItem('token');
  }
  getActiveUser() {

  }
  loginUser(email: string, password: string): Observable<User> {
    return this.http.post<User>('http://localhost:8080/benutzer/login',
      {
        "email": email,
        "password": password
      });
  }
}

