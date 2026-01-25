import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Policy } from '../models/model';

@Injectable({
  providedIn: 'root',
})
export class Policies {
  constructor(private http:HttpClient){}
  
  getPolicies()
  {
    return this.http.get<Policy[]>('http://localhost:3000/policies')
  }
}
