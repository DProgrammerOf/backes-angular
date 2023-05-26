import { AfterViewInit, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { showSelectVeiculos } from 'src/app/app.animation';
import { AppComponent } from 'src/app/app.component';
import { HistoricoForm, HistoricoGet, HistoricoService } from 'src/app/services/cliente/historico.service';
import { Veiculo, VeiculosService } from 'src/app/services/cliente/veiculos.service';
import { ClienteComponent } from '../cliente.component';

interface InputPlaca {
  veiculos: Veiculo[],
  filtered: Veiculo[],
  overlayClass: String,
  selectClass: String,
  filterValue: String,
  inputValue: String
}

const Relatorios = {
  TIPO_REPLAY   : 'Replay',
  TIPO_LISTA    : 'Lista',
  TIPO_DESENHO  : 'Desenhado',
  TIPO_PARADAS  : 'Paradas',
  TIPO_VIAGENS  : 'Viagens',
}

@Component({
  selector: 'app-historico',
  templateUrl: './historico.component.html',
  styleUrls: ['./historico.component.scss'],
  animations: [ showSelectVeiculos ]
})
export class HistoricoComponent {
  titlePage: String = 'Histórico';
  datePeriodClass: String = 'hide';
  form: HistoricoForm = { 
    veiculo: undefined,
    placa: undefined,
    relatorio: Relatorios.TIPO_REPLAY, 
    periodo: 'Hoje',
    periodoDates: {
      dia: moment().format('YYYY-MM-DD'),
      inicio: '00:00',
      fim: '23:59'
    }
    
    // veiculo: "863656044446198",
    // placa: "RTW-6D97",
    // relatorio: Relatorios.TIPO_REPLAY, 
    // periodo: 'Personalizado',
    // periodoDates: {
    //   dia: '2023-03-05',
    //   inicio: '00:00',
    //   fim: '23:59'
    // }

    // veiculo: "863656044513922",
    // placa: "RVI-2C29",
    // relatorio: Relatorios.TIPO_REPLAY, 
    // periodo: 'Personalizado',
    // periodoDates: {
    //   dia: '2023-04-19',
    //   inicio: '00:00',
    //   fim: '23:59'
    // }

    // veiculo: "511123075",
    // placa: "BDC-1H72",
    // relatorio: Relatorios.TIPO_REPLAY, 
    // periodo: 'Personalizado',
    // periodoDates: {
    //   dia: '2022-02-22',
    //   inicio: '00:00',
    //   fim: '23:59'
    // }
  };
  // Select bem variables
  selectBemList: Veiculo[] = new Array();
  selectBem: InputPlaca = {
    veiculos: this.veiculos.getList() as Veiculo[],
    filtered: this.veiculos.getList() as Veiculo[],
    overlayClass: 'hidden',
    selectClass: 'closed',
    filterValue: '',
    inputValue: 'Seleciona veículo'
  };
  
  constructor(
    protected app: AppComponent,
    protected base: ClienteComponent,
    private router: Router,
    private route: ActivatedRoute,
    private veiculos: VeiculosService,
    private service: HistoricoService
  ) {
    // Load last data form
    if (this.service.lastHistorico?.placa) {
      this.selectBem.inputValue = this.service.lastHistorico.placa;
      this.form = this.service.lastHistorico;
      if (this.form.periodo === 'Personalizado') {
        this.datePeriodClass = 'show';
      }
    }

    this.selectBemList = this.veiculos.getList() as Veiculo[];
  }

  getRelatorio(): void {
    if (!this.form.veiculo) {
      alert('Escolha um veículo para gerar o relatório');
      return;
    }

    this.app.setStatus(true);
    if (this.form.relatorio === Relatorios.TIPO_LISTA) {
      this.service.getLista(this.form).subscribe( (response) => {
        this.app.setStatus(false);
        if (!response.success) {
          alert(response.message);
          return;
        }
        this.router.navigate(['cliente/historico/lista']);
      })
    } else if (this.form.relatorio === Relatorios.TIPO_REPLAY) {
      this.service.getReplay(this.form).subscribe( (response) => {
        this.app.setStatus(false);
        if (!response.success) {
          alert(response.message);
          return;
        }
        this.router.navigate(['cliente/historico/replay']);
      })
    } else if (this.form.relatorio === Relatorios.TIPO_DESENHO) {
      this.service.getDesenho(this.form).subscribe( (response) => {
        this.app.setStatus(false);
        if (!response.success) {
          alert(response.message);
          return;
        }
        this.router.navigate(['cliente/historico/desenho']);
      })
    } else if (this.form.relatorio === Relatorios.TIPO_PARADAS) {
      this.service.getParadas(this.form).subscribe( (response) => {
        this.app.setStatus(false);
        if (!response.success) {
          alert(response.message);
          return;
        }
        this.router.navigate(['cliente/historico/paradas']);
      })
    }  else if (this.form.relatorio === Relatorios.TIPO_VIAGENS) {
      this.service.getViagens(this.form).subscribe( (response) => {
        this.app.setStatus(false);
        if (!response.success) {
          alert(response.message);
          return;
        }
        this.router.navigate(['cliente/historico/viagens']);
      })
    }
  }


  /* UI - Selects */
  openSelectBem() {
    this.selectBem.overlayClass = 'visible';
    this.selectBem.selectClass = 'opened';
  }
  closeSelectBem() {
    this.selectBem.overlayClass = 'hidden';
    this.selectBem.selectClass = 'closed';
  }
  selectedBem(veiculo: Veiculo) {
    this.form.veiculo = veiculo.imei;
    this.form.placa = veiculo.name;
    this.selectBem.inputValue = veiculo.name;
    this.closeSelectBem();
  }
  filterSelectBem() {
    if (this.selectBem.filterValue) {
      this.selectBem.filtered = this.filteredSelectBem(this.selectBem.filterValue);
    } else {
      this.selectBem.filtered = this.selectBem.veiculos;
    }
  }
  filterCancelSelectBem() {
    this.selectBem.filterValue = '';
    this.filterSelectBem();         
  }
  filteredSelectBem(name: String) {
    return this.selectBem.veiculos.filter( (veiculo) => {
      return (
        veiculo.marca.toString() + veiculo.motorista.toString() + veiculo.name.toString()
      ).toLowerCase().indexOf(name.toLowerCase()) > -1;
    });
  }
  usarAtalho(atalho: String){
    this.form.periodoDates.inicio = '00:00';
    this.form.periodoDates.fim = '23:59';
    switch(atalho) {
      case 'hoje':
        this.form.periodoDates.dia = moment().format('YYYY-MM-DD');
        break;
      case 'ontem':
        this.form.periodoDates.dia = moment().subtract(1, 'days').format('YYYY-MM-DD');
        break;
      case '2dias':
        this.form.periodoDates.dia = moment().subtract(2, 'days').format('YYYY-MM-DD');
        break;
      case '3dias':
        this.form.periodoDates.dia = moment().subtract(3, 'days').format('YYYY-MM-DD');
        break;
      case 'personalizado':
        this.form.periodoDates.dia = moment().format('YYYY-MM-DD');
        break;
      default: break;
    }
  }
  openSelect(type: String) {
    switch (type) {
      case 'relatorio':
        this.base.openActionSheet('', 'Selecione o tipo de relatório', [
          {
            text: 'Replay',
            icon: 'fa-repeat',
            handler: () => {this.form.relatorio = Relatorios.TIPO_REPLAY;}
          },
          {
              text: 'Desenhado',
              icon: 'fa-map-o',
              handler: () => {this.form.relatorio = Relatorios.TIPO_DESENHO;}
          },
          {
              text: 'Lista',
              icon: 'fa-list',
              handler: () => {this.form.relatorio = Relatorios.TIPO_LISTA;}
          },
          {
              text: 'Paradas',
              icon: 'fa-map-marker',
              handler: () => {this.form.relatorio = Relatorios.TIPO_PARADAS;}
          },
          {
            text: 'Viagens',
            icon: 'fa-flag-checkered',
            handler: () => {this.form.relatorio = Relatorios.TIPO_VIAGENS;}
          }
        ]);
      break;
      case 'periodo':
        this.base.openActionSheet('', 'Selecione o período do relatório', [
          {
            text: 'Hoje',
            handler: () => {
              this.form.periodo = 'Hoje'; 
              this.datePeriodClass = 'hide';
              this.usarAtalho('hoje'); 
            }
          },
          {
            text: 'Ontem',
            handler: () => {
              this.form.periodo = 'Ontem'; 
              this.datePeriodClass = 'hide';
              this.usarAtalho('ontem'); 
            }
          },
          {
            text: '2 dias atrás',
            handler: () => {
              this.form.periodo = '2 dias atrás'; 
              this.datePeriodClass = 'hide';
              this.usarAtalho('2dias'); 
            }
          },
          {
            text: '3 dias atrás',
            handler: () => {
              this.form.periodo = '3 dias atrás'; 
              this.datePeriodClass = 'hide';
              this.usarAtalho('3dias'); 
            }
          },
          {
            text: 'Personalizado',
            handler: () => {
              this.form.periodo = 'Personalizado'; 
              this.datePeriodClass = 'show';
              this.usarAtalho('personalizado'); 
            }
          }
        ]);
      break;
    }
  }
}
