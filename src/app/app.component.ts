import { Component } from '@angular/core';

import { Router } from '@angular/router';
import { AuthService } from './providers/auth.service';
import { auth } from 'firebase';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private isLoggedIn: boolean;
  constructor(public authService: AuthService, private router: Router){
    this.authService.af.authState.subscribe(
      (auth) => {
        if (auth == null) {
          //not logged in
          this.isLoggedIn = false;
          this.router.navigate(['login']);
        } else {
          //logged in
          this.isLoggedIn = true;
          this.router.navigate(['']);
        }
      }
    )
  }
}
