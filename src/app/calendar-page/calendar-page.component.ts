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
  currentUserID;
  currentDay;
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
    this.currentUserID = localStorage.getItem('currentUserID');
    this.currentDay = 'monday';
    this.myIngredients = this.db.list("/shoppinglist/" + this.currentUserID).valueChanges()
    this.myRecipes = this.db.list('/recipes/' + this.currentUserID, ref => {
      // filter ref here ex: orderByChild(X).equalTo(Y)
      let q = ref.orderByChild("day").equalTo(this.currentDay);
      return q;
    }).valueChanges();
  }
  getRecipes(day) {
    this.currentDay = day;
    this.myIngredients = this.db.list("/shoppinglist/" + this.currentUserID).valueChanges()
    this.myRecipes = this.db.list('/recipes/' + this.currentUserID, ref => {
      // filter ref here ex: orderByChild(X).equalTo(Y)
      let q = ref.orderByChild("day").equalTo(day);
      return q;
    }).valueChanges();
  }
  addRecipe() {
    if (this.recipeToAdd && this.recipeToAdd.length > 0) {
      let ref = this.db.database.ref("/recipes").child(this.currentUserID).push();
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
    this.db.database.ref("/recipes").child(this.currentUserID).child(key).remove();
    // remove ingredient from shopping list, from current user that matches the recipe removed ^^
    this.db.database.ref("/shoppinglist").child(this.currentUserID).orderByChild('recipeId').equalTo(key).once("value",
      (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          this.db.database.ref("/shoppinglist").child(this.currentUserID).child(childSnapshot.key).ref.remove()
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
    this.db.database.ref("/recipes").child(this.currentUserID).child(key).child("note").once("value",
      (snapshot) => {
        this.noteToAdd = snapshot.val();
      });
  }
  addIngredient(ingredient) {
    if (this.ingredientToAdd && this.ingredientToAdd.length > 0) {

      let ref = this.db.database.ref("/shoppinglist").child(this.currentUserID).push()
      let key = ref.key;
      ref.set({
        'title': this.ingredientToAdd,
        'quantity': this.quantityToAdd,
        'units': this.units,
        'recipeId': this.currentRecipe,
        'key': key,
        'bought': false
      })
      this.db.database.ref("/recipes").child(this.currentUserID).child(this.currentRecipe).once("value", 
      (snapshot) => {
        let value = snapshot.val()['ingredientNumber']
        value = value + 1;
        this.db.database.ref("/recipes").child(this.currentUserID).child(this.currentRecipe).update({"ingredientNumber": value})
      })
      this.ingredientToAdd = null;
      this.quantityToAdd = 1;
    }
  }
  addNote(note) {
    let ref = this.db.database.ref("/recipes").child(this.currentUserID).child(this.currentRecipe).update({ 'note': note })
  }
  removeIngredient(itemKey, recipeKey) {
    this.db.database.ref("/shoppinglist").child(this.currentUserID).child(itemKey).ref.remove()
    this.db.database.ref("/recipes").child(this.currentUserID).child(recipeKey).once("value", 
    (snapshot) => {
      let value = snapshot.val()['ingredientNumber']
      value = value - 1;
      this.db.database.ref("/recipes").child(this.currentUserID).child(recipeKey).update({"ingredientNumber": value})
    })
  }
  addToFavourites(key) {
    //show toast message that recipe was added to favs
    this.hideAddToFavsToast = false;
    this.db.database.ref("/recipes").child(this.currentUserID).child(key).update({ 'favourite': true })

    this.db.database.ref("/recipes").child(this.currentUserID).child(key).once("value",
      (snapshot) => {
        this.db.database.ref("/favouriteRecipes").child(this.currentUserID).child(key).set(snapshot.val())
      })

    this.db.database.ref("/shoppinglist").child(this.currentUserID).orderByChild("recipeId").equalTo(key).once("value",
      (snapshot) => {
        this.db.database.ref("/favouriteIngredients").child(this.currentUserID).update(snapshot.val())
      })

    //after 3 secs, hide toast message
    setTimeout(() => {
      this.hideAddToFavsToast = true;
    },
      3000);
  }
}
