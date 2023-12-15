import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { AppComponent } from 'src/app/app.component';
import { ActivatedRoute, Router } from '@angular/router';
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
  protected type_filter: String = 'todos';
  protected locals_filtered: Local_Details[] | undefined;
  protected progress: String = '0%';
  protected locals_finished: number = 0;

  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private service: RotasService,
    protected app: AppComponent,
    protected motorista: MotoristaComponent
  ){
    this.rota = this.motorista.rota;
    if (this.rota) {
      this.locals_filtered = this.rota.locals_details;
      this.locals_finished = this.rota.locals_details?.filter((detail, index) => 
        (index > 0) ? detail.deliver_status === 4 : detail.status === 4
      ).length;
      this.progress = `${(this.locals_finished / this.rota?.locals_details?.length) * 100}%`;
    }
  }

  protected openRota (endereco: String): void {
    this.motorista.openActionSheet(
      '', 'Abrir mapa externo',
      [
        {
          text: 'Waze',
          icon: 'WAZE-ICON',
          handler: () => this.sendCallNative({ 
            type: 'openLink', 
            url: "https://waze.com/ul?q" + endereco + "&navigate=yes", 
            target: '_system' 
          })
        },
        {
          text: 'Google Maps',
          icon: 'fa-google',
          handler: () => this.sendCallNative({ 
            type: 'openLink', 
            url: "https://www.google.com/maps/search/?api=1&query=" + endereco, 
            target: '_system' 
          })
        }
      ]
    )
  }

  protected filterRota (type: String): void {
    this.type_filter = type;
    if (type === 'pendentes') {
      this.locals_filtered = this.rota?.locals_details?.filter((detail, index) => 
        (index > 0) ? detail.deliver_status === 0 : detail.status === 0
      );
      return;
    }

    this.locals_filtered = this.rota?.locals_details;
  }

  protected openCheckin(index: number, local: Local_Details): void {
    this.router.navigate(['motorista/home/rotas/checkin'], { 
      queryParams: {
        rota_id: this.rota?.id,
        local_index: index,
        local_status: index === 0 ? local.status : local.deliver_status
      }
    });
  }

  protected getTypeStatus (status: number | undefined): String | null {
    switch (status) {
      case 0: return "Pendente";
      case 1: return "Em andamento";
      case 2: return "Atrasado";
      case 3: return "Cancelado";
      case 4: return "Finalizado";
      default: return null;
    }
  }

  protected getClassStatus (status: number | undefined): String | null {
    switch (status) {
      case 0: return "";
      case 1: return "running";
      case 2: return "late";
      case 3: return "canceled";
      case 4: return "finished";
      default: return null;
    }
  }

  protected sendCallNative(event: any): void {
    if (window.parent.postMessage) {
      window.parent.postMessage(event, '*');
    } else {
      alert('error call native ' + event.type);
    }
  }

  protected back(): void {
    this.location.back();
  }
}
