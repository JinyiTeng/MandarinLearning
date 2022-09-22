import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EnglishListPage } from './english-list.page';

const routes: Routes = [
  {
    path: '',
    component: EnglishListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EnglishListPageRoutingModule {}
