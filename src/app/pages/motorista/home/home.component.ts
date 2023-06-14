import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { MotoristaComponent } from '../motorista.component';
import { PerfilService } from 'src/app/services/motorista/perfil.service';
import { ActivatedRoute, ChildrenOutletContexts, Router } from '@angular/router';
import { showRouterPainelMotoristas, showSelectVeiculos, slideOutAnimation, slideOutAnimationMotorista } from 'src/app/app.animation';
import { Veiculo } from 'src/app/services/cliente/veiculos.service';
import { VinculacaoService } from 'src/app/services/motorista/vinculacao.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [slideOutAnimationMotorista, showSelectVeiculos]
})
export class HomeComponent implements OnInit, OnDestroy {
  photo: string = '';
  routerPainelMotoristaLoaded: String | undefined;
  veiculos: Veiculo[] | undefined;
  
  // Vinculacao
  vinculado: Boolean | undefined = false;
  veiculo: Veiculo | undefined;

  // Infos da UI
  veiculoSelected: Veiculo | undefined;
  selectVeiculo = {
    overlayClass: 'hidden',
    selectClass: 'closed',
    text: '',
    filterValue: '',
    filtered: [] as Veiculo[] | undefined,
    checkboxPeriodo: false,
  };
  // Infos da UI

