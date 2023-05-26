import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from '../data.service';
import { Veiculo } from './veiculos.service';

export interface Link {
  id: Number,
  cliente: Number,
  descricao: String,
  bens: String,
  token: String,
  expired_at: Date,
  created_at: Date,
  expire_at: Date,
  create_at: Date,
  ativo: Boolean,
  url: String,
  veiculos: Veiculo[]
}

interface LinkResponse {
  success: Boolean,
  message?: String,
  links?: Link[],
  veiculos?: Veiculo[],
  hoje?: Date
};


@Injectable({
  providedIn: 'root'
})
export class CompartilharService {
  lastLinks: Link[] = new Array();
  constructor(private api: DataService) {}

  load(): Observable<LinkResponse> {
    return this.api.get('/compartilhar', { action: "LIST" });
  }

  set(links: Link[]) {
    this.lastLinks = links;
  }

  get(id: Number): Link | undefined {
    return this.lastLinks.find( link => link.id === id );
  }

  getList(): Link[] {
    return this.lastLinks;
  }

  create(descricao: String, expiracao: String, veiculos: String): Observable<LinkResponse> {
    return this.api.get('/compartilhar', { action: "SAVE", descricao: descricao, expiracao: expiracao, veiculosInclude: veiculos });
  }

  delete(id: Number): Observable<LinkResponse> {
    return this.api.get('/compartilhar', { action: "DELETE", link: id });
  }
}
