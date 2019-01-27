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
  currentPlan;
  myIngredients;
  showHideOverlay;
  ingredientToAdd;
  quantityToAdd;
  units;
  filterBy;

  constructor(private authService: AuthService, public db: AngularFireDatabase) { }
 
  ngOnInit() {
    this.currentUserID = localStorage.getItem('currentUserID');
    //set currentPlan to the key that was generated in home component
    //on first login
    this.db.database.ref("/plans").child(this.currentUserID).orderByChild("user").equalTo(this.currentUserID).once("value", 
    (snapshot) =>{
      snapshot.forEach(childSnapshot =>{
        this.currentPlan = childSnapshot.val()['key']
      })
      this.myIngredients = this.db.list("/shoppinglist/" + this.currentPlan, ref => {
        let q = ref.orderByChild('title')
        return q;
      }).valueChanges()
    })
  }
  changeBoughtStatus(item, bought){
    let boughtStatus = !bought;
    this.db.database.ref("/shoppinglist").child(this.currentPlan).child(item).update({'bought': boughtStatus});
  }
  removeIngredient(key){
    this.db.database.ref("/shoppinglist").child(this.currentPlan).child(key).ref.remove()
  }
  showAddIngredient(){
    this.showHideOverlay = 'show';
  }
  addIngredient(){
    if(this.ingredientToAdd && this.ingredientToAdd.length > 0){
      
      let ref = this.db.database.ref("/shoppinglist").child(this.currentPlan).push()
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
