import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { AppComponent } from 'src/app/app.component';
import { Alerta, AlertasService } from 'src/app/services/cliente/alertas.service';
import { Veiculo, VeiculosService } from 'src/app/services/cliente/veiculos.service';
import Swal from 'sweetalert2';
import { ClienteComponent } from '../../../cliente.component';

@Component({
  selector: 'app-alertas',
  templateUrl: './alertas.component.html',
  styleUrls: ['./alertas.component.scss']
})
export class VeiculosMapaAlertasComponent implements OnInit {
  titlePage: String = 'Alertas';
  veiculo: Veiculo | undefined;
  alertas: Alerta[] | undefined;
  dia: String = moment().format('YYYY-MM-DD')

  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger',
      actions: 'btn-dialog-actions'
    },
    buttonsStyling: false
  })

  constructor(
    private app: AppComponent,
    protected base: ClienteComponent,
    private router: Router,
    private route: ActivatedRoute,
    protected location: Location,
    private veiculos: VeiculosService,
    private service: AlertasService
  ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.veiculo = this.veiculos.get(undefined, params['veiculo']);

      // Remove after
      if(this.veiculo === undefined) {
        this.app.setStatus(true);
        this.veiculos.load().subscribe(
          (response) => {
            if (response.success) {
              this.veiculos.set(response.veiculos);
              this.veiculo = this.veiculos.get(undefined, params['veiculo']);
              if (this.veiculo) {
                this.service.load(this.veiculo.imei, this.dia).subscribe( (response) => {
                  this.app.setStatus(false);
  
                  if (!response.success && response.message) {
                    this.base.openMessage(false, response.message);
                    return;
                  }
                  if (response.data) {
                    this.service.set(response.data);
                  }
                  this.alertas = this.service.getList();
                });
              }
            } else {
              alert(response.message);
            }
          }
        )
      } else if (this.veiculo) {
        this.service.load(this.veiculo.imei, this.dia).subscribe( (response) => {
          this.app.setStatus(false);

          if (!response.success && response.message) {
            this.base.openMessage(false, response.message);
            return;
          }
          if (response.data) {
            this.service.set(response.data);
          }
          this.alertas = this.service.getList();
        });
      }
    });
  }

  checkAll(): void {
    this.swalWithBootstrapButtons.fire({
      title: 'Marcar todos',
      text: 'Tem certeza que quer marcar todos alertas como vistos?',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sim',
    }).then((result) => {
      if (result.isConfirmed && this.veiculo) {
        this.app.setStatus(true);
        this.service.marcarLidoTodosHoje(this.veiculo.imei).subscribe( (response) => {
          if (response.success && this.veiculo) {
            this.service.load(this.veiculo.imei, this.dia).subscribe( (responseTwo) => {
              this.app.setStatus(false);
              this.alertas = responseTwo.data;
            })
          }
          response.success 
            ? this.swalWithBootstrapButtons.fire(response.message?.toString(), '', 'success')
            : this.swalWithBootstrapButtons.fire(response.message?.toString(), '', 'error')
        })
      }
    })
  }

  check(alerta: Alerta): void {
    if (this.veiculo && alerta) {
      this.app.setStatus(true);
      this.service.marcarLido(this.veiculo.imei, alerta.id).subscribe( (response) => {
        if (response.success && this.veiculo) {
          this.service.load(this.veiculo.imei, this.dia).subscribe( (responseTwo) => {
            this.app.setStatus(false);
            this.alertas = responseTwo.data;
          })
        }
        response.success 
          ? this.swalWithBootstrapButtons.fire(response.message?.toString(), '', 'success')
          : this.swalWithBootstrapButtons.fire(response.message?.toString(), '', 'error')
      })
    }
  }

  openOptions(alerta: Alerta): void {
    this.base.openActionSheet(
      '', 'Alerta - Ações',
      [
        {
          text: 'Marcar como visto',
          icon: 'fa-check',
          handler: () => this.check(alerta)
        }
      ]
    )
  }

  filter(): void {
    this.swalWithBootstrapButtons.fire({
      title: 'Filtro',
      text: 'Filtrar alertas por dia',
      showCancelButton: true,
      inputAutoFocus: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Filtrar',
      html: '<p style="font-size:.9rem">Escolha um dia para filtrar os alertas</p><input style="margin: .4rem 0;" id="filtroDia" type="date" value="'+this.dia+'" class="swal2-input">',
      didOpen: () => {
        setTimeout(
          () => {
            document.getElementById('filtroDia')?.focus();
            document.getElementById('filtroDia')?.click();
          }, 200
        );
      }
    }).then((result) => {
      if (result.isConfirmed) {
        if (!this.veiculo) 
          return;

        const filtroValue = (<HTMLInputElement>document.getElementById('filtroDia')).value;
        this.app.setStatus(true);
        this.service.load(this.veiculo.imei, filtroValue).subscribe( (response) => {
          this.app.setStatus(false);
          this.alertas = response.data;
          this.dia = filtroValue;
        });
      }
    })
  }
}
