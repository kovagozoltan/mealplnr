import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppinglistPageComponent } from './shoppinglist-page.component';

describe('ShoppinglistPageComponent', () => {
  let component: ShoppinglistPageComponent;
  let fixture: ComponentFixture<ShoppinglistPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShoppinglistPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShoppinglistPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
