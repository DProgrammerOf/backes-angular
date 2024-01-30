import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../data.service';

export interface Veiculo {
  id: Number,
  cliente: Number,
  imei: String,
  name: String,
  date: String,
  modelo: String,
  marca: String,
  cor: String,
  motorista: String,
  tipo: String,
  status_sinal?: String,
  ligado?: String,
  endereco?: String
  endereco_regex?: String,
  speed?: Number,
  bloqueado?: String,
  limite_velocidade?: Number,
  dt_ignicao_ligada?: String,
  injectHtml?: String,
  satelites?: String,
  latitude?: String,
  longitude?: String,
  hodometro?: number,
  voltagem_bateria?: String,
  sinal?: String,
  saida1?: String,
  saida2?: String,
  horimetro?: number,
  horimetroFormatted?: String,
  parado?: String,
  calc_hodometro?: Number,
  obj_localizacao?: UltimaLocalizacao
};

export interface UltimaLocalizacao {
  id: Number,
  positionId: Number,
  date: String,
  latitudeDecimalDegrees: String,
  longitudeDecimalDegrees: String,
  speed: Number,
}

interface VeiculosResponse {
  success: Boolean,
  message?: String,
  veiculos?: Veiculo[]
  alertas?: Number
};

interface VeiculosComandoResponse {
  success: Boolean,
  message: String
}

@Injectable({
  providedIn: 'root'
})
export class VeiculosService {
  private veiculos: Veiculo[] | undefined;
  constructor(private api: DataService, private router: Router) {}

  load(): Observable<VeiculosResponse> {
    return this.api.get('/veiculos', { action: "VEICULOS"});
  }

  clear(): void {
    this.veiculos = undefined;
  }

  get(id?: Number, imei?: String): Veiculo | undefined {
    return this.veiculos?.find( veiculo => veiculo.id == id || veiculo.imei == imei);
  }

  set(veiculos: Veiculo[] | undefined): void {
    if (veiculos && this.api.auth_jwt)
      this.veiculos = veiculos;
  }

  refresh(): void {
    this.load().subscribe( response => this.set(response.veiculos) );
  }

  getList(): Veiculo[] | undefined {
    return this.veiculos;
  }

  /* COMANDOS */
  bloquear(imei: String): Observable<VeiculosComandoResponse> {
    return this.api.get('/comandos', { action: 'VEICULO_BLOQUEAR', imei: imei });
  }

  desbloquear(imei: String): Observable<VeiculosComandoResponse> {
    return this.api.get('/comandos', { action: 'VEICULO_DESBLOQUEAR', imei: imei });
  }

  velocidade_limite(imei: String, velocidade: Number):  Observable<VeiculosComandoResponse> {
    return this.api.get('/comandos', { action: 'VEICULO_VELOCIDADE', velocidade: velocidade, imei: imei });
  }

  alterar_odometro(imei: String, odometro: Number):  Observable<VeiculosComandoResponse> {
    return this.api.get('/veiculos', { action: 'HODOMETRO', hodometro: odometro, imei: imei });
  }

  alterar_motorista(imei: String, nome: String):  Observable<VeiculosComandoResponse> {
    return this.api.get('/veiculos', { action: 'MOTORISTA', motorista: nome, imei: imei });
  }

  alterar_horimetro(imei: String, horimetro: Number):  Observable<VeiculosComandoResponse> {
    return this.api.get('/veiculos', { action: 'HORIMETRO', horimetro: horimetro, imei: imei });
  }

  alterar_combustivel(imei: String, preco: Number, gasto: Number):  Observable<VeiculosComandoResponse> {
    return this.api.get('/veiculos', { action: 'COMBUSTIVEL', valor: preco, gasto: gasto, imei: imei });
  }

  // Alertas
  alertas(imei: String): Observable<VeiculosResponse> {
    return this.api.get('/veiculos', { action: "ALERTAS", imei: imei });
  }

  
}
