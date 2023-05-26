import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from '../data.service';
import { Veiculo } from './veiculos.service';

export interface Alerta {
  id: Number,
  imei: String,
  nome: String,
  message: String,
  date: String,
  viewed: String,
  type: String
}

interface AlertasResponse {
  success: Boolean,
  message?: String,
  data?: Alerta[]
};


@Injectable({
  providedIn: 'root'
})
export class AlertasService {
  lastAlertas: Alerta[] = new Array();
  constructor(private api: DataService) {}

  load(imei: String, filtro: String | null): Observable<AlertasResponse> {
    return this.api.get('/alertas', { action: "LISTAR", imei: imei, filtro: filtro});
  }

  set(alertas: Alerta[]) {
    this.lastAlertas = alertas;
  }

  get(id: Number): Alerta | undefined {
    return this.lastAlertas.find( alerta => alerta.id === id );
  }

  getList(): Alerta[] {
    return this.lastAlertas;
  }

  marcarLidoTodosHoje(imei: String): Observable<AlertasResponse> {
    return this.api.get('/alertas', { action: "MARCAR_ALL", imei: imei });
  }

  marcarLido(imei: String, id: Number): Observable<AlertasResponse> {
    return this.api.get('/alertas', { action: "MARCAR_ONE", imei:imei, id: id });
  }
}
