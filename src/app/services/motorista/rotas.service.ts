import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../data.service';
import { HttpEvent } from '@angular/common/http';

export interface Local_Details {
  description: String,
  name_address: String,
  full_address: String,
  search_address: String,
  
  // Locals to go specific attributes
  deliver_start?: String,
  deliver_end?: String,
  deliver_weight?: String,
  deliver_status?: number
  deliver_whatsapp?: String,
  deliver_cost?: String,

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
  estado: String,
  status: Number
};

export interface RotaResponse {
  success: Boolean,
  message: String,
  rotas?: Rota[]
  rota?: Rota
};

@Injectable({
  providedIn: 'root'
})
export class RotasService {
  constructor(private api: DataService, private router: Router) { }

  get(id: Number, type: String): Observable<RotaResponse> {
    return this.api.get('/motorista/rotas', { vehicle_id:id, type:type});
  }

  create(data: FormData): Observable<HttpEvent<any>> {
    return this.api.post<any>('/motorista/rotas/checkin', data, true);
  }

  create_quick(id: Number, local_index: Number): Observable<RotaResponse> {
    return this.api.get<RotaResponse>('/motorista/rotas/start', {rota_id:id, local_index:local_index});
  }
}
