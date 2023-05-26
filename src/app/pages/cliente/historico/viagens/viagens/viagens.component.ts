import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { HistoricoService, Localizacao, Viagem } from 'src/app/services/cliente/historico.service';
import { ClienteComponent } from '../../../cliente.component';

@Component({
  selector: 'app-viagens',
  templateUrl: './viagens.component.html',
  styleUrls: ['./viagens.component.scss']
})
export class HistoricoViagensComponent {
  titlePage: String = 'Viagens';
  historico: Viagem[] | undefined;
  constructor(
    protected base: ClienteComponent,
    private service: HistoricoService,
    protected location: Location
  ){
    this.historico = this.service.lastRota as Viagem[];
  }
}
