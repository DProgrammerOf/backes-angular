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
    this.rota && this.refreshRota(this.rota);
  }

  protected openWhatsapp(local: Local_Details): void {
    if (local.deliver_whatsapp) {
      const number_whatsapp = local.deliver_whatsapp.replace(/\D/g,'');
      const text = encodeURI(`Olá, me chamo ${this.motorista.perfil?.nome} e estou em rota com o seu produto!`);
      this.sendCallNative({
        type: 'openLink', 
        url: 'https://api.whatsapp.com/send?phone=55'+number_whatsapp+'&text='+text, 
        target: '_system' 
      })
    }
  }

  protected refreshRota(rota: Rota) {
    this.motorista.rota = rota;
    this.rota = this.motorista.rota;
    this.locals_filtered = rota.locals_details;
    this.locals_finished = rota.locals_details?.filter((detail, index) => 
      (index > 0) ? detail.deliver_status === 4 : detail.status === 4
    ).length;
    this.progress = `${(this.locals_finished / rota.locals_details?.length) * 100}%`;
  }

  protected startRota (local_index: number, local: Local_Details): void {
    const id_rota = this.rota?.id ?? -1;

    this.app.setStatusText("Atualizando rota");
    this.app.setStatus(true);
    this.service.create_quick(id_rota, local_index).subscribe(
      (response) => {
        response.success && response.rota && this.refreshRota(response.rota);
        this.app.setStatus(false);
        this.app.setStatusText('');
        this.motorista.openMessage(response.success, response.message);
      }
    )
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
            url: "https://waze.com/ul?q="+ endereco +"&navigate=yes", 
            target: '_system' 
          })
        },
        {
          text: 'Google Maps',
          icon: 'fa-google',
          handler: () => this.sendCallNative({
            type: 'openLink', 
            url: "https://www.google.com/maps/dir/?api=1&destination=" + endereco, 
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

  protected openCheckin(index: number, status: number): void {
    this.router.navigate(['motorista/home/rotas/checkin'], { 
      queryParams: {
        rota_id: this.rota?.id,
        local_index: index,
        local_status: status
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

  protected getClassStatus (details: Local_Details): String {
    const status = details.status ?? details.deliver_status ?? -1;
    switch (status) {
      case 0: return "waiting";
      case 1: return "running";
      case 2: return "late";
      case 3: return "canceled";
      case 4: return "finished";
      default: return '';
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
