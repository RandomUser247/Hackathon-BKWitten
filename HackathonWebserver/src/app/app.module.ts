import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
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
import { AuthguardService } from './services/authguard.service';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from './services/authentication.guard';
@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    LoginComponent,
    ProjectComponent,
    ProjectEditComponent,
    ProjectOverviewComponent,
    StartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    RouterModule.forRoot([
      { path: "", component: StartComponent, canActivate: [AuthGuard] },
      { path: "start", component: StartComponent, canActivate: [AuthGuard] },
      { path: "login", component: LoginComponent, canActivate: [AuthGuard] },
      { path: "project", component: ProjectComponent, canActivate: [AuthGuard] },
      { path: "overview", component: ProjectOverviewComponent, canActivate: [AuthGuard] }
    ]),
  ],
  providers: [AuthguardService],
  bootstrap: [AppComponent]

})
export class AppModule { }
