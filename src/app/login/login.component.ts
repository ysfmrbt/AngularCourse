import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { MessageService } from 'primeng/api';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast'; // Needed for MessageService

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    PasswordModule,
    ToastModule, // Import ToastModule
  ],
  // providers: [MessageService], // MessageService provided globally
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  returnUrl: string = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Get return url from route parameters or default to '/dashboard'
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    this.loginForm = this.fb.group({
      username: ['admin', [Validators.required]], // Default value for demo
      password: ['password', [Validators.required]], // Default value for demo
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please fill in all fields.',
      });
      // Mark fields as touched to show validation errors
      Object.values(this.loginForm.controls).forEach((control) => {
        control.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (success) => {
        this.loading = false;
        if (success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Login Successful',
            detail: 'Welcome!',
          });
          // Navigate to returnUrl after a short delay to allow toast visibility
          setTimeout(() => this.router.navigate([this.returnUrl]), 500);
        }
        // We shouldn't get here if login fails due to error handling below
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: err.message || 'Incorrect username or password.',
        });
      },
    });
  }
}
