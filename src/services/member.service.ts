import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { catchError, retry, map, switchMap } from 'rxjs/operators';
import { Member } from '../models/Member';
import { Pub } from '../models/Pub';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private apiUrl = 'http://localhost:3000/members';
  private pubApiUrl = 'http://localhost:3000/Pub';

  constructor(private http: HttpClient) { }

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

  getAllMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(this.apiUrl)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  getMember(id: string): Observable<Member> {
    return this.http.get<Member>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  addMember(member: Member): Observable<Member> {
    return this.http.post<Member>(this.apiUrl, member)
      .pipe(catchError(this.handleError));
  }

  editMember(id: string, member: Member): Observable<Member> {
    return this.http.put<Member>(`${this.apiUrl}/${id}`, member)
      .pipe(catchError(this.handleError));
  }

  deleteMember(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Get publications for a specific member
  getMemberPublications(memberId: string): Observable<Pub[]> {
    return this.http.get<Pub[]>(`${this.pubApiUrl}?memberId=${memberId}`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  // Get member with their publications
  getMemberWithPublications(id: string): Observable<{member: Member, publications: Pub[]}> {
    return this.getMember(id).pipe(
      switchMap(member => {
        if (member.publications && member.publications.length > 0) {
          // Create an array of observables for each publication
          const pubObservables = member.publications.map(pubId =>
            this.http.get<Pub>(`${this.pubApiUrl}/${pubId}`).pipe(
              catchError(error => {
                console.error(`Error fetching publication ${pubId}:`, error);
                return of(null); // Return null for failed publication fetches
              })
            )
          );

          // Combine all publication observables
          return forkJoin(pubObservables).pipe(
            map(publications => ({
              member,
              publications: publications.filter(pub => pub !== null) as Pub[]
            }))
          );
        } else {
          // If no publications, return member with empty publications array
          return of({
            member,
            publications: []
          });
        }
      }),
      catchError(this.handleError)
    );
  }

  // Add a publication to a member
  addPublicationToMember(memberId: string, publicationId: string): Observable<Member> {
    return this.getMember(memberId).pipe(
      switchMap(member => {
        // Initialize publications array if it doesn't exist
        if (!member.publications) {
          member.publications = [];
        }

        // Add publication ID if it's not already in the array
        if (!member.publications.includes(publicationId)) {
          member.publications.push(publicationId);

          // Update the member with the new publications array
          return this.editMember(memberId, member);
        }

        // If publication is already associated, just return the member
        return of(member);
      }),
      catchError(this.handleError)
    );
  }

  // Remove a publication from a member
  removePublicationFromMember(memberId: string, publicationId: string): Observable<Member> {
    return this.getMember(memberId).pipe(
      switchMap(member => {
        // Check if member has publications
        if (member.publications && member.publications.length > 0) {
          // Filter out the publication ID
          member.publications = member.publications.filter(id => id !== publicationId);

          // Update the member with the new publications array
          return this.editMember(memberId, member);
        }

        // If no publications or publication not found, just return the member
        return of(member);
      }),
      catchError(this.handleError)
    );
  }
}
