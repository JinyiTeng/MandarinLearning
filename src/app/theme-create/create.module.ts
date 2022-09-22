import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { IonicModule } from '@ionic/angular';

import { ThemeCreatePageRoutingModule } from './create-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ThemeCreatePage } from './create.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ThemeCreatePageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [ThemeCreatePage]
})
export class ThemeCreatePageModule {}
