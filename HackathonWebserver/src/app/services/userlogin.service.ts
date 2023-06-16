import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../interfaces/user';
@Injectable({
  providedIn: 'root'
})
export class UserloginService {

  constructor(private http: HttpClient) { }
  user: BehaviorSubject<User> = new BehaviorSubject({} as User);

  logout() {
    localStorage.removeItem('token123');
  }
  getActiveUser() {
    return this.user;
  }

  loginUser(email: string, password: string): Observable<User> {
    return this.http.post<User>('http://localhost:8080/api/auth',
      {
        "email": email,
        "password": password
      });
  }
}
