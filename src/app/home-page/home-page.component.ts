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


  displayName;
  photoUrl;
  currentUserID;
  itemToAdd;
  quantityToAdd:Number = 1;
  myList: Observable<any>;
  

  constructor(private authService: AuthService, private router: Router, public db: AngularFireDatabase) { }

  ngOnInit() {
    this.displayName = localStorage.getItem('displayName')
    this.photoUrl = localStorage.getItem('photoUrl')
    this.currentUserID = localStorage.getItem('currentUserID')
    
    //this returns the whole UID node
    this.myList = this.db.list("/lists/"+this.currentUserID).valueChanges()

    //this way i can filter results
    //with order by Child
    /*
    this.myList = this.db.list('/lists/'+this.currentUserID, ref => {
      // filter ref here. orderByChild(X).equalTo(Y)
      let q = ref.orderByChild("bought").equalTo(true);
      return q;
    }).valueChanges();
    */
  }
  logout(){
    this.authService.logout();
    this.router.navigate(['login']);
  }
  addItem(){
    if(this.itemToAdd && this.itemToAdd.length > 0){
      this.db.database.ref("/lists").child(this.currentUserID)
      .child(this.itemToAdd)
      .set({
        'title': this.itemToAdd,
        'quantity': this.quantityToAdd,
        'bought': false,
        'note': 'this text is for testing'
      })
      this.itemToAdd = null;
      this.quantityToAdd = 1;
    }
  }
  removeItem(item){
    this.db.database.ref("/lists").child(this.currentUserID).child(item).remove();
  }
  buyItem(item){
    this.db.database.ref("/lists").child(this.currentUserID).child(item).update({'bought': true})
  }
  unBuyItem(item){
    this.db.database.ref("/lists").child(this.currentUserID).child(item).update({'bought': false})
  }
}
