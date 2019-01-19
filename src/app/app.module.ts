import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { environment } from '../environments/environment';
import { AuthService } from './providers/auth.service';

import { LoginPageComponent } from './login-page/login-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import { CalendarPageComponent } from './calendar-page/calendar-page.component';
import { ShoppinglistPageComponent } from './shoppinglist-page/shoppinglist-page.component';
import { FavouritesComponent } from './favourites/favourites.component';

import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: '', component: HomePageComponent},
  {path: 'login', component: LoginPageComponent},
  {path: 'calendar', component: CalendarPageComponent},
  {path: 'shoppinglist', component: ShoppinglistPageComponent},
  {path: 'favourites', component: FavouritesComponent}
]

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    HomePageComponent,
    CalendarPageComponent,
    ShoppinglistPageComponent,
    FavouritesComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    RouterModule.forRoot(routes),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }