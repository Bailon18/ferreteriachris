import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoListClienteComponent } from './pedido-list-cliente.component';

describe('PedidoListClienteComponent', () => {
  let component: PedidoListClienteComponent;
  let fixture: ComponentFixture<PedidoListClienteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PedidoListClienteComponent]
    });
    fixture = TestBed.createComponent(PedidoListClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
