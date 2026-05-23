import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html'
})
export class RegisterComponent {

  name = '';
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register() {
    const payload = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    this.authService.register(payload)
      .subscribe({
        next: (response: any) => {
          this.authService.saveToken(response.token);
          this.router.navigate(['/logs']);
        },
        error: (error) => {
          console.log(error);
        }
      });
  }
}