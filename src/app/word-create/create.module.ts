import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { IonicModule } from '@ionic/angular';

import { WordCreatePageRoutingModule } from './create-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { WordCreatePage } from './create.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WordCreatePageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [WordCreatePage]
})
export class WordCreatePageModule {}
