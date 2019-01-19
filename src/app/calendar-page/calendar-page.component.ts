import { Component, OnInit } from '@angular/core';
import { AuthService } from '../providers/auth.service';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from "rxjs";

@Component({
  selector: 'app-calendar-page',
  templateUrl: './calendar-page.component.html',
  styleUrls: ['./calendar-page.component.css']
})
export class CalendarPageComponent implements OnInit {

  myRecipes: Observable<any>;
  myIngredients;
  currentUserID; // current user id
  currentDay;
  currentPlan;
  recipeToAdd;
  quantityToAdd: Number = 1;
  units;
  showHideOverlay;
  showHideAddIngredient;
  showHideAddNote;
  hideAddToFavsToast = true;
  ingredientToAdd;
  noteToAdd;
  currentRecipe;
  daysWithRecipes: any = [];

  hideIngredients:any = {};
  hideMealMenu:any = {};

  constructor(private authService: AuthService, public db: AngularFireDatabase) { }

  ngOnInit() {
    //get currentUserID from local storage
    //it was set in auth service
    this.currentUserID = localStorage.getItem('currentUserID');
    //set currentPlan to the key that was generated in home component
    //on first login
    this.db.database.ref("/plans").child(this.currentUserID).orderByChild("user").equalTo(this.currentUserID).once("value", 
    (snapshot) =>{
      snapshot.forEach(childSnapshot =>{
        this.currentPlan = childSnapshot.val()['key']
      })
      this.currentDay = 'monday';
      this.myIngredients = this.db.list("/shoppinglist/" + this.currentPlan).valueChanges()
      this.myRecipes = this.db.list('/recipes/' + this.currentPlan, ref => {
        // filter ref here ex: orderByChild(X).equalTo(Y)
        let q = ref.orderByChild("day").equalTo(this.currentDay);
        return q;
      }).valueChanges();
    })
  }
  getRecipes(day) {
    this.currentDay = day;
    this.myIngredients = this.db.list("/shoppinglist/" + this.currentPlan ).valueChanges()
    this.myRecipes = this.db.list('/recipes/' + this.currentPlan, ref => {
      // filter ref here ex: orderByChild(X).equalTo(Y)
      let q = ref.orderByChild("day").equalTo(day);
      return q;
    }).valueChanges();
  }
  addRecipe() {
    if (this.recipeToAdd && this.recipeToAdd.length > 0) {
      let ref = this.db.database.ref("/recipes").child(this.currentPlan).push();
      let key = ref.key;
      ref.set({
        'title': this.recipeToAdd,
        'day': this.currentDay,
        'note': "",
        'favourite': false,
        'key': key,
        'ingredientNumber': 0
      })
      this.recipeToAdd = null;
    }
  }
  removeRecipe(key) {
    // remove recipe from curent user, that has id of
    this.db.database.ref("/recipes").child(this.currentPlan).child(key).remove();
    // remove ingredient from shopping list, from current user that matches the recipe removed ^^
    this.db.database.ref("/shoppinglist").child(this.currentPlan).orderByChild('recipeId').equalTo(key).once("value",
      (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          this.db.database.ref("/shoppinglist").child(this.currentPlan).child(childSnapshot.key).ref.remove()
        })
      })
    this.noteToAdd = null;
  }
  showAddIngredient(key) {
    this.showHideOverlay = 'show';
    this.showHideAddIngredient = 'show';
    this.currentRecipe = key;
  }
  showAddNote(key) {
    this.showHideOverlay = 'show';
    this.showHideAddNote = 'show';
    this.currentRecipe = key;
    this.db.database.ref("/recipes").child(this.currentPlan).child(key).child("note").once("value",
      (snapshot) => {
        this.noteToAdd = snapshot.val();
      });
  }
  addIngredient(ingredient) {
    if (this.ingredientToAdd && this.ingredientToAdd.length > 0) {

      let ref = this.db.database.ref("/shoppinglist").child(this.currentPlan).push()
      let key = ref.key;
      ref.set({
        'title': this.ingredientToAdd,
        'quantity': this.quantityToAdd,
        'units': this.units,
        'recipeId': this.currentRecipe,
        'key': key,
        'bought': false
      })
      this.db.database.ref("/recipes").child(this.currentPlan).child(this.currentRecipe).once("value", 
      (snapshot) => {
        let value = snapshot.val()['ingredientNumber']
        value = value + 1;
        this.db.database.ref("/recipes").child(this.currentPlan).child(this.currentRecipe).update({"ingredientNumber": value})
      })
      this.ingredientToAdd = null;
      this.quantityToAdd = 1;
    }
  }
  addNote(note) {
    let ref = this.db.database.ref("/recipes").child(this.currentPlan).child(this.currentRecipe).update({ 'note': note })
  }
  removeIngredient(itemKey, recipeKey) {
    this.db.database.ref("/shoppinglist").child(this.currentPlan).child(itemKey).ref.remove()
    this.db.database.ref("/recipes").child(this.currentPlan).child(recipeKey).once("value", 
    (snapshot) => {
      let value = snapshot.val()['ingredientNumber']
      value = value - 1;
      this.db.database.ref("/recipes").child(this.currentPlan).child(recipeKey).update({"ingredientNumber": value})
    })
  }
  addToFavourites(key) {
    //show toast message that recipe was added to favs
    this.hideAddToFavsToast = false;
    //set this recipe favourite to true
    this.db.database.ref("/recipes").child(this.currentPlan).child(key).update({ 'favourite': true })
    //get entire recipe node [child(key)]
    this.db.database.ref("/recipes").child(this.currentPlan).child(key).once("value",
      (snapshot) => {
        //and set it under favourite recipes
        this.db.database.ref("/favouriteRecipes").child(this.currentPlan).child(key).set(snapshot.val())
      })
    //get all ingredients from shopping list that are associated with this recipe
    this.db.database.ref("/shoppinglist").child(this.currentPlan).orderByChild("recipeId").equalTo(key).once("value",
      (snapshot) => {
        //if snapshot doesn't exist - if there are no ingredients to add to favourite ingredients
        if(snapshot.exists()){
        //and add them under favourite ingredients:
        this.db.database.ref("/favouriteIngredients").child(this.currentPlan).update(snapshot.val())
        }
      })
    //after 3 secs, hide toast message
    setTimeout(() => {
      this.hideAddToFavsToast = true;
    },
      3000);
  }
}
