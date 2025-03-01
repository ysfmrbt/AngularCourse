import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Event } from '../models/Event';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:3000/events';

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

  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  getEvent(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  addEvent(event: Event): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, event)
      .pipe(catchError(this.handleError));
  }

  updateEvent(id: string, event: Event): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event)
      .pipe(catchError(this.handleError));
  }

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }
}
