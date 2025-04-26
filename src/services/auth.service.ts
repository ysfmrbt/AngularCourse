import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedInUser = new BehaviorSubject<string | null>(null);
  public loggedInUser$ = this.loggedInUser.asObservable();

  private authToken = new BehaviorSubject<string | null>(null);
  public authToken$ = this.authToken.asObservable();

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    private http: HttpClient
  ) {
    // Listen for auth state changes
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.loggedInUser.next(user.email);
        // Get the token when user is authenticated
        this.refreshToken();
      } else {
        this.loggedInUser.next(null);
        this.authToken.next(null);
      }
    });

    // Set up token refresh
    this.setupTokenRefresh();
  }

  private setupTokenRefresh(): void {
    // Firebase tokens expire after 1 hour, refresh every 50 minutes
    setInterval(() => {
      if (this.isLoggedIn()) {
        this.refreshToken();
      }
    }, 50 * 60 * 1000); // 50 minutes
  }

  private refreshToken(): void {
    from(this.afAuth.currentUser)
      .pipe(
        switchMap((user) => {
          if (user) {
            return from(user.getIdToken(true));
          }
          return of(null);
        })
      )
      .subscribe((token) => {
        this.authToken.next(token);
      });
  }

  login(email: string, password: string): Observable<boolean> {
    return from(this.afAuth.signInWithEmailAndPassword(email, password)).pipe(
      switchMap((userCredential) => {
        if (userCredential.user) {
          // Get the token after successful login
          return from(userCredential.user.getIdToken()).pipe(
            tap((token) => {
              this.authToken.next(token);
            }),
            map(() => true)
          );
        }
        return of(false);
      }),
      catchError((error) => {
        console.error('Firebase Login Error:', error);
        throw new Error(this.mapFirebaseAuthError(error));
      })
    );
  }

  logout(): Observable<void> {
    return from(this.afAuth.signOut()).pipe(
      tap(() => {
        // Clear the token and user data
        this.authToken.next(null);
        this.loggedInUser.next(null);
        this.router.navigate(['/login']);
      }),
      catchError((error) => {
        console.error('Logout failed: ', error);
        // Still clear token and navigate to login on error
        this.authToken.next(null);
        this.loggedInUser.next(null);
        this.router.navigate(['/login']);
        return of(undefined);
      })
    );
  }

  isLoggedIn(): boolean {
    return !!this.loggedInUser.value;
  }

  getCurrentUser(): string | null {
    return this.loggedInUser.value;
  }

  getToken(): Observable<string | null> {
    return this.authToken$;
  }

  getCurrentToken(): string | null {
    return this.authToken.value;
  }

  private mapFirebaseAuthError(error: any): string {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/user-disabled':
        return 'This user account has been disabled.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password.';
      default:
        return 'An unknown login error occurred.';
    }
  }
}
