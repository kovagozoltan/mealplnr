import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../providers/auth.service';
import { AngularFireDatabase } from 'angularfire2/database';


//import { Observable } from "rxjs";
//import { Z_DEFAULT_STRATEGY } from 'zlib';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  currentUserID; //user id
  currentUserEmail; //user email
  emailVerified;
  currentPlan;
  showSidePanel;

  constructor(private authService: AuthService, private router: Router, public db: AngularFireDatabase) { }

  ngOnInit() {
    this.emailVerified = localStorage.getItem('emailVerified');
    this.authService.af.authState.subscribe(user =>{
      if(user && !this.emailVerified){
        this.emailVerified = user.emailVerified;
        localStorage.setItem('emailVerified', this.emailVerified);
      }
    })
    this.currentUserID = localStorage.getItem('currentUserID');
    this.currentUserEmail = localStorage.getItem('currentUserEmail');
    this.db.database.ref("/users").orderByChild('userID').equalTo(this.currentUserID).once("value",
      (snapshot) => {
        if (!snapshot.val()) {
          this.db.database.ref("/users").push({
            'userID': this.currentUserID,
            'email': this.currentUserEmail
          })
        }
      })
    //check /plans if currentUserID exist
    this.db.database.ref("/plans").child(this.currentUserID).once("value",
      (snapshot) => {
        //if it doesn't exist, push a node containing currentUserId
        //and a random key - the push key
        //this will be the unique id of the plan
        if (!snapshot.val()) {
          let ref = this.db.database.ref("/plans").child(this.currentUserID).push();
          let key = ref.key;
          ref.set({
            'user': this.currentUserID,
            'key': key
          })
        }
      })
  }
  resetWeeklyPlan() {
    this.db.database.ref("/plans").child(this.currentUserID).orderByChild("user").equalTo(this.currentUserID).once("value",
    (snapshot) => {
      snapshot.forEach(childSnapshot => {
        this.currentPlan = childSnapshot.val()['key']
        if (window.confirm('Are sure you want reset your weekly plan? This will remove all meals from your calendar and remove all items from your shopping list.')) {
          // remove recipe from whole currentPlan node
          this.db.database.ref("/recipes").child(this.currentPlan).remove();
          // remove ingredients from whole currentPlan node
          this.db.database.ref("/shoppinglist").child(this.currentPlan).remove()
        }
      })
    })
  }
  resetShoppingList() {
    this.db.database.ref("/plans").child(this.currentUserID).orderByChild("user").equalTo(this.currentUserID).once("value",
    (snapshot) => {
      snapshot.forEach(childSnapshot => {
        this.currentPlan = childSnapshot.val()['key']
        if (window.confirm('Are sure you want reset your soppinglist? This will remove all items from your shopping list.')) {
          // remove ingredients from whole currentPlan node
          this.db.database.ref("/shoppinglist").child(this.currentPlan).once("value",
        (snapshot) => {
         snapshot.forEach(childSnapshot => {
           childSnapshot.ref.update({'needToBuy': false});
         })
        })
        }
      })
    })
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['login']);
  }
}
