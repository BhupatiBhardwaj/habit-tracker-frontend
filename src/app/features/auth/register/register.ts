import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AppIconComponent } from '../../../core/components/app-icon';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, AppIconComponent],
  templateUrl: './register.html'
})
export class RegisterComponent {

  name = '';
  email = '';
  password = '';
  loading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register() {

    this.loading = true;
    const payload = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    this.authService.register(payload)
      .subscribe({
        next: (response: any) => {
          this.authService.saveToken(response.token);
          this.router.navigate(['/habits']);
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