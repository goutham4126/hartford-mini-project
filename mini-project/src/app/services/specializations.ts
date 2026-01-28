import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Specialization } from '../models/model';

@Injectable({
    providedIn: 'root',
})
export class Specializations {
    private apiUrl = 'http://localhost:3000/specializations';

    constructor(private http: HttpClient) { }

    getSpecializations(): Observable<Specialization[]> {
        return this.http.get<Specialization[]>(this.apiUrl);
    }

    getSpecialization(id: string): Observable<Specialization> {
        return this.http.get<Specialization>(`${this.apiUrl}/${id}`);
    }

    createSpecialization(specialization: Specialization): Observable<Specialization> {
        return this.http.post<Specialization>(this.apiUrl, specialization);
    }

    updateSpecialization(id: string, specialization: Partial<Specialization>): Observable<Specialization> {
        return this.http.put<Specialization>(`${this.apiUrl}/${id}`, specialization);
    }

    deleteSpecialization(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