  // Swal2
  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger',
      actions: 'btn-dialog-actions'
    },
    buttonsStyling: false
  })
  // Swa2l2

  constructor (
    private app: AppComponent,
    protected motorista: MotoristaComponent,
    private vinculacaoService: VinculacaoService,
    private perfilService: PerfilService,
    private router: Router,
    private route: ActivatedRoute,
    private contexts: ChildrenOutletContexts,
  ){
  }

  getRouteAnimationData() {
    this.routerPainelMotoristaLoaded = this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
    // console.log('dev-rlv', this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation']);
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }

  ngOnInit(): void {
    this.app.setStatus(true);
    this.vinculacaoService.vinculo().subscribe(
      (response) => {
        if (response.success) {
          this.vinculado = response.vinculado;
          this.veiculo = response.veiculo;
        }
      }
    )
  }

  ngOnDestroy(): void {
  }

  protected openCombustivel() {
    this.router.navigate(['motorista/home/combustivel'], { queryParams: { veiculo: undefined } });
  }

  protected openQRCode() {
    // this.motorista.openMessage(false, 'Essa função ainda não está disponível');

    // veiculos loaded in perfil
    console.log(this.motorista.veiculos);
    this.veiculos = this.motorista.veiculos?.filter( veiculo => veiculo.motorista === 'Não Informado');
    this.selectVeiculo.filtered = this.veiculos;
    this.openSelect();
  }

  // ActionSheet filters VINCULAÇÃO
  filterSelectVeiculo () {
    this.selectVeiculo.filtered = this.selectVeiculo.filterValue
    ? this.filteredSelectVeiculo(this.selectVeiculo.filterValue) as Veiculo[]
    : this.selectVeiculo.filtered = this.veiculos;

    // CSS selected after filtered the results
    //@ts-ignore
    $(`#select-list-veiculos-vincular > div`).attr('attr-selected', 'false');
    //@ts-ignore
    $(`#vincularId-${this.veiculoSelected?.id}`).attr('attr-selected', 'true');
  }
  filteredSelectVeiculo (text: String): Veiculo[] | undefined {
    return this.veiculos?.filter( (veiculo) => {
      return (
        veiculo.marca.toString() + veiculo.motorista.toString() + veiculo.name.toString()
      ).toLowerCase().indexOf(text.toLowerCase()) > -1;
    });
  }
  filterCancelSelectVeiculo () {
    this.selectVeiculo.filterValue = '';
    this.filterSelectVeiculo();
  }
  selectedOnSelect (item: Veiculo) {
    let veiculo: Veiculo = item as Veiculo;
    this.veiculoSelected = veiculo;
    //@ts-ignore
    $(`#select-list-veiculos-vincular > div`).attr('attr-selected', 'false');
    //@ts-ignore
    $(`#vincularId-${this.veiculoSelected?.id}`).attr('attr-selected', 'true');
  }
  closeSelect() {
    this.selectVeiculo.overlayClass = 'hidden';
    this.selectVeiculo.selectClass = 'closed';
    this.veiculoSelected = undefined;
  }
  openSelect() {
    if (this.vinculado) {
      return;
    }
    this.selectVeiculo.overlayClass = 'visible';
    this.selectVeiculo.selectClass = 'opened';
  }
  vincular() {
    if (this.veiculoSelected) {
      this.selectVeiculo.overlayClass = 'hidden';
      this.selectVeiculo.selectClass = 'closed';
      this.app.setStatus(true);
      
      if (this.vinculado == false) {
        this.vinculacaoService.vincular(this.veiculoSelected.id, this.selectVeiculo.checkboxPeriodo).subscribe(
          (response) => {
            if (response.success) {
              this.veiculoSelected = undefined;
              this.selectVeiculo.checkboxPeriodo = false;
              this.vinculado = response.vinculado;
              this.veiculo = response.veiculo;
              // Carregando os novos veículos sem motoristas vinculados
              this.perfilService.get().subscribe(
                (perfil) => {
                  if (perfil.success) {
                    this.motorista.veiculos = perfil.veiculos;
                    this.motorista.openMessage(response.success, response.message);
                    this.app.setStatus(false);
                  }
                }
              )
              return;
            }
            this.motorista.openMessage(response.success, response.message);
          }
        )
      } else {
        if (this.veiculo) {
          this.vinculacaoService.trocar(this.veiculoSelected.id, this.veiculo.id, this.selectVeiculo.checkboxPeriodo).subscribe(
            (response) => {
              if (response.success) {
                this.veiculoSelected = undefined;
                this.selectVeiculo.checkboxPeriodo = false;
                this.vinculado = response.vinculado;
                this.veiculo = response.veiculo;
                // Carregando os novos veículos sem motoristas vinculados
                this.perfilService.get().subscribe(
                  (perfil) => {
                    if (perfil.success) {
                      this.motorista.veiculos = perfil.veiculos;
                      this.motorista.openMessage(response.success, response.message);
                      this.app.setStatus(false);
                    }
                  }
                )
                return;
              }
              this.motorista.openMessage(response.success, response.message);
            }
          )
        }
      }
    }
  }
  desvincular(): void {
    this.swalWithBootstrapButtons.fire({
      title: 'Desvincular',
      text: 'Tem certeza que você quer se desvincular desse veículo?',
      // imageUrl: 'assets/modals/bloquear.png',
      imageWidth: 100,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sim',
    }).then((result) => {
      if (result.isConfirmed && this.veiculo) {
        this.app.setStatus(true);
        this.vinculacaoService.desvincular(this.veiculo?.id).subscribe( (response) => {
          if (response.success) {
            this.app.setStatus(false);
            this.vinculado = false;
            this.veiculo = undefined;
            // Carregando os novos veículos sem motoristas vinculados
            this.perfilService.get().subscribe(
              (perfil) => {
                if (perfil.success) {
                  this.motorista.veiculos = perfil.veiculos;
                  this.motorista.openMessage(response.success, response.message);
                  this.app.setStatus(false);
                }
              }
            )
            return;
          }

          this.motorista.openMessage(response.success, response.message);
        });
      }
    })
  }
  trocar(): void {
    this.veiculos = this.motorista.veiculos?.filter( veiculo => veiculo.motorista === 'Não Informado');
    this.selectVeiculo.filtered = this.veiculos;
    this.selectVeiculo.overlayClass = 'visible';
    this.selectVeiculo.selectClass = 'opened';

    console.log(this.motorista.veiculos);
  }
  // ActionSheet filters VINCULAÇÃO

  protected exit() {
    this.motorista.logout();
  }
}
