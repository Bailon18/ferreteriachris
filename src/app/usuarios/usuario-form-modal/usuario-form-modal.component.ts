import { Component, EventEmitter, Output, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/core/services/usuario.service';
import swall from 'sweetalert2';
import { debounceTime, switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-usuario-form-modal',
  templateUrl: './usuario-form-modal.component.html',
  styleUrls: ['./usuario-form-modal.component.css']
})
export class UsuarioFormModalComponent implements OnInit, OnChanges {
  @Input() usuarioId: number | null = null;
  @Output() usuarioCreado = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  usuarioForm!: FormGroup;
  rolesDisponibles: string[] = ['ADMINISTRADOR', 'VENDEDOR'];
  originalEmail: string = '';
  originalUsername: string = '';
  originalDocument: string = '';

  constructor(private fb: FormBuilder, private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.initForm();
    this.setupAsyncValidators();
    if (this.usuarioId) {
      this.cargarUsuarioPorId(this.usuarioId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuarioId'] && this.usuarioId) {
      this.cargarUsuarioPorId(this.usuarioId);
    } else if (changes['usuarioId'] && !this.usuarioId && this.usuarioForm) {
      this.usuarioForm.reset({
        name: '',
        lastname: '',
        username: '',
        email: '',
        document: '',
        password: '',
        isActive: true,
        roles: ['VENDEDOR']
      });
    }
  }

  cargarUsuarioPorId(id: number) {
    this.usuarioService.getUsuarioPorId(id).subscribe(usuario => {
      this.usuarioForm.patchValue({
        ...usuario,
        roles: usuario.roles?.map((r: any) => r.rolName) || []
      });
      this.originalEmail = usuario.email;
      this.originalUsername = usuario.username;
      this.originalDocument = usuario.document;
    });
  }

  initForm() {
    this.usuarioForm = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/)]],
      lastname: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/)]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      document: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      isActive: [true],
      roles: [['VENDEDOR'], Validators.required]
    });
  }

  setupAsyncValidators() {
    // Validación asíncrona de correo
    this.usuarioForm.get('email')?.valueChanges.pipe(
      debounceTime(400),
      switchMap(email => {
        if (this.usuarioId && email === this.originalEmail) {
          // No validar si es el mismo email original
          return [false];
        }
        return this.usuarioService.existeCorreo(email);
      })
    ).subscribe(existe => {
      const control = this.usuarioForm.get('email');
      if (control && control.value) {
        if (existe) {
          control.setErrors({ ...control.errors, correoExiste: true });
        } else {
          if (control.errors) {
            delete control.errors['correoExiste'];
            if (Object.keys(control.errors).length === 0) {
              control.setErrors(null);
            } else {
              control.setErrors(control.errors);
            }
          }
        }
      }
    });

    // Validación asíncrona de documento
    this.usuarioForm.get('document')?.valueChanges.pipe(
      debounceTime(400),
      switchMap(document => {
        if (this.usuarioId && document === this.originalDocument) {
          return [false];
        }
        return this.usuarioService.existeDocumento(document);
      })
    ).subscribe(existe => {
      const control = this.usuarioForm.get('document');
      if (control && control.value) {
        if (existe) {
          control.setErrors({ ...control.errors, documentoExiste: true });
        } else {
          if (control.errors) {
            delete control.errors['documentoExiste'];
            if (Object.keys(control.errors).length === 0) {
              control.setErrors(null);
            } else {
              control.setErrors(control.errors);
            }
          }
        }
      }
    });

    // Validación asíncrona de username
    this.usuarioForm.get('username')?.valueChanges.pipe(
      debounceTime(400),
      switchMap(username => {
        if (this.usuarioId && username === this.originalUsername) {
          return [false];
        }
        return this.usuarioService.existeUsername(username);
      })
    ).subscribe(existe => {
      const control = this.usuarioForm.get('username');
      if (control && control.value) {
        if (existe) {
          control.setErrors({ ...control.errors, usernameExiste: true });
        } else {
          if (control.errors) {
            delete control.errors['usernameExiste'];
            if (Object.keys(control.errors).length === 0) {
              control.setErrors(null);
            } else {
              control.setErrors(control.errors);
            }
          }
        }
      }
    });
  }

  cerrarModal() {
    this.cerrar.emit();
  }

  onSubmitUsuario() {
    if (this.usuarioForm.valid) {
      const usuarioData = this.usuarioForm.value;
      this.usuarioService.crearUsuario(usuarioData).subscribe({
        next: () => {
          this.usuarioForm.reset();
          swall.fire({
            icon: 'success',
            title: this.usuarioId ? '¡Usuario actualizado!' : '¡Usuario creado!',
            text: this.usuarioId ? 'El usuario fue actualizado correctamente.' : 'El usuario fue registrado correctamente.',
            confirmButtonColor: '#1976d2'
          }).then(() => {
            this.usuarioCreado.emit();
            this.cerrar.emit();
          });
        },
        error: (err) => {
          swall.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo guardar el usuario. Intenta nuevamente.',
            confirmButtonColor: '#d33'
          });
        }
      });
    } else {
      this.usuarioForm.markAllAsTouched();
    }
  }
}
