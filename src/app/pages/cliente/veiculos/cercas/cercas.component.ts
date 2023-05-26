import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { Cerca, CercasService } from 'src/app/services/cliente/cercas.service';
import { Veiculo } from 'src/app/services/cliente/veiculos.service';
import { ClienteComponent } from '../../cliente.component';

@Component({
  selector: 'app-cercas',
  templateUrl: './cercas.component.html',
  styleUrls: ['./cercas.component.scss']
})
export class VeiculosCercasComponent implements OnInit {
  titlePage: String = 'Cercas';
  veiculo: String = '511123075';
  cercas: Cerca[] | undefined;

  constructor(
    protected app: AppComponent,
    protected base: ClienteComponent,
    private router: Router,
    private route: ActivatedRoute,
    protected location: Location,
    private service: CercasService
  ) {
  }

  ngOnInit() {
    this.app.setStatus(true);
    this.route.queryParams.subscribe(params => {
      this.veiculo = params['veiculo'];
      this.service.load(this.veiculo).subscribe( (response) => {
        this.app.setStatus(false);

        if (!response.success && response.message) {
          this.base.openMessage(false, response.message);
          return;
        }
        if (response.data) {
          this.service.set(response.data);
        }
        this.cercas = this.service.getList();
      });
    });
  }

  selectCerca(cerca: Cerca) {
    this.base.openActionSheet(
      'Cerca - ' + cerca.nome, '',
      [
        {
          text: 'Ver no mapa',
          handler: () => {
            this.router.navigate(['cliente/veiculos/cercas/mapa'], { 
              queryParams: { type: 'view', veiculoImei: this.veiculo, cercaId: cerca.id } 
            });
          }
        },
        {
          text: 'Deletar',
          handler: () => {
            this.deleteCerca(cerca);
          }
        }
      ]
    )
  }

  refresh(): void {
    this.app.setStatus(true);
    this.service.load(this.veiculo).subscribe( (responseVeiculos) => {
      this.app.setStatus(false);

      if (!responseVeiculos.success && responseVeiculos.message) {
        this.base.openMessage(false, responseVeiculos.message);
        return;
      }
      if (responseVeiculos.data) {
        this.service.set(responseVeiculos.data);
      }
      this.cercas = this.service.getList();
    });
  }

  deleteCerca(cerca: Cerca) {
    this.service.delete(cerca).subscribe(
      (response) => {
        if (response.success) {
          this.service.load(this.veiculo).subscribe( (responseVeiculos) => {
            console.log(responseVeiculos);

            if (!responseVeiculos.success && responseVeiculos.message) {
              this.base.openMessage(false, responseVeiculos.message);
              return;
            }
            if (responseVeiculos.data) {
              this.service.set(responseVeiculos.data);
            }
            this.cercas = this.service.getList();
          });
        }

        if (response.message)
          this.base.openMessage(response.success, response.message);
      }
    )
  }

  addCerca(): void {
    this.router.navigate(['cliente/veiculos/cercas/mapa'], { queryParams: { type: 'create', veiculoImei: this.veiculo } });
  }
}
