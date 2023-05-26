import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../data.service';
import { Veiculo } from '../cliente/veiculos.service';

export interface Perfil {
  id?: Number,
  nome?: String,
  email?: String,
  data_cnh?: String,
  data_nascimento?: String
};

interface PerfilSenha {
  senha: String,
  senha_normal: String
}

interface PerfilResponse {
  success: Boolean,
  message?: String,
  perfil?: Perfil,
  veiculos?: Veiculo[]
};

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  constructor(private api: DataService, private router: Router) { }

  get(): Observable<PerfilResponse> {
    return this.api.get('/motorista/perfil', {});
  }

}
