import { ActivatedRouteSnapshot, CanActivateFn, CanMatchFn, Route, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

const chekcAuthStatus = (): boolean | Observable<boolean> => {

  const authService: AuthService = inject(AuthService);
  const route: Router = inject(Router);

  return authService.checkStatus()
    .pipe(
      tap((isAuthenticated) => {
        if ( isAuthenticated) {
          route.navigate(['./'])
        }
      }),
      map( isAuthenticated => !isAuthenticated )
    )

}

export const publicCanActivate: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  return chekcAuthStatus();
};

export const publicCanMatch: CanMatchFn = (
  route: Route,
  segments: UrlSegment[]
) => {
  return chekcAuthStatus();
};
