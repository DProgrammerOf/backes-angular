import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../data.service';
import { Veiculo } from '../cliente/veiculos.service';

export interface Local_Details {
  description: String,
  name_address: String,
  full_address: String,
  
  // Locals to go specific attributes
  deliver_start?: String,
  deliver_end?: String,
  deliver_weight?: String,
  deliver_status?: number

  // Local start specific attribute
  status?: number
}

export interface Rota {
  id?: Number,
  date_timestamp: number,
  label: String,
  journey_start: String,
  journey_end: String,
  locals_details: Local_Details[],
  cidade: String,
  estado: String
};

interface RotaResponse {
  success: Boolean,
  message: String,
  rotas?: Rota[]
};

@Injectable({
  providedIn: 'root'
})
export class RotasService {
  constructor(private api: DataService, private router: Router) { }

  get(id: Number, type: String): Observable<RotaResponse> {
    return this.api.get('/motorista/rotas', { vehicle_id:id, type:type});
  }
}
