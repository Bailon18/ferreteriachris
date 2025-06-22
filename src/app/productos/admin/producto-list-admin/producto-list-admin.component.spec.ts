import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoListAdminComponent } from './producto-list-admin.component';

describe('ProductoListAdminComponent', () => {
  let component: ProductoListAdminComponent;
  let fixture: ComponentFixture<ProductoListAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductoListAdminComponent]
    });
    fixture = TestBed.createComponent(ProductoListAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
