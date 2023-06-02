import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.css']
})
export class ArchiveComponent {
  constructor(private sanitizer: DomSanitizer) {
  }
  getSanitized(url: string){
    return this.sanitizer.bypassSecurityTrustResourceUrl(url)
  }
  STREAMS = [

    {id: 1, url: this.getSanitized('https://www.youtube.com/embed/dQw4w9WgXcQ')},

  ]


}
