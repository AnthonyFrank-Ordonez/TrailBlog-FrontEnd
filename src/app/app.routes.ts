import { Routes } from '@angular/router';
import { Layout } from './shared/components/layout/layout';
import { Home } from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: Home,
      },
    ],
  },
];
