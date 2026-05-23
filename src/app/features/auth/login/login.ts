import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {

    const payload = {
      email: this.email,
      password: this.password
    };

    this.authService.login(payload)
      .subscribe({
        next: (response: any) => {

          this.authService.saveToken(response.token);

          console.log(response);

          // Later redirect to dashboard
          this.router.navigate(['/logs']);
        },

        error: (error) => {

          console.log(error);
        }
      });
  }
}