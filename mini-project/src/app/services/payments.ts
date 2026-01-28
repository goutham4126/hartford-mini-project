import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment } from '../models/model';

@Injectable({
    providedIn: 'root',
})
export class Payments {
    private apiUrl = 'http://localhost:3000/payments';

    constructor(private http: HttpClient) { }

    getPayments(): Observable<Payment[]> {
        return this.http.get<Payment[]>(this.apiUrl);
    }

    getPayment(id: string): Observable<Payment> {
        return this.http.get<Payment>(`${this.apiUrl}/${id}`);
    }

    createPayment(payment: Payment): Observable<Payment> {
        return this.http.post<Payment>(this.apiUrl, payment);
    }

    processPayment(payment: Payment): Observable<Payment> {
        return this.createPayment(payment);
    }
}
