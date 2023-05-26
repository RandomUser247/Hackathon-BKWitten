import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Projects } from '../interfaces/project';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private http: HttpClient) { }
  projectList: Projects[];

  //Dieses NgOnInit muss später in die overview Komponente, damit diese beim Start der Komponente geladen werden

  //Alle Projekte aus der Datenbank lesen
  readAllProjectsFromDatabase(): Observable<Projects> {
    return this.http.get<Projects>('http://localhost:8080/projects');
  }
  //Ein Projekt aus der Datenbank per ID lesen
  readSingleProjectFromDatabase(projectid: number): Observable<Projects> {
    return this.http.get<Projects>('http://localhost:8080/projects/' + projectid);
  }
  //Ein bestehendes Projekt updaten oder ein neues hinzufügen
  updateOrAddProject(project: Projects): Observable<Projects> {
    return this.http.post<Projects>('http://localhost:8080/projects', project);
  }
  filterProjectsByName(searchText: string) {
    this.projectList.filter((s) => {
      return s.projecttitle.toLowerCase().includes(searchText.toLowerCase());
    });
  }
}
