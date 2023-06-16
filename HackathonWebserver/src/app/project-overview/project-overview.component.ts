import { Component } from '@angular/core';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-projekt-overview',
  templateUrl: './project-overview.component.html',
  styleUrls: ['./project-overview.component.css']
})
export class ProjectOverviewComponent {
  constructor(private projectService: ProjectService) { }
  ngOnInit(): void {
    // this.projectService.readAllProjectsFromDatabase();
  }
  projects = [1, 2, 3, 4, 5, 6, 7, 8, 9]
}
