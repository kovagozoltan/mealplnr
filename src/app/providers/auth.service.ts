import { Injectable } from '@angular/core';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(public af: AngularFireAuth, public db: AngularFireDatabase) {

   }

  myAuthState: any;
  currentUserID: any;
  currentUserEmail: any;

  doGoogleLogin() {
    return new Promise<any>((resolve, reject) => {
      let provider = new firebase.auth.GoogleAuthProvider();
      // force acount selection on login
      // provider.setCustomParameters({
      //   prompt: 'select_account'
      // });
      provider.addScope('profile');
      provider.addScope('email');
      this.af.auth
        .signInWithPopup(provider)
        .then(res => {
          resolve(res);
        });

      this.myAuthState = this.af.authState.subscribe(user => {
        if (user) {
          this.currentUserID = this.af.auth.currentUser.uid;
          this.currentUserEmail = this.af.auth.currentUser.email;
          localStorage.setItem('currentUserID', this.currentUserID);
          localStorage.setItem('currentUserEmail', this.currentUserEmail);
        };
      });

    });
  };
  doFacebookLogin() {
    return new Promise<any>((resolve, reject) => {
      let provider = new firebase.auth.FacebookAuthProvider();
      this.af.auth
        .signInWithPopup(provider)
        .then(res => {
          resolve(res);
        }, err => {
          console.log(err);
          reject(err);
        });

        this.myAuthState = this.af.authState.subscribe(user => {
          if (user) {
            this.currentUserID = this.af.auth.currentUser.uid;
            this.currentUserEmail = this.af.auth.currentUser.email;
            localStorage.setItem('currentUserID', this.currentUserID);
            localStorage.setItem('currentUserEmail', this.currentUserEmail);
          };
        });

    });
  }
  doEmailSignup(email: string, password: string) {
    this.myAuthState = this.af.authState.subscribe(user => {
      if (user) {
        this.currentUserID = this.af.auth.currentUser.uid;
        this.currentUserEmail = this.af.auth.currentUser.email;
        localStorage.setItem('currentUserID', this.currentUserID);
        localStorage.setItem('currentUserEmail', this.currentUserEmail);
        user.sendEmailVerification();
      };
    });
    return this.af.auth
      .createUserWithEmailAndPassword(email, password)
  }
  doEmailLogin(email: string, password: string) {
    this.myAuthState = this.af.authState.subscribe(user => {
      if (user) {
        this.currentUserID = this.af.auth.currentUser.uid;
        this.currentUserEmail = this.af.auth.currentUser.email;
        localStorage.setItem('currentUserID', this.currentUserID);
        localStorage.setItem('currentUserEmail', this.currentUserEmail);
      };
    });
    return this.af.auth
      .signInWithEmailAndPassword(email, password);
  }
  doPasswordReset(email:string){
    return this.af.auth
    .sendPasswordResetEmail(email)
  }
  logout() {
    if (this.myAuthState) {
      this.myAuthState.unsubscribe();
    };
    localStorage.clear();
    return this.af.auth.signOut();
  };

};