import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.css']
})
export class ArchiveComponent {

  STREAMS = [

    {id: 1, url: ''},
    {id: 2, url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'},
    {id: 5, url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'},
    {id: 3, url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'},
    {id: 4, url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'}

  ]

}
