import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../data.service';

interface Perfil {
  id?: Number,
  nome?: String,
  email?: String,
  celular?: String,
  telefone?: String,
  endereco?: String,
  bairro?: String,
  cidade?: String,
  estado?: String,
  cep?: String
};

interface PerfilSenha {
  senha_atual: String,
  nova_senha: String
}

interface PerfilResponse {
  success: Boolean,
  message?: String,
  perfil?: Perfil
};

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  constructor(private api: DataService, private router: Router) { }

  get(): Observable<PerfilResponse> {
    return this.api.get('/perfil', { action: "PERFIL "});
  }

  update(data: Perfil): Observable<PerfilResponse> {
    return this.api.get('/perfil', { action: "ATUALIZAR", ...data });
  }

  update_senha(data: PerfilSenha): Observable<PerfilResponse> {
    return this.api.get('/perfil', { action:"ALTERAR_SENHA", ...data });
  }
}
