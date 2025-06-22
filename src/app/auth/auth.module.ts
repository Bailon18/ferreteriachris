import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthModalComponent } from './auth-modal/auth-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ChangepasswordComponent } from './changepassword/changepassword.component';

@NgModule({
  declarations: [
    AuthModalComponent,
    ChangepasswordComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    AuthModalComponent,
    MatDialogModule
  ]
})
export class AuthModule { }
