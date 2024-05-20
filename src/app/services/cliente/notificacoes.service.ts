import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../data.service';

interface Notificacoes {
  id?: Number,
  id_cliente?: Number,
  bloqueio: String,
  desbloqueio: String,
  ignicao_ligada: String,
  ignicao_desligada: String,
  cerca_virtual: String,
  velocidade_limite: String,
  energia_desligada: String,
  manutencao: String,
};

interface NotificacoesResponse {
  success: Boolean,
  message?: String,
  data?: Notificacoes
};

@Injectable({
  providedIn: 'root'
})
export class NotificacoesService {
  constructor(private api: DataService, private router: Router) { }

  getList(): Observable<NotificacoesResponse> {
    return this.api.get('/notificacoes', { action: "LIST "});
  }

  update(data: Notificacoes): Observable<NotificacoesResponse> {
    return this.api.get('/notificacoes', { action: "ATUALIZAR", ...data });
  }
}
