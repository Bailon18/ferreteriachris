import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangePasswordDTO } from '../model/changePsswordDTO';
import swall from 'sweetalert2';
import { ChangePasswordService } from 'src/app/core/services/changepassword.service';


@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css']
})
export class ChangepasswordComponent implements OnInit {

  token: string;
  userId: number;
  validotoken: boolean = false;
  formularioCambiarContrasena: FormGroup;
  changePasswordDto: ChangePasswordDTO;

  constructor(
    private formBuilder: FormBuilder,
    private router: ActivatedRoute,
    private changePasswordService: ChangePasswordService,
    private route : Router
  ) { 

    this.changePasswordDto = {
      password: '',
      confirmPassword: '',
      tokenPassword: ''
    };
  }

  ngOnInit(): void {
    this.router.queryParams.subscribe(params => {
      this.token = params['tokenPassword'];
    });
  
    this.formularioCambiarContrasena = this.formBuilder.group({
      nuevaContrasena: ['', [Validators.required, Validators.minLength(5)]],
      confirmarNuevaContrasena: ['', Validators.required]
    });
  }
  
  cambiarContrasena() {
    if (this.formularioCambiarContrasena.valid) {
      const nuevaContrasena = this.formularioCambiarContrasena.get('nuevaContrasena')?.value;
      const confirmarContrasena = this.formularioCambiarContrasena.get('confirmarNuevaContrasena')?.value;
  
      if (nuevaContrasena !== confirmarContrasena) {
        swall.fire({
          icon: 'error',
          title: 'Error',
          text: 'Las contraseñas no coinciden',
          confirmButtonText: 'Aceptar'
        });
        return;
      }
  
      this.changePasswordDto.password = nuevaContrasena;
      this.changePasswordDto.confirmPassword = confirmarContrasena;
      this.changePasswordDto.tokenPassword = this.token;
  
      swall.fire({
        html: 'Cambiando contraseña...',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          swall.showLoading();
        }
      });
  
      this.changePasswordService.changePassword(this.changePasswordDto).subscribe({
        next: response => {
          swall.close();
  
          if (response.status !== "BAD_REQUEST") {
            swall.fire({
              icon: 'success',
              text: response.message,
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#0275d8',
            });
  
            this.inicio();
          } else {
            swall.fire({
              icon: 'error',
              text: response.message,
              confirmButtonText: 'Aceptar'
            });
          }
        },
        error: err => {
          swall.close(); 
  
          swall.fire({
            icon: 'error',
            text: "Ocurrió un error",
            confirmButtonText: 'Aceptar'
          });
        }
      });
    }
  }
  
  
  inicio(){
    this.route.navigate(['/productos'])
  }

  recuperarContrasenaUsuario(correo: string, username: string) {
    swall.fire({
      html: 'Enviando correo...',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        swall.showLoading();
      }
    });
    this.changePasswordService.recuperarContrasena(correo, username).subscribe({
      next: (resp) => {
        swall.fire({
          html: `Se ha enviado un correo electrónico a <strong>${correo}</strong> con los pasos para recuperar la contraseña.`,
          icon: 'success',
          confirmButtonColor: '#0275d8',
        });
        this.route.navigate(['/productos']);
      },
      error: (err) => {
        swall.close();
        if (err.status === 404 && err.error && typeof err.error === 'string') {
          if (err.error.includes('no existe')) {
            swall.fire({
              icon: 'error',
              text: 'El correo no está registrado como usuario.',
              confirmButtonText: 'Aceptar'
            });
          } else if (err.error.includes('no está activo')) {
            swall.fire({
              icon: 'error',
              text: 'El usuario está inactivo, comuníquese con el administrador.',
              confirmButtonText: 'Aceptar'
            });
          } else {
            swall.fire({
              icon: 'error',
              text: 'Ocurrió un error al recuperar la contraseña.',
              confirmButtonText: 'Aceptar'
            });
          }
        } else {
          swall.fire({
            icon: 'error',
            text: 'Ocurrió un error al recuperar la contraseña.',
            confirmButtonText: 'Aceptar'
          });
        }
      }
    });
  }

  verificarCorreoUsuario(correo: string) {
    this.changePasswordService.existeCorreoUsuario(correo).subscribe({
      next: (resp) => {
        console.log(resp);
        // Usuario existe y está activo
        // Aquí puedes continuar con el flujo normal
      },
      error: (err) => {
        console.log(err.error);
        if (err.status === 404 && err.error && typeof err.error === 'string' && err.error.includes('no existe')) {
          swall.fire({
            icon: 'error',
            text: 'El correo no está registrado como usuario.',
            confirmButtonText: 'Aceptar'
          });
        } else if (err.status === 403 && err.error && typeof err.error === 'string' && err.error.includes('no está activo')) {
          swall.fire({
            icon: 'error',
            text: 'El usuario está inactivo, comuníquese con el administrador.',
            confirmButtonText: 'Aceptar'
          });
        } else {
          swall.fire({
            icon: 'error',
            text: 'Ocurrió un error al verificar el correo electrónico.',
            confirmButtonText: 'Aceptar'
          });
        }
      }
    });
  }

}
