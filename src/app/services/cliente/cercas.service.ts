import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from '../data.service';
import { Veiculo } from './veiculos.service';

export interface Cerca {
  id: Number,
  tipo: Number,
  imei: String,
  nome: String,
  dt_incao: String,
  dt_altao: String,
  coordenadas: String,
  tipoEnvio: String,
  disp: String,
  tipoAcao: String,
  sitCerca: Number,
  attributes: String
}

interface CercasResponse {
  success: Boolean,
  message?: String,
  data?: Cerca[]
};


@Injectable({
  providedIn: 'root'
})
export class CercasService {
  lastCercas: Cerca[] = new Array();
  constructor(private api: DataService) {}

  load(imei: String): Observable<CercasResponse> {
    return this.api.get('/cercas', { action: "VEICULO_CERCAS", imei: imei });
  }

  set(cercas: Cerca[]) {
    this.lastCercas = cercas;
  }

  get(id: Number): Cerca | undefined {
    return this.lastCercas.find( cerca => cerca.id === id );
  }

  getList(): Cerca[] {
    return this.lastCercas;
  }

  delete(cerca: Cerca): Observable<CercasResponse> {
    return this.api.get('/cercas', { action: "VEICULO_CERCA_DELETE", cerca: cerca.id });
  }

  create(veiculo: Veiculo, nome: String, coordenadas: String): Observable<CercasResponse> {
    return this.api.get('/cercas', { action: "VEICULO_CERCA_SAVE", imei: veiculo.imei, nome: nome, coordenadas: coordenadas });
  }
}
