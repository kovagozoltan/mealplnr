import { Component, OnInit } from '@angular/core';
import { AuthService } from '../providers/auth.service';
import { AngularFireDatabase } from 'angularfire2/database';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.css']
})
export class InviteComponent implements OnInit {

  constructor(private authService: AuthService, public db: AngularFireDatabase) { }

  currentUserID;
  currentPlan;
  currentUserEmail;
  userEmail;
  errorMessage;
  invitedUserID;
  myInvitations;

  ngOnInit() {
    this.currentUserID = localStorage.getItem('currentUserID')
    this.currentUserEmail = localStorage.getItem('currentUserEmail')

    this.myInvitations = this.db.list("/pendingInvitations/" + this.currentUserID).valueChanges()

  }

  invite(userEmail) {
    this.errorMessage = "";
    //lookup userID by email
    if (this.currentUserEmail != userEmail) {
      this.db.database.ref("/users").orderByChild("email").equalTo(userEmail).once("value",
        (snapshot) => {
          if (snapshot.val()) {
            snapshot.forEach(childSnapshot => {
              this.invitedUserID = childSnapshot.val()['userID'];
            })
            this.db.database.ref("/plans").child(this.currentUserID).once("value",
              (snapshot) => {
                this.currentPlan = Object.keys(snapshot.val())[0]
                this.db.database.ref("/pendingInvitations").child(this.invitedUserID).child(this.currentPlan).set({
                  'key': this.currentPlan,
                  'user': this.invitedUserID,
                  'from': this.currentUserEmail
                })
              })
            this.userEmail = '';
            this.errorMessage = "invitation sent!";
          } else {
            this.errorMessage = "email not found in user list";
          }
        })
    } else {
      this.errorMessage = "please don't try to invite yourself";
    }
  }

  acceptInvitation(key) {
    if (window.confirm('Accepting the invitation, you will lose already saved data.')) {
      this.db.database.ref("/plans").child(this.currentUserID).remove()
      this.db.database.ref("/plans").child(this.currentUserID).child(key).set({
        'key': key,
        'user': this.currentUserID
      })
      this.db.database.ref("/pendingInvitations").child(this.currentUserID).child(key).remove();
    }
  }

}
