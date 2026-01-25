import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Claim } from '../models/model';

@Injectable({
  providedIn: 'root',
})
export class Claims {
  constructor(private http:HttpClient){}
  
  getClaims()
  {
    return this.http.get<Claim[]>('http://localhost:3000/claims')
  }
}
