import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return from(this.afAuth.currentUser).pipe(
      switchMap(user => {
        if (user) {
          return from(user.getIdToken()).pipe(
            switchMap(token => {
              // Clone the request and add the auth token
              const authReq = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${token}`
                }
              });
              return next.handle(authReq);
            })
          );
        } else {
          // No user is signed in, proceed without token
          return next.handle(request);
        }
      }),
      catchError((error) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) {
            // Unauthorized - redirect to login
            this.router.navigate(['/login']);
          }
        }
        return throwError(() => error);
      })
    );
  }
}
