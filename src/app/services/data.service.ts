import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  version: string = "3.0";
  // baseurl: string = "https://renandlima.com/backes-api";
  // baseurl: string = "https://app.sistemabackes.com.br/api";
  // baseurlNoProxy: string = "https://sistemabackes.com.br/api";
  baseurl: string = "https://renandlima.com/backes-api";
  baseurlNoProxy: string = "https://renandlima.com/backes-api";
  auth_jwt: string | undefined;// = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3JlbmFuZGxpbWEuY29tL2JhY2tlcy1hcGkvbG9naW4iLCJpYXQiOjE2ODQ1MDcyNjQsImV4cCI6MTY4NTExMjA2NCwibmJmIjoxNjg0NTA3MjY0LCJqdGkiOiJiM0JuRjFWYnpqbDVRRGw5Iiwic3ViIjoxLCJwcnYiOiI2ODAxYWZiYjRkYWI2ZjgyMmFjMTkxM2IxMWJhNWI2N2NiMDM0ZjEwIn0.yZWwihbd8r8clIn_6P7aK-wePw68goQeldvUAaAaObc"; // = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3JlbmFuZGxpbWEuY29tL2JhY2tlcy1hcGkvbG9naW4iLCJpYXQiOjE2ODMyNDIwNDcsImV4cCI6MTY4Mzg0Njg0NywibmJmIjoxNjgzMjQyMDQ3LCJqdGkiOiI3N0JzNUtGcUs1WGtXV3FUIiwic3ViIjoxLCJwcnYiOiI2ODAxYWZiYjRkYWI2ZjgyMmFjMTkxM2IxMWJhNWI2N2NiMDM0ZjEwIn0.UvwpN9UikCS9jfifCB5jUsdnDTkiiHrPCJMwmDm1lUw";
  constructor(private httpClient: HttpClient) { }

  get <T>(endpoint: String, params: Object): Observable<T> {
    let requestParams = new HttpParams({ fromObject: { ...params as any, version: this.version}});

    if (this.auth_jwt === undefined) {
      return this.httpClient.get<T>( this.baseurl + '' + endpoint, {
        params: requestParams
      });
    }

    return this.httpClient.get<T>( this.baseurl + '' + endpoint, {
      params: requestParams,
      headers: {
        'Authorization': 'Bearer ' + this.auth_jwt
      }
    });
  }

  post <T>(endpoint: String, params: Object, progress: boolean) {
    if (this.auth_jwt === undefined) {
      return this.httpClient.post<T>( this.baseurl + '' + endpoint + '?version=' + this.version, params);
    }

    if (progress) { // Upload files
      return this.httpClient.post<T>( this.baseurl + '' + endpoint + '?version=' + this.version, params, {
        reportProgress: progress,
        observe: 'events',
        headers: {
          'Authorization': 'Bearer ' + this.auth_jwt
        }
      });
    }

    return this.httpClient.post<T>( this.baseurl + '' + endpoint + '?version=' + this.version, params, {
      headers: {
        'Authorization': 'Bearer ' + this.auth_jwt
      }
    });
  }

  postCombustivel <T>(endpoint: String, params: Object, progress: boolean) {
    if (this.auth_jwt === undefined) {
      return this.httpClient.post<T>( this.baseurlNoProxy + '' + endpoint + '?version=' + this.version, params);
    }

    if (progress) { // Upload files
      return this.httpClient.post<T>( this.baseurlNoProxy + '' + endpoint + '?version=' + this.version, params, {
        reportProgress: progress,
        observe: 'events',
        headers: {
          'Authorization': 'Bearer ' + this.auth_jwt
        }
      });
    }

    return this.httpClient.post<T>( this.baseurlNoProxy + '' + endpoint + '?version=' + this.version, params, {
      headers: {
        'Authorization': 'Bearer ' + this.auth_jwt
      }
    });
  }
}
