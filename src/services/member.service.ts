import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Member } from '../models/Member';
// décorateur Injectable pour injecter le service dans un autre service ou composant
@Injectable({
  providedIn: 'root', // root signifie que le service est injecté dans toute l'application
})
export class MemberService {
  constructor(private http: HttpClient) {
    // Injection de HttpClient dans le service
  }
  // Fonction qui retourne un tableau de membres
  getAllMembers(): Observable<Member[]> {
    return this.http.get<Member[]>('http://localhost:3000/members');
  }

  // Fonction qui retourne un membre par son id
  getMemberById(id: string): Observable<Member> {
    return this.http.get<Member>(`http://localhost:3000/members/${id}`);
  }

  // Fonction qui ajoute un membre
  addMember(member: Member): Observable<void> {
    return this.http.post<void>('http://localhost:3000/members', member);
  }

  // Fonction qui supprime un membre
  deleteMember(id: string): Observable<void> {
    return this.http.delete<void>(`http://localhost:3000/members/${id}`);
  }

  // Fonction qui modifie un membre
  editMember(id: string, member: Member): Observable<void> {
    return this.http.put<void>(`http://localhost:3000/members/${id}`, member);
  }
}
