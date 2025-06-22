import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { ClienteService } from 'src/app/core/services/cliente.service';
import { Observable, of, catchError } from 'rxjs';
import { map, debounceTime, switchMap, first } from 'rxjs/operators';
import { Cliente } from 'src/app/modals/cliente.model';
import swall from 'sweetalert2';
import { TokenService } from 'src/app/core/services/token.service'; 
import { ChangePasswordService } from 'src/app/core/services/changepassword.service';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/core/services/usuario.service';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent implements OnInit {
  
  @Output() close = new EventEmitter<void>();
  @Output() registroExitoso = new EventEmitter<void>();
  @Output() alerta = new EventEmitter<{mensaje: string, titulo?: string, icono?: any}>();
  mostrarPassword = false;
  vista: 'login' | 'registro' | 'recuperar' = 'login';
  loginForm!: FormGroup;
  registroForm!: FormGroup;
  formularioRecuperar!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private tokenService: TokenService,
    private changePasswordService: ChangePasswordService,
    private router: Router,
    private usuarioService: UsuarioService
    ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required]],
      contrasena: ['', [Validators.required]]
    });

    this.formularioRecuperar = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.registroForm = this.fb.group({
      nombre: ['user', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/)]],
      apellido: ['paucar montes', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/)]],
      correo: ['user@gmail.com', [Validators.required, Validators.email]],
      contrasena: ['123456', [Validators.required, Validators.minLength(6)]],
      telefono: ['987654321', [Validators.required, Validators.pattern(/^[0-9]{9,}$/)]],
      documentoIdentidad: ['12345678', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
      direccion: ['Av. Lima 123', [Validators.required, Validators.minLength(4)]]
    });
  }

  validarCorreo(event: any) {
    console.log("validarCorreo escuchando",event);
    const correoFormControl = this.registroForm.get('correo');
    if (correoFormControl?.valid) {
      const nuevoCorreo = (event.target as HTMLInputElement).value;
      this.clienteService.existeCorreo(nuevoCorreo).subscribe(res => {
        console.log("existeCorreo escuchando",res);
        // devuelve true
        if (res) {
          correoFormControl.setErrors({ ...correoFormControl.errors, correoExiste: true });
        } else {
          if (correoFormControl.errors) {
            delete correoFormControl.errors['correoExiste'];
            if (Object.keys(correoFormControl.errors).length === 0) {
              correoFormControl.setErrors(null);
            } else {
              correoFormControl.setErrors(correoFormControl.errors);
            }
          }
        }
      });
    }
  }

  validarDocumento(event: any) {

    console.log("validarDocumento escuchando",event);
    const docFormControl = this.registroForm.get('documentoIdentidad');
    if (docFormControl?.valid) {
      const nuevoDoc = (event.target as HTMLInputElement).value;
      this.clienteService.existeDocumento(nuevoDoc).subscribe(res => {
        console.log("existeDocumento escuchando",res);
        // devuelve true
        if (res) {
          docFormControl.setErrors({ ...docFormControl.errors, documentoExiste: true });
        } else {
          if (docFormControl.errors) {
            delete docFormControl.errors['documentoExiste'];
            if (Object.keys(docFormControl.errors).length === 0) {
              docFormControl.setErrors(null);
            } else {
              docFormControl.setErrors(docFormControl.errors);
            }
          }
        }
      });
    }
  }

  cerrar() {
    this.close.emit();
  }

  mostrarLogin() {
    this.vista = 'login';
    this.loginForm.reset();
  }
  mostrarRegistro() {
    this.vista = 'registro';
    //this.registroForm.reset();
  }
  mostrarRecuperar() {
    this.vista = 'recuperar';
  }

  onSubmitRegistro() {
    if (this.registroForm.valid) {
      const cliente: Cliente = this.registroForm.value;
      this.clienteService.agregarCliente(cliente).subscribe({
        next: (resp) => {
          this.registroForm.reset();
          this.vista = 'login';
          this.registroExitoso.emit();
          this.alerta.emit({
            mensaje: '¡Registro exitoso! Ahora puedes iniciar sesión.',
            titulo: '¡Bienvenido!',
            icono: 'success'
          });
        },
        error: (err) => {
          swall.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo registrar el cliente. Intenta nuevamente.',
            confirmButtonColor: '#d33'
          });
        }
      });
    } else {
      console.log("Errores de validación:", this.registroForm.errors, this.registroForm);
      this.registroForm.markAllAsTouched(); 
    }
  }

  onSubmitLogin() {
    const correo = this.loginForm.get('correo')?.value;
    const password = this.loginForm.get('contrasena')?.value;
    const loginUser = { correo, password };

    // First try to login as a client
    this.clienteService.login(loginUser).subscribe({
      next: (resp) => {
        console.log("cliente login",resp);
        this.tokenService.loginSuccess(resp.token, resp.nombreApellido, resp.roles, resp.id);
        this.registroExitoso.emit();
        this.cerrar();
        this.loginForm.reset();
        this.vista = 'login';
        this.router.navigate(['/productos']);
      },
      error: (err) => {
      
        this.usuarioService.login(loginUser).subscribe({
          next: (userResp: any) => {
            console.log("usuario login",userResp);
            this.tokenService.loginSuccess(userResp.token, userResp.nombreApellido, userResp.roles, userResp.id);
            this.registroExitoso.emit();
            this.cerrar();
            this.loginForm.reset();
            this.vista = 'login';
            this.router.navigate(['/administracion']);
          },
          error: (userErr) => {
            swall.fire({
              icon: 'error',
              title: 'Error',
              text: 'Credenciales incorrectas. Intenta nuevamente.',
              confirmButtonColor: '#d33'
            });
          }
        });
      }
    });
  }

  onSubmitRecuperar() {
    if (this.formularioRecuperar.valid) {
      const email = this.formularioRecuperar.value.email;
      // Primero verifica si existe como cliente
      this.changePasswordService.existeCorreoCliente(email).subscribe({
        next: (esCliente) => {
          if (esCliente) {
            this.enviarCorreoRecuperacion(email, 'cliente');
            console.log("esCliente");
          } else {
            // Si no es cliente, verifica si existe como usuario
            this.changePasswordService.existeCorreoUsuario(email).subscribe({
              next: (esUsuario) => {
                console.log("esUsuario", esUsuario);
                if (esUsuario) {
                  this.enviarCorreoRecuperacion(email, esUsuario.username);
                } else {
                  swall.fire({
                    html: `El correo electrónico no existe en la aplicación`,
                    icon: 'error',
                    confirmButtonColor: '#d80227',
                  });
                }
              },
              error: (error) => {
                let mensaje = 'Ocurrió un error al verificar el correo electrónico.';
                if (error.status === 404 && typeof error.error === 'string' && error.error.includes('no existe')) {
                  mensaje = 'El correo no está registrado como usuario.';
                } else if (error.status === 403 && typeof error.error === 'string' && error.error.includes('no está activo')) {
                  mensaje = 'El usuario está inactivo, comuníquese con el administrador.';
                }
                swall.fire({
                  html: mensaje,
                  icon: 'error',
                  confirmButtonColor: '#d80227',
                });
              }
            });
          }
        },
        error: (error) => {
          swall.fire({
            html: 'Ocurrió un error al verificar el correo electrónico.',
            icon: 'error',
            confirmButtonColor: '#d80227',
          });
        }
      });
    }
  }

  private enviarCorreoRecuperacion(email: string, username: string) {
    swall.fire({
      html: 'Enviando correo...',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        swall.showLoading();
      }
    });
    this.changePasswordService.recuperarContrasena(email, username).subscribe({
      next: (resp) => {
        swall.fire({
          html: `Se ha enviado un correo electrónico a <strong>${email}</strong> con los pasos para recuperar la contraseña.`,
          icon: 'success',
          confirmButtonColor: '#0275d8',
        });
        this.router.navigate(['/productos']);
        this.cerrar();
      },
      error: (err) => {
        swall.fire({
          html: 'Ocurrió un error al enviar el correo electrónico. Por favor, inténtelo de nuevo más tarde.',
          icon: 'error',
          confirmButtonColor: '#d80227',
        });
      },
    });
  }
}
