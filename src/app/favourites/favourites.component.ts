import { Component, OnInit } from '@angular/core';
import { AuthService } from '../providers/auth.service';
import { AngularFireDatabase } from 'angularfire2/database';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-favourites',
  templateUrl: './favourites.component.html',
  styleUrls: ['./favourites.component.css']
})
export class FavouritesComponent implements OnInit {

  currentUserID;
  myIngredients;
  myRecipes;
  noteToAdd;
  showHideOverlay;
  showHideAddNote;
  showHideAddIngredient;
  showHideAddToDay;
  currentRecipe;
  currentRecipeTitle;
  currentRecipeIngredientsNumber;
  ingredientToAdd;
  quantityToAdd: Number = 1;
  units;

  hideIngredients:any = {};
  hideMealMenu:any = {};

  constructor(private authService: AuthService, public db: AngularFireDatabase) { }

  ngOnInit() {
    this.currentUserID = localStorage.getItem('currentUserID');
    this.myIngredients = this.db.list("/favouriteIngredients/" + this.currentUserID).valueChanges()
    this.myRecipes = this.db.list('/favouriteRecipes/' + this.currentUserID).valueChanges();
  }
  removeRecipe(key) {
    if (window.confirm('Are sure you want to delete this recipe from favourites?')) {
      // remove ingredient from shopping list, from current user that matches the recipe removed
      this.db.database.ref("/favouriteIngredients").child(this.currentUserID).orderByChild('recipeId').equalTo(key).once("value",
        (snapshot) => {
          snapshot.forEach((childSnapshot) => {
            this.db.database.ref("/favouriteIngredients").child(this.currentUserID).child(childSnapshot.key).ref.remove()
          })
        })
      //remove recipe from curent user, that has id of
      this.db.database.ref("/favouriteRecipes").child(this.currentUserID).child(key).remove();
      //check if this recipe exists in calendar
      this.db.database.ref("/recipes").child(this.currentUserID).child(key).once("value",
      (snapshot) =>{
        //if snapshot exists - if recipe exists
        if(snapshot.exists){
          //set recipe favourite value to false - so it shows as not in favs in calendar
          this.db.database.ref("/recipes").child(this.currentUserID).child(key).update({'favourite': false});
        }
      })
    }
    this.noteToAdd = null;
  }
  removeIngredient(key) {
    this.db.database.ref("/favouriteIngredients").child(this.currentUserID).child(key).ref.remove()
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
    this.db.database.ref("/favouriteRecipes").child(this.currentUserID).child(key).child("note").once("value",
      (snapshot) => {
        this.noteToAdd = snapshot.val();
      });
  }
  showAddToDay(key, recipeTitle, ingredientsNumber) {
    this.showHideOverlay = 'show';
    this.showHideAddToDay = 'show';
    this.currentRecipe = key;
    this.currentRecipeTitle = recipeTitle;
    this.currentRecipeIngredientsNumber = ingredientsNumber
  }
  addIngredient(ingredient) {
    if (this.ingredientToAdd && this.ingredientToAdd.length > 0) {
      let ref = this.db.database.ref("/favouriteIngredients").child(this.currentUserID).push()
      let key = ref.key;
      ref.set({
        'title': this.ingredientToAdd,
        'quantity': this.quantityToAdd,
        'units': this.units,
        'recipeId': this.currentRecipe,
        'key': key,
        'bought': false
      })
      this.db.database.ref("/favouriteRecipes").child(this.currentUserID).child(this.currentRecipe).once("value", 
      (snapshot) => {
        let value = snapshot.val()['ingredientNumber']
        value = value + 1;
        this.db.database.ref("/favouriteRecipes").child(this.currentUserID).child(this.currentRecipe).update({"ingredientNumber": value})
      })
      this.ingredientToAdd = null;
      this.quantityToAdd = 1;
    }
  }
  addNote(note) {
    let ref = this.db.database.ref("/favouriteRecipes").child(this.currentUserID).child(this.currentRecipe).update({ 'note': note })
  }
  addToDay(day) {
    console.log(day);
    let ref = this.db.database.ref("/recipes").child(this.currentUserID).push();
    let key = ref.key;
    ref.set({
      'day': day,
      'favourite': false,
      'ingredientNumber': this.currentRecipeIngredientsNumber,
      'key': key,
      'note': "",
      'title': this.currentRecipeTitle
    })
    this.db.database.ref("/favouriteIngredients").child(this.currentUserID).orderByChild("recipeId").equalTo(this.currentRecipe).once("value",
      (snapshot) => {
        let tempVar: any = Object.values(snapshot.val())
        for (let i = 0; i < tempVar.length; i++) {
          let originalObj = tempVar[i];
          let ref = this.db.database.ref("/shoppinglist").child(this.currentUserID).push()
          let subKey = ref.key;
          ref.set({
            'title': originalObj['title'],
            'quantity': originalObj['quantity'],
            'units': originalObj['units'],
            'recipeId': key,
            'key': subKey,
            'bought': originalObj['bought']
          })
        }
      })
  }
}
