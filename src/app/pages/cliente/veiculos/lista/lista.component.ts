import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
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

            console.log(JSON.stringify(this.veiculos));
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

            console.log(JSON.stringify(this.veiculos));
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
          response.success
          ? this.swalWithBootstrapButtons.fire(response.message.toString(), '', 'success').then(
            () => this.refresh()
          )
          : this.swalWithBootstrapButtons.fire(response.message.toString(), '', 'error')
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
          response.success
          ? this.swalWithBootstrapButtons.fire(response.message.toString(), '', 'success').then(
            () => this.refresh()
          )
          : this.swalWithBootstrapButtons.fire(response.message.toString(), '', 'error')
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
          response.success
          ? this.swalWithBootstrapButtons.fire(response.message.toString(), '', 'success').then(
            () => this.refresh()
          )
          : this.swalWithBootstrapButtons.fire(response.message.toString(), '', 'error')
        });
      }
    })
  }

  cercas(veiculo: Veiculo) {
    this.router.navigate(['cliente/veiculos/cercas'], { queryParams: { veiculo: veiculo.imei } });
  }
}
