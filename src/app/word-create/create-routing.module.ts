import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WordCreatePage } from './create.page';

const routes: Routes = [
  {
    path: '',
    component: WordCreatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WordCreatePageRoutingModule {}
