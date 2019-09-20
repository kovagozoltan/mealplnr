import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { AuthService } from '../providers/auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

  //email and password from form
  //for login and signup
  email: string;
  password: string;
  confirmPassword: string;
  errorMessage: string;
  showLogin;
  showSignup;
  showPasswordReset;
  

  constructor(public authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  //google login function
  googleLogin() {
    this.authService.doGoogleLogin().then((data) => {
      this.router.navigate(['']);
    })
  }
  //facebook login function
  facebookLogin() {
    this.authService.doFacebookLogin().then((data) => {
      this.router.navigate(['']);
    })
  }
  emailSignup() {
    if (this.password === this.confirmPassword) {
      this.authService.doEmailSignup(this.email, this.password)
        .then(value => {
          this.email = this.password = '';
        })
        .catch(err => {
          this.errorMessage = err.code.split("/")[1].replace(/-/g, " ").trim();
        })
    } else {
      this.errorMessage = "passwords don't match"
    }
  }
  emailLogin() {
    this.authService.doEmailLogin(this.email, this.password)
      .then(value => {
        this.email = this.password = '';
      })
      .catch(err => {
        this.errorMessage = err.code.split("/")[1].replace(/-/g, " ").trim();
      })
  }
  passwordReset(){
    this.authService.doPasswordReset(this.email)
    .then(value => {
      this.email = '';
      this.errorMessage = "email sent!"
    })
    .catch(err => {
      this.errorMessage = err.code.split("/")[1].replace(/-/g, " ").trim();
    })
  }
}
