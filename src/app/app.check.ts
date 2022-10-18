import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivate,
  Router,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { AppConfig } from './app.config';


@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    let url: string = state.url;

    console.log('url =>', url);

    if (AppConfig.isLogin()) {
      return of(true);
    }

    this.router.navigateByUrl('/login');
    return of(false);
  }
}
