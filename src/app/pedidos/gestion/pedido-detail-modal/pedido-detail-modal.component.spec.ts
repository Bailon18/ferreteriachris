import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoDetailModalComponent } from './pedido-detail-modal.component';

describe('PedidoDetailModalComponent', () => {
  let component: PedidoDetailModalComponent;
  let fixture: ComponentFixture<PedidoDetailModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PedidoDetailModalComponent]
    });
    fixture = TestBed.createComponent(PedidoDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
