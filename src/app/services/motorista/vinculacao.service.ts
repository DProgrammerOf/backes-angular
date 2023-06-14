
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../data.service';
import { Veiculo } from '../cliente/veiculos.service';

interface VinculacaoResponse {
  success: Boolean,
  message: String,
  vinculado?: Boolean,
  veiculo?: Veiculo
  veiculos?: Veiculo[]
};

@Injectable({
  providedIn: 'root'
})
export class VinculacaoService {
  constructor(private api: DataService, private router: Router) { }

  vinculo(): Observable<VinculacaoResponse> {
    return this.api.get('/motorista/veiculos/vinculo', { });
  }

  vincular(veiculo_id: Number, periodo_full: boolean): Observable<VinculacaoResponse> {
    return this.api.get('/motorista/veiculos/vincular', { id:veiculo_id, periodo_full:periodo_full});
  }

  desvincular(veiculo_id: Number): Observable<VinculacaoResponse> {
    return this.api.get('/motorista/veiculos/desvincular', { id:veiculo_id });
  }

  trocar(veiculo_id: Number, old_veiculo_id: Number, periodo_full: boolean): Observable<VinculacaoResponse> {
    return this.api.get('/motorista/veiculos/trocar', { id:veiculo_id, old_id:old_veiculo_id, periodo_full:periodo_full});
  }
}
