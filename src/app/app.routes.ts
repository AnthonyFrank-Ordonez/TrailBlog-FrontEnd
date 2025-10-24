import { Routes } from '@angular/router';
import { Layout } from '@shared/components/layout/layout';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Communities } from './pages/communities/communities';
import { authGuard } from './core/guards/auth-guard';
import { noAuthGuard } from './core/guards/no-auth-guard';
import { CreatePost } from '@pages/create-post/create-post';
import { PostDetail } from '@pages/post-detail/post-detail';

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
      {
        path: 'communities',
        component: Communities,
        canActivate: [authGuard],
      },
      {
        path: 'create',
        component: CreatePost,
        canActivate: [authGuard],
      },
      {
        path: 'post/:slug',
        component: PostDetail,
      },
    ],
  },
  {
    path: 'login',
    component: Login,
    canActivate: [noAuthGuard],
  },
  {
    path: 'register',
    component: Register,
    canActivate: [noAuthGuard],
  },
];
