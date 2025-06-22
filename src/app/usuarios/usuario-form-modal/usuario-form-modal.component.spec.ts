import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioFormModalComponent } from './usuario-form-modal.component';

describe('UsuarioFormModalComponent', () => {
  let component: UsuarioFormModalComponent;
  let fixture: ComponentFixture<UsuarioFormModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UsuarioFormModalComponent]
    });
    fixture = TestBed.createComponent(UsuarioFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
