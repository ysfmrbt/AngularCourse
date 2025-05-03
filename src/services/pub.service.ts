import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, switchMap, tap, map } from 'rxjs/operators';
import { Pub } from '../models/Pub';
import { Member } from '../models/Member';

@Injectable({
  providedIn: 'root',
})
export class PubService {
  private apiUrl = 'http://localhost:3000/Pub';
  private membersApiUrl = 'http://localhost:3000/members';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      errorMessage = `Code: ${error.status}, Message: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  getAllPubs(): Observable<Pub[]> {
    return this.http
      .get<Pub[]>(this.apiUrl)
      .pipe(retry(2), catchError(this.handleError));
  }

  getPub(id: string): Observable<Pub> {
    return this.http
      .get<Pub>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  addPub(pub: Pub): Observable<Pub> {
    return this.http
      .post<Pub>(this.apiUrl, pub)
      .pipe(catchError(this.handleError));
  }

  updatePub(id: string, pub: Pub): Observable<Pub> {
    return this.http
      .put<Pub>(`${this.apiUrl}/${id}`, pub)
      .pipe(catchError(this.handleError));
  }

  deletePub(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Get publications by member ID
  getPublicationsByMemberId(memberId: string): Observable<Pub[]> {
    return this.getAllPubs().pipe(
      map(pubs => pubs.filter(pub => pub.memberId === memberId)),
      catchError(this.handleError)
    );
  }

  // Assign a publication to a member
  assignPublicationToMember(pubId: string, memberId: string): Observable<Pub> {
    return this.getPub(pubId).pipe(
      switchMap(pub => {
        // Update the publication with the member ID
        const updatedPub = { ...pub, memberId };
        return this.updatePub(pubId, updatedPub);
      }),
      catchError(this.handleError)
    );
  }

  // Remove a publication from a member
  removePublicationFromMember(pubId: string): Observable<Pub> {
    return this.getPub(pubId).pipe(
      switchMap(pub => {
        // Create a new publication object without the memberId
        const { memberId, ...pubWithoutMember } = pub;
        return this.updatePub(pubId, pubWithoutMember as Pub);
      }),
      catchError(this.handleError)
    );
  }
}
