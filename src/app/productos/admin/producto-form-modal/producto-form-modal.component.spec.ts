import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoFormModalComponent } from './producto-form-modal.component';

describe('ProductoFormModalComponent', () => {
  let component: ProductoFormModalComponent;
  let fixture: ComponentFixture<ProductoFormModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductoFormModalComponent]
    });
    fixture = TestBed.createComponent(ProductoFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
