import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { VeiculosService } from './cliente/veiculos.service';

export interface Login {
  login: String,
  senha: String,
  token?: String,
  tokenRefreshed?: String,
  tipo?: String
  uuid?: String
}

interface LoginResponse {
  success: Boolean,
  message?: String,
  token?: String,
  isFuncionario?: Boolean,
  isMotorista?: Boolean,
  redirectTo?: String
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  parent: DataService;

  constructor(private api: DataService, private router: Router, private veiculos: VeiculosService) { 
    this.parent = api;
  }

  isAuth(): Boolean {
    if (this.api.auth_jwt !== '' && this.api.auth_jwt !== undefined) {
      return true;
    }

    this.router.navigate(['']);
    return false;
  }
  
  authenticate(data: Login): Observable<LoginResponse> {
    this.api.auth_jwt = undefined;
    return this.api.get<LoginResponse>('/login', { action: "LOGIN", ...data });
  }

  login(jwt: String | undefined, response: LoginResponse) {
    // console.log('dev-rlv', 'jwt old', this.api.auth_jwt);
    this.api.auth_jwt = jwt?.toString();
    // console.log('dev-rlv', 'jwt new', this.api.auth_jwt);

    if (response.isMotorista)
      this.router.navigate(['motorista/home']);
    else
      this.router.navigate(['cliente/veiculos']);
  }

  logout(): void {
    this.api.auth_jwt = undefined;
    this.veiculos.set(undefined);
    this.router.navigate(['']);
  }
}
