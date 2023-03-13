import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AskWikiApiService {

  private ApiUrl = 'http://127.0.0.1:5000/'

  constructor(private http: HttpClient) { }

  suggestArticles(question: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + 'suggest', { params: { q: question } })
      .pipe(
        catchError(this.handleError<string[]>('suggestArticles', []))
      );
  }

  searchArticles(article: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + 'search', { params: { q: article } })
      .pipe(
        catchError(this.handleError<string[]>('searchArticles', []))
      );
  }

  getAnswer(query: string, article: string): Observable<string> {
    return this.http.get<string>(this.ApiUrl + 'answer', { params: { q: query, a: article } })
      .pipe(
        catchError(this.handleError<string>('getAnswer', ''))
      );
  }

  getAnswerStream(query: string, article: string): Observable<string> {
    const observable = new Observable<string>(observer => {
      const url = new URL(this.ApiUrl + 'stream-answer');
      url.searchParams.append('q', query);
      url.searchParams.append('a', article);

      const eventSource = new EventSource(url);

      let value = ''

      eventSource.addEventListener('fragment', x => {
        const fragment = JSON.parse(x.data);
        value += fragment;
        observer.next(value);
      });

      eventSource.addEventListener('done', x => {
        eventSource.close();
        observer.complete();
      });

      eventSource.onerror = x => {
        observer.error(x);
      };

      return () => {
        eventSource.close();
      };
    });

    return observable;
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
