import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { AppComponent } from 'src/app/app.component';
import { ActivatedRoute } from '@angular/router';
import { Rota, RotasService, Local_Details} from 'src/app/services/motorista/rotas.service';
import { MotoristaComponent } from '../../motorista.component';

@Component({
  selector: 'app-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.scss']
})
export class RotasDetalhesComponent {
  // Rota
  protected rota: Rota | undefined;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private service: RotasService,
    protected app: AppComponent,
    protected motorista: MotoristaComponent
  ){
    route.queryParams.subscribe(
      params => {
        this.rota = <Rota>JSON.parse(params['rota']);
      }
    )
  }

  protected back(): void {
    this.location.back();
  }
}
