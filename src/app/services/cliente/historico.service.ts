import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../data.service';
import { Veiculo } from './veiculos.service';

export interface Localizacao {
  id: Number,
  date: String,
  latitudeDecimalDegrees: String,
  longitudeDecimalDegrees: String,
  speed: Number,
  ligado: String,
  address: String,
  attributes: String
}

export interface Parada {
  latitude: String,
  longitude: String,
  dataAndou: String,
  dataParou: String,
  Horas: String,
  Minutos: String,
  Segundos: String,
  Modelo: String,
  Cor: String,
  Tipo: String,
  Placa: String,
  motorista: String,
  Endereco: String,
}

export interface Viagem {
  type: String,
  address?: String,
  start?: String,
  startAddress?: String,
  end?: String,
  endAddress?: String,
  distance?: String,
  time: {
    hours: Number,
    minutes: Number,
    seconds: Number
  }
}

export interface HistoricoForm {
  veiculo?: String,
  placa?: String,
  relatorio: String,
  periodo: String,
  periodoDates: {
    dia: String;
    inicio: String;
    fim: String;
  }
};


interface HistoricoResponse {
  success: Boolean,
  message?: String,
  veiculo?: Veiculo,
  viagens?: Viagem[],
  rota?: Localizacao[],
  paradas?: Number | Parada[],
  tempomovimento?: String,
  gasto?: String,
  distancia?: number
};

export interface HistoricoGet {
  success: Boolean,
  message?: String
}

@Injectable({
  providedIn: 'root'
})
export class HistoricoService {
  lastHistorico: HistoricoForm | undefined;
  lastRota: Localizacao[] | Parada[] | Viagem[] | undefined;
  lastVeiculo: Veiculo | undefined;
  lastRotaInfos: { paradas: Number, tempomovimento: String, gasto: String, distancia?: number } | undefined;
  constructor(private api: DataService) {
    // alert('HistoricoService build');
    this.lastHistorico = {
      // veiculo: '511123075',
      // placa: 'BDC-1H72',
      // relatorio: 'Replay', 
      // periodo: 'Hoje',
      // periodoDates: {
      //   dia: '2022-02-24',
      //   inicio: '00:00',
      //   fim: '23:59'
      veiculo: '',
      placa: '',
      relatorio: '', 
      periodo: '',
      periodoDates: {
        dia: '',
        inicio: '',
        fim: ''
      }
    };
  }

  getLista(form: HistoricoForm): Observable<HistoricoGet> {
    return new Observable<HistoricoGet>( (subscriber) => {
      // console.log('test', this.lastHistorico, form);
      // if (this.lastHistorico?.veiculo === form.veiculo 
      //   && this.lastHistorico?.periodoDates.dia === form.periodoDates.dia
      //   && this.lastHistorico?.periodoDates.inicio === form.periodoDates.inicio 
      //   && this.lastHistorico?.periodoDates.fim === form.periodoDates.fim
      //   ) {
      //     const obj: HistoricoGet = { success: true, message: '' };
      //     subscriber.next(obj);
      //     return;
      // }

      return this.api.get<HistoricoResponse>('/veiculos', { 
        action: "VEICULO_ROTA",
        tipo: "list",
        imei: form.veiculo,
        data: form.periodoDates.dia,
        hora1: form.periodoDates.inicio,
        hora2: form.periodoDates.fim
      }).subscribe( (response) => {
        const obj: HistoricoGet = { success: response.success, message: response.message };
        if (obj.success) {
          this.lastHistorico = form;
          this.lastVeiculo = response.veiculo;
          this.lastRota = response.rota;
          this.lastRotaInfos = undefined;
        }
        subscriber.next(obj);
      } )
    });
  }

  getDesenho(form: HistoricoForm): Observable<HistoricoGet> {
    return new Observable<HistoricoGet>( (subscriber) => {

      return this.api.get<HistoricoResponse>('/veiculos', { 
        action: "VEICULO_ROTA",
        tipo: "desenho",
        imei: form.veiculo,
        data: form.periodoDates.dia,
        hora1: form.periodoDates.inicio,
        hora2: form.periodoDates.fim
      }).subscribe( (response) => {
        const obj: HistoricoGet = { success: response.success, message: response.message };
        if (obj.success) {
          this.lastHistorico = form;
          this.lastVeiculo = response.veiculo;
          this.lastRota = response.rota;
          this.lastRotaInfos = undefined;
        }
        subscriber.next(obj);
      } )
    });
  }

  getReplay(form: HistoricoForm): Observable<HistoricoGet> {
    return new Observable<HistoricoGet>( (subscriber) => {

      return this.api.get<HistoricoResponse>('/veiculos', { 
        action: "VEICULO_ROTA",
        tipo: "replay",
        imei: form.veiculo,
        data: form.periodoDates.dia,
        hora1: form.periodoDates.inicio,
        hora2: form.periodoDates.fim
      }).subscribe( (response) => {
        const obj: HistoricoGet = { success: response.success, message: response.message };
        if (obj.success) {
          this.lastHistorico = form;
          this.lastVeiculo = response.veiculo;
          this.lastRota = response.rota;

          if (response.paradas && response.tempomovimento && response.gasto !== undefined) {
            this.lastRotaInfos = {
              paradas: response.paradas as Number,
              gasto: response.gasto,
              tempomovimento: response.tempomovimento,
              distancia: response.distancia
            };
          }
        
        }
        subscriber.next(obj);
      } )
    });
  }

  getParadas(form: HistoricoForm): Observable<HistoricoGet> {
    return new Observable<HistoricoGet>( (subscriber) => {

      return this.api.get<HistoricoResponse>('/veiculos', { 
        action: "VEICULO_ROTA",
        tipo: "paradas",
        imei: form.veiculo,
        data: form.periodoDates.dia,
        hora1: form.periodoDates.inicio,
        hora2: form.periodoDates.fim
      }).subscribe( (response) => {
        const obj: HistoricoGet = { success: response.success, message: response.message };
        if (obj.success) {
          this.lastHistorico = form;
          this.lastVeiculo = response.veiculo;
          this.lastRota = response.paradas as Parada[];
          this.lastRotaInfos = undefined;
        }
        subscriber.next(obj);
      } )
    });
  }

  getViagens(form: HistoricoForm): Observable<HistoricoGet> {
    return new Observable<HistoricoGet>( (subscriber) => {

      return this.api.get<HistoricoResponse>('/veiculos', { 
        action: "VEICULO_ROTA",
        tipo: "viagens",
        imei: form.veiculo,
        data: form.periodoDates.dia,
        hora1: form.periodoDates.inicio,
        hora2: form.periodoDates.fim
      }).subscribe( (response) => {
        const obj: HistoricoGet = { success: response.success, message: response.message };
        if (obj.success) {
          this.lastHistorico = form;
          this.lastVeiculo = response.veiculo;
          this.lastRota = response.viagens;
          this.lastRotaInfos = undefined;
        }
        subscriber.next(obj);
      } )
    });
  }
}
