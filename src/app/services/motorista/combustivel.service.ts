import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs';
import { HttpEvent } from '@angular/common/http';
import { Fornecedor } from './fornecedores.service';
import { Perfil } from './perfil.service';


export interface DespesaAtributo {
  litros: number,
  date?: String,
  fornecedor?: Fornecedor,
  motorista?: Perfil,
  imagens?: Array<String>,
  pago?: boolean
}

export interface Despesa {
  id: Number,
  veiculo_id: Number,
  date: String,
  tipo: Number,
  valor: number,
  observacoes: String,
  atributos: DespesaAtributo
}

export interface ImageObject {
  file: File | undefined,
  url: String | undefined
}

export interface CombustivelObject {
  id?: Number,
  veiculo: Number,
  data: String,
  hora: String,
  fornecedor: {
    id: Number,
    nome: String
  },
  valor: Float32Array,
  litros: Float32Array,
  odometro: Number,
  imagens: ImageObject
}

export interface CombustivelResponse {
  success: Boolean,
  message: String,
  historico?: Despesa[]
};

@Injectable({
  providedIn: 'root'
})
export class CombustivelService {

  constructor(private api: DataService) { }

  get(date: String): Observable<CombustivelResponse> {
    return this.api.get('/motorista/combustivel', { date: date });
  }

  create(data: FormData): Observable<HttpEvent<any>> {
    return this.api.postCombustivel<any>('/motorista/combustivel/create', data, true);
  }

  delete(id: Number): Observable<CombustivelResponse> {
    return this.api.get('/motorista/combustivel/delete', { id:id });
  }

  update(id: Number, pago: Boolean): Observable<CombustivelResponse> {
    return this.api.get('/motorista/combustivel/update', { id:id , pago:pago });
  }
}
