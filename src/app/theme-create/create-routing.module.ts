import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ThemeCreatePage } from './create.page';

const routes: Routes = [
  {
    path: '',
    component: ThemeCreatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThemeCreatePageRoutingModule {}
