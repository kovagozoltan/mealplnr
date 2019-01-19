import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../providers/auth.service';
import { AngularFireDatabase } from 'angularfire2/database';

import { Observable } from "rxjs";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {


  displayName; //display name of user - from google account
  photoUrl; //user profile photo - from google account
  currentUserID; //user id

  constructor(private authService: AuthService, private router: Router, public db: AngularFireDatabase) { }

  ngOnInit() {
    // this.displayName = localStorage.getItem('displayName')
    // this.photoUrl = localStorage.getItem('photoUrl')
    this.currentUserID = localStorage.getItem('currentUserID')  
  }
  logout(){
    this.authService.logout();
    this.router.navigate(['login']);
  }
}
