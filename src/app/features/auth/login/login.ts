import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppIconComponent } from '../../../core/components/app-icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, AppIconComponent],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  email = '';
  password = '';
  loading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    this.loading = true;

    const payload = {
      email: this.email,
      password: this.password
    };

    this.authService.login(payload)
      .subscribe({
        next: (response: any) => {

          this.authService.saveToken(response.token);
          console.log(response);
          this.router.navigate(['/logs']);
          this.loading = false;
        },

        error: (error) => {
          console.log(error);
          this.errorMessage = error.error.message;
          this.loading = false;
        }
      });
  }
}