import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../data.service';
import { Veiculo } from '../cliente/veiculos.service';

export interface Fornecedor {
  id?: Number,
  nome: String,
  cnpj: String,
  rua: String,
  bairro: String,
  cidade: String,
  estado: String
};

interface FornecedorResponse {
  success: Boolean,
  message: String,
  fornecedores?: Fornecedor[],
};

@Injectable({
  providedIn: 'root'
})
export class FornecedoresService {
  constructor(private api: DataService, private router: Router) { }

  get(): Observable<FornecedorResponse> {
    return this.api.get('/motorista/combustivel/fornecedores', {});
  }

  salvar(fornecedor: Fornecedor):  Observable<FornecedorResponse> {
    return this.api.get('/motorista/combustivel/fornecedores/store', { fornecedor: JSON.stringify(fornecedor) });
  }

}
