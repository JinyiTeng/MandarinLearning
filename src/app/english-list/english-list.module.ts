import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EnglishListPageRoutingModule } from './english-list-routing.module';

import { EnglishListPage } from './english-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EnglishListPageRoutingModule
  ],
  declarations: [EnglishListPage]
})
export class EnglishListPageModule {}
