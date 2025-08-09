import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HuggingFaceService {
  private apiUrl = 'https://ferreteria-app-production.up.railway.app/api/chatbot';
  private isFirstMessage = true;

  constructor(private http: HttpClient) {}

  query(userMessage: string): Observable<any> {
    const payload = {
      message: userMessage,
      isFirstMessage: this.isFirstMessage
    };
    
    this.isFirstMessage = false;
    return this.http.post(this.apiUrl, payload);
  }
}