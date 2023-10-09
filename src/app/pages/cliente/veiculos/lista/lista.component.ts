import { Component, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, ChildrenOutletContexts, Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { Veiculo, VeiculosService } from 'src/app/services/cliente/veiculos.service';
import { ClienteComponent } from '../../cliente.component';
import Swal from 'sweetalert2'
import { showRouterVeiculos, slideOutAnimation } from 'src/app/app.animation';
import * as moment from 'moment';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
  animations: [ slideOutAnimation, showRouterVeiculos ],
  encapsulation: ViewEncapsulation.None
})
export class VeiculosListaComponent implements OnDestroy {
  titlePage: String = 'Veículos';
  veiculos: Veiculo[] | undefined;
  veiculosFiltered: Veiculo[] | undefined;
  veiculosTimer: NodeJS.Timer | undefined;
  searchValue: String = '';
  routerVeiculosLoaded: String | undefined;
  // filters status
  filterStatus = {
    opened: false,
    inputsEnabled: 0,
    inputs: {
      ligado: false,
      desligado: false,
      ligadoparado: false,
      off24h: false,
      off48h: false,
      off72h: false,
      off7d: false
    },
    inputsTemp: {
      ligado: false,
      desligado: false,
      ligadoparado: false,
      off24h: false,
      off48h: false,
      off72h: false,
      off7d: false
    },
    inputsCount: {
      ligado: 0,
      desligado: 0,
      ligadoparado: 0,
      off24h: 0,
      off48h: 0,
      off72h: 0,
      off7d: 0
    }
  };

  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger',
      actions: 'btn-dialog-actions'
    },
    buttonsStyling: false
  })

  constructor(
    protected app: AppComponent,
    protected base: ClienteComponent,
    private router: Router,
    private route: ActivatedRoute,
    private contexts: ChildrenOutletContexts,
    private service: VeiculosService
  ) {
    this.veiculos = this.service.getList();
    this.veiculosFiltered = this.veiculos;

    if(this.veiculos === undefined) {
      this.app.setStatus(true);
      this.service.load().subscribe(
        (response) => {
          this.app.setStatus(false);
          if (response.success) {
            this.service.set(response.veiculos);
            this.veiculos = response.veiculos;
            this.veiculosFiltered = this.veiculos;
            this.listFilterStatus();
          } else {
            alert(response.message);
          }
        }
      );
    } else {
      this.service.load().subscribe(
        (response) => {
          this.app.setStatus(false);
          if (response.success) {
            this.service.set(response.veiculos);
            this.veiculos = response.veiculos;
            this.veiculosFiltered = this.veiculos;
            this.listFilterStatus();
          } else {
            alert(response.message);
          }
        }
      );
    }

    this.veiculosTimer = setInterval( () => {
      this.service.load().subscribe(
        (response) => {
          if (response.success) {
            this.service.set(response.veiculos);
            this.veiculos = response.veiculos;
            this.veiculosFiltered = this.filteredSelectBem(this.searchValue);
            this.listFilterStatus();
          } else {
            alert(response.message);
          }
        }
      )
    }, 8000 );

    // alert(this.app.platform?.toLocaleLowerCase());
  }

  ngOnDestroy(): void {
    clearInterval(this.veiculosTimer);
  }

  getRouteAnimationData() {
    this.routerVeiculosLoaded = this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }

  filterSelectBem() {
    if (this.searchValue) {
      this.veiculosFiltered = this.filteredSelectBem(this.searchValue);
    } else {
      this.veiculosFiltered = this.veiculos;
    }
    this.listFilterStatus();
  }
  filterCancelSelectBem() {
    this.searchValue = '';
    this.filterSelectBem();
  }
  filteredSelectBem(name: String) {
    return this.veiculos?.filter( (veiculo) => {
      return (
        veiculo.marca.toString() + veiculo.motorista.toString() + veiculo.name.toString()
      ).toLowerCase().indexOf(name.toLowerCase()) > -1;
    });
  }

  refresh() {
    this.app.setStatus(true);
    this.service.load().subscribe(
      (response) => {
        if (response.success) {
          this.service.set(response.veiculos);
          this.veiculos = this.service.getList();
          this.veiculosFiltered = this.filteredSelectBem(this.searchValue);
          this.listFilterStatus();
        }
        this.app.setStatus(false);
      }
    )
  }

  mapaVeiculo(veiculo: Veiculo) {
    this.router.navigate(['cliente/veiculos/mapa'], { queryParams: { veiculoId: veiculo.id } });
  }

  mapaVeiculos() {
    this.router.navigate(['cliente/veiculos/mapa'], { queryParams: { veiculoId: -1 } });
  }

  bloquear(veiculo: Veiculo) {
    this.swalWithBootstrapButtons.fire({
      title: 'Bloqueio',
      text: 'Tem certeza que quer enviar o comando de bloqueio?',
      // imageUrl: 'assets/modals/bloquear.png',
      imageWidth: 100,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sim',
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.bloquear(veiculo.imei).subscribe( (response) => {
          this.base.openMessage(response.success, response.message.toString());
          if (response.success) {
            this.refresh();
          }
        });
      }
    })
  }

  desbloquear(veiculo: Veiculo) {
    this.swalWithBootstrapButtons.fire({
      title: 'Desbloqueio',
      text: 'Tem certeza que quer enviar o comando de desbloqueio?',
      // imageUrl: 'assets/modals/desbloquear.png',
      imageWidth: 100,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sim',
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.desbloquear(veiculo.imei).subscribe( (response) => {
          this.base.openMessage(response.success, response.message.toString());
          if (response.success) {
            this.refresh();
          }
        });
      }
    })
  }

  limiteVelocidade(veiculo: Veiculo) {
    this.swalWithBootstrapButtons.fire({
      title: 'Velocidade Limite',
      text: 'Tem certeza que quer alterar a velocidade limite?',
      // imageUrl: 'assets/modals/velocidadelimite.png',
      imageWidth: 100,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sim',
      input: 'number',
      inputPlaceholder: veiculo.limite_velocidade?.toString(),
      inputValidator: (value) => {
        if (!value) {
          return 'Velocidade informada é inválida'
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.velocidade_limite(veiculo.imei, parseInt(result.value)).subscribe( (response) => {
          this.base.openMessage(response.success, response.message.toString());
          if (response.success) {
            this.refresh();
          }
        });
      }
    })
  }

  cercas(veiculo: Veiculo) {
    this.router.navigate(['cliente/veiculos/cercas'], { queryParams: { veiculo: veiculo.imei } });
  }


  // filters list
  openFilterStatus(value: boolean) {
    this.filterStatus.inputsTemp = { ...this.filterStatus.inputs };
    this.filterStatus.opened = value;
  }

  saveFilterStatus() {
    this.filterStatus.inputs = this.filterStatus.inputsTemp;
    this.filterStatus.inputsEnabled = Object.values(this.filterStatus.inputs).filter(input => input).length;
    this.openFilterStatus(false);
    this.filterSelectBem();
  }

  listFilterStatus() {
    // filter list
    if (this.filterStatus.inputsEnabled) {
      const momentNow = moment();
      this.veiculosFiltered = this.veiculosFiltered?.filter(
        (veiculo) => {
            if (this.filterStatus.inputs.ligado && veiculo.ligado === 'S') return true;
            if (this.filterStatus.inputs.desligado && veiculo.ligado === 'N') return true;
            if (this.filterStatus.inputs.ligadoparado && veiculo.ligado === 'S' && veiculo.speed === 0) return true;
            if (this.filterStatus.inputs.off24h || this.filterStatus.inputs.off48h || this.filterStatus.inputs.off72h || this.filterStatus.inputs.off7d) {
                const last_conn = moment(veiculo.date.toString());
                const diff = momentNow.diff(last_conn, 'hours');
                if (this.filterStatus.inputs.off24h && diff >= 24) {
                    return true;
                }
                if (this.filterStatus.inputs.off48h && diff >= 48) {
                    return true;
                }
                if (this.filterStatus.inputs.off72h && diff >= 72) {
                    return true;
                }
                if (this.filterStatus.inputs.off7d && diff >= 128) {
                    return true;
                }
            }
            return false;
        }
      );
    }

    // reset filters status
    this.filterStatus.inputsCount = {
      ligado: 0,
      desligado: 0,
      ligadoparado: 0,
      off24h: 0,
      off48h: 0,
      off72h: 0,
      off7d: 0
    };

    // get count filters status
    this.filterStatus.inputsCount.ligado = this.veiculos?.filter(veiculo =>  veiculo.ligado === 'S').length ?? 0;
    this.filterStatus.inputsCount.desligado = this.veiculos?.filter(veiculo =>  veiculo.ligado === 'N').length ?? 0;
    this.filterStatus.inputsCount.ligadoparado = this.veiculos?.filter(veiculo =>  veiculo.ligado === 'S' && veiculo.speed === 0).length ?? 0;

    // get count filters status date
    const momentNow = moment();
    this.veiculos?.filter(veiculo =>  {
      const last_conn = moment(veiculo.date.toString());
      const diff = momentNow.diff(last_conn, 'hours');
      if (diff >= 24) this.filterStatus.inputsCount.off24h++;
      if (diff >= 48) this.filterStatus.inputsCount.off48h++;
      if (diff >= 72) this.filterStatus.inputsCount.off72h++;
      if (diff >= 128) this.filterStatus.inputsCount.off7d++;
    });
  }
}
