import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { HabitsComponent } from './features/habits/habit-list/habits';
import { CategoriesComponent } from './features/categories/category/category';
import { TodayComponent } from './features/today/today';
import { ReportsComponent } from './features/reports/reports';
import { ReportDetailComponent } from './features/reports/report-detail';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'register',
    component: RegisterComponent
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],

    children: [

      {
        path: 'logs',
        component: TodayComponent
      },

      {
        path: 'today',
        redirectTo: 'logs',
        pathMatch: 'full'
      },

      {
        path: 'habits',
        component: HabitsComponent
      },

      {
        path: 'categories',
        component: CategoriesComponent
      },

      {
        path: 'reports',
        component: ReportsComponent
      },

      {
        path: 'reports/:id',
        component: ReportDetailComponent
      },

      {
        path: '',
        redirectTo: 'logs',
        pathMatch: 'full'
      }
    ]
  }
];
