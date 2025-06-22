import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoDetailModalComponent } from './producto-detail-modal.component';

describe('ProductoDetailModalComponent', () => {
  let component: ProductoDetailModalComponent;
  let fixture: ComponentFixture<ProductoDetailModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductoDetailModalComponent]
    });
    fixture = TestBed.createComponent(ProductoDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
