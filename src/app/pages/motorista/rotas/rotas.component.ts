import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { AppComponent } from 'src/app/app.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Rota, RotasService } from 'src/app/services/motorista/rotas.service';
import { MotoristaComponent } from '../motorista.component';


@Component({
  selector: 'app-rotas',
  templateUrl: './rotas.component.html',
  styleUrls: ['./rotas.component.scss']
})
export class RotasComponent {
  // Veiculo
  veiculo_id: Number | undefined;
  rotas: Rota[] | undefined;
  protected type: String = 'today';

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private service: RotasService,
    protected app: AppComponent,
    protected motorista: MotoristaComponent
  ){
    route.queryParams.subscribe(
      params => {
        this.veiculo_id = params['veiculo'];
        this.list_routes(this.type);
      }
    )
  }

  protected list_routes(type: String): void {
    if (this.veiculo_id) {
      this.app.setStatus(true);
      this.service.get(this.veiculo_id, type)
      .subscribe( (response) => {
          this.app.setStatus(false);
          if (!response.success) {
            this.motorista.openMessage(false, response.message);
            return;
          }

          this.rotas = response.rotas;
          this.type = type;
        }
      )
    }
  }

  protected show(rota: Rota): void {
    this.router.navigate(['motorista/home/rotas/detalhes'], { queryParams: {rota: JSON.stringify(rota)} });
  }

  protected back(): void {
    this.location.back();
  }
}