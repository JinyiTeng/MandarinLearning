import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './app.check';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'folder/Inbox',
    // redirectTo: 'read',
    pathMatch: 'full',
  },
  {
    path: 'folder/:id',
    loadChildren: () =>
      import('./folder/folder.module').then((m) => m.FolderPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'english-list',
    loadChildren: () =>
      import('./english-list/english-list.module').then(
        (m) => m.EnglishListPageModule
      ),
  },
  {
    path: 'word-info',
    loadChildren: () =>
      import('./word-info/word-info.module').then((m) => m.WordInfoPageModule),
  },
  {
    path: 'word-create',
    loadChildren: () =>
      import('./word-create/create.module').then((m) => m.WordCreatePageModule),
  },
  {
    path: 'theme',
    loadChildren: () =>
      import('./theme/theme.module').then((m) => m.ThemePageModule),
  },
  {
    path: 'theme-create',
    loadChildren: () =>
      import('./theme-create/create.module').then(
        (m) => m.ThemeCreatePageModule
      ),
  },
  {
    path: 'read',
    loadChildren: () =>
      import('./read/read.module').then((m) => m.ReadPageModule),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./register/register.module').then((m) => m.RegisterPageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
