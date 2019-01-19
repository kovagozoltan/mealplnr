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

  currentUserID; //user id

  constructor(private authService: AuthService, private router: Router, public db: AngularFireDatabase) { }

  ngOnInit() {
    this.currentUserID = localStorage.getItem('currentUserID')
    //check /plans if currentUserID exist
    this.db.database.ref("/plans").child(this.currentUserID).once("value",
    (snapshot) =>{
      //if it doesn't exist, push a node containing currentUserId
      //and a random key - the push key
      //this will be the unique id of the plan
      if(!snapshot.exists){
        let ref = this.db.database.ref("/plans").child(this.currentUserID).push();
        let key = ref.key;
        ref.set({
          'user': this.currentUserID,
          'key': key
        })
      }
    })
  }
  logout(){
    this.authService.logout();
    this.router.navigate(['login']);
  }
}
