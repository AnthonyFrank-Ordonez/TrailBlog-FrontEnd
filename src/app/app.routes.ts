import { Routes } from '@angular/router';
import { Layout } from '@shared/components/layout/layout';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { authGuard } from './core/guards/auth-guard';
import { noAuthGuard } from './core/guards/no-auth-guard';
import { CreatePost } from '@pages/create-post/create-post';
import { PostDetail } from '@pages/post-detail/post-detail';
import { Popular } from '@pages/popular/popular';
import { ManageCommunities } from '@pages/manage-communities/manage-communities';
import { PageNotFound } from '@pages/page-not-found/page-not-found';
import { Explore } from '@pages/explore/explore';
import { About } from '@pages/about/about';
import { Drafts } from '@pages/drafts/drafts';

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
        path: 'popular',
        component: Popular,
      },
      {
        path: 'communities',
        component: ManageCommunities,
        canActivate: [authGuard],
      },
      {
        path: 'create',
        component: CreatePost,
        canActivate: [authGuard],
      },
      {
        path: 'explore',
        component: Explore,
      },
      {
        path: 'drafts',
        component: Drafts,
        canActivate: [authGuard],
      },
      {
        path: 'about',
        component: About,
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
  {
    path: '**',
    component: PageNotFound,
  },
];
