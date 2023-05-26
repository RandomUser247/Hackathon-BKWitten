import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Projects } from '../interfaces/project';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../interfaces/user';
@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private http: HttpClient, private route: ActivatedRoute) { }
  projectList: Projects[];
  user: User;
  editModeOn: boolean = false;
  project: Projects;
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
  //ProjectID aus URL lesen
  getProjectIDFromURL(): number {
    const stringId = this.route.snapshot.paramMap.get("projectid");
    const id = parseInt(stringId as string)
    return id;
  }
  //Prüfen ob das Projekt vom Benutzer erstellt wurde, erst dann kann es bearbeitet werden.
  isProjectUploadedByCurrentUser(): boolean {
    if (this.project?.projectid == this.user?.userid) {
      return true;
    }
    return false;
  }
  //Filterfunktion für die Suchfunktion
  filterProjectsByName(searchText: string) {
    this.projectList.filter((s) => {
      return s.projecttitle.toLowerCase().includes(searchText.toLowerCase());
    });
  }
}
