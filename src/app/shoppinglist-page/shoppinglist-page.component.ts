import { Component, OnInit } from '@angular/core';
import { AuthService } from '../providers/auth.service';
import { AngularFireDatabase } from 'angularfire2/database';

@Component({
  selector: 'app-shoppinglist-page',
  templateUrl: './shoppinglist-page.component.html',
  styleUrls: ['./shoppinglist-page.component.css']
})
export class ShoppinglistPageComponent implements OnInit {

  currentUserID;
  myIngredients;
  showHideOverlay;
  ingredientToAdd;
  quantityToAdd;
  units;

  constructor(private authService: AuthService, public db: AngularFireDatabase) { }

  ngOnInit() {
    this.currentUserID = localStorage.getItem('currentUserID');
    //this.myIngredients = this.db.list("/shoppinglist/"+this.currentUserID).valueChanges()
    this.myIngredients = this.db.list("/shoppinglist/"+this.currentUserID, ref => {
      let q = ref.orderByChild('title')
      return q;
    }).valueChanges()
  }
  changeBoughtStatus(item, bought){
    let boughtStatus = !bought;
    this.db.database.ref("/shoppinglist").child(this.currentUserID).child(item).update({'bought': boughtStatus});
  }
  removeIngredient(key){
    this.db.database.ref("/shoppinglist").child(this.currentUserID).child(key).ref.remove()
  }
  showAddIngredient(){
    this.showHideOverlay = 'show';
  }
  addIngredient(){
    if(this.ingredientToAdd && this.ingredientToAdd.length > 0){
      
      let ref = this.db.database.ref("/shoppinglist").child(this.currentUserID).push()
      let key = ref.key;
      ref.set({
        'title': this.ingredientToAdd,
        'quantity': this.quantityToAdd,
        'units': this.units,
        'key': key,
        'bought': false
      })
      this.ingredientToAdd = null;
      this.quantityToAdd = 1;
    }
  }
}
