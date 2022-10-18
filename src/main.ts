import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import VConsole from 'vconsole';
import { AppConfig } from './app/app.config';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import * as firebaseui from 'firebaseui';
import './../node_modules/firebaseui/dist/firebaseui.css';

(window as any).firebaseui = firebaseui;

(async () => {
  // const vConsole = new VConsole();
  // or init with options
  // const vConsole = new VConsole({ maxLogNumber: 1000 });

  if (environment.production) {
    enableProdMode();
  }

  await AppConfig.init();

  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.log(err));
})();
