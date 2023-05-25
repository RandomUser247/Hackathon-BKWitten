import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { LoginComponent } from "./login/login.component";
import { ProjectComponent } from "./project/project.component";
import { ProjectEditComponent } from "./project-edit/project-edit.component";
import { ProjectOverviewComponent } from "./project-overview/project-overview.component";
import { StartComponent } from "./start/start.component";
import { RouterModule } from "@angular/router";
import { ArchiveComponent } from './archive/archive.component';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    LoginComponent,
    ProjectComponent,
    ProjectEditComponent,
    ProjectOverviewComponent,
    StartComponent,
    ArchiveComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    AppRoutingModule,
    NgbModule,
    RouterModule.forRoot([
      { path: "", component: StartComponent },
      { path: "start", component: StartComponent },
      { path: "login", component: LoginComponent },
      { path: "project", component: ProjectComponent },
      { path: "overview", component: ProjectOverviewComponent},
      { path: "archive", component: ArchiveComponent}
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
