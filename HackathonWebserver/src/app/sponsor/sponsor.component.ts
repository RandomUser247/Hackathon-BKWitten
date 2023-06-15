import { Component } from '@angular/core';

@Component({
  selector: 'app-sponsor',
  templateUrl: './sponsor.component.html',
  styleUrls: ['./sponsor.component.css']
})
export class SponsorComponent {

  SPONSORS = [

  {id: 1, logo: "assets/Images/logo-bkwitten4.png", text: "Lorem ipsum dolor, sit amet consectetur adipisicing elit.", title: "Sponsor 1"},
    {id: 2, logo: "assets/Images/logo-bkwitten4.png", text: "Lorem ipsum dolor, sit amet consectetur adipisicing elit.", title: "Sponsor 2"}

  ]

}
