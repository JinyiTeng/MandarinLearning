import { Store, StoreConfig } from '@datorama/akita';
import { Injectable } from '@angular/core';

export interface AppState {
  sess: any;
  isLogin: boolean;
  lang: string;
  debug: boolean;
}

export function createInitialState(): AppState {
  return {
    sess: null,
    isLogin: false,
    lang: 'en',
    debug: true,
  };
}

@Injectable({
  providedIn: 'root',
})
@StoreConfig({ name: 'app_state' })
export class AppStore extends Store<AppState> {
  constructor() {
    super(createInitialState());
  }
}


