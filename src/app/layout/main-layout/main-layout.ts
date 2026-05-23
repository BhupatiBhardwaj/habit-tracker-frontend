import { Component } from '@angular/core';
import {
  RouterLink,
  RouterOutlet,
  RouterLinkActive
} from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [
  RouterOutlet,
  RouterLink,
  RouterLinkActive
],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayoutComponent {}
