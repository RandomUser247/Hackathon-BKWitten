import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {

  constructor(private http: HttpClient) { }

  user: BehaviorSubject<User> = new BehaviorSubject({} as User);

  logout() {
    localStorage.removeItem('token');
  }
  getActiveUser(): Observable<User> {
    return this.user;
  }
  loginUser(name: string, email: string, password: string): Observable<User> {
    return this.http.post<User>('http://localhost:8080/benutzer/login',
      {
        "benutzername": name,
        "email": email,
        "password": password
      });
  }
}

