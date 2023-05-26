import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { HistoricoService, Localizacao } from 'src/app/services/cliente/historico.service';
import { ClienteComponent } from '../../../cliente.component';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class HistoricoListaComponent {
  titlePage: String = 'Histórico';
  historico: Localizacao[] | undefined;
  constructor(
    protected base: ClienteComponent,
    private service: HistoricoService,
    protected location: Location
  ){
    this.historico = this.service.lastRota as Localizacao[];
  }

  mapaVeiculo(localizacao: Localizacao){
  }
}
