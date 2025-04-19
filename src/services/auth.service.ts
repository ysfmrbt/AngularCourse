import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInUser = new BehaviorSubject<string | null>(null);
  public loggedInUser$ = this.loggedInUser.asObservable();

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.loggedInUser.next(user.email);
      } else {
        this.loggedInUser.next(null);
      }
    });
  }

  login(email: string, password: string): Observable<boolean> {
    return from(this.afAuth.signInWithEmailAndPassword(email, password))
      .pipe(
        map(userCredential => !!userCredential.user),
        catchError(error => {
          console.error('Firebase Login Error:', error);
          throw new Error(this.mapFirebaseAuthError(error));
        })
      );
  }

  logout(): Observable<void> {
    return from(this.afAuth.signOut()).pipe(
      tap(() => {
        this.router.navigate(['/login']);
      }),
      catchError(error => {
        console.error("Logout failed: ", error);
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