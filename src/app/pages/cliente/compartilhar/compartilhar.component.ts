import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { CompartilharService, Link } from 'src/app/services/cliente/compartilhar.service';
import { Veiculo } from 'src/app/services/cliente/veiculos.service';
import Swal from 'sweetalert2';
import { ClienteComponent } from '../cliente.component';


interface EventLink {
  type: String,
  url: String
}

@Component({
  selector: 'app-compartilhar',
  templateUrl: './compartilhar.component.html',
  styleUrls: ['./compartilhar.component.scss']
})
export class CompartilharComponent implements OnInit {
  titlePage: String = 'Compartilhar';
  veiculos: Veiculo[] | undefined;
  links: Link[] | undefined;

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
    protected location: Location,
    private service: CompartilharService
  ) {
  }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.app.setStatus(true);
    this.service.load().subscribe( (response) => {
      this.app.setStatus(false);
      if (response.success) {
        this.links = response.links;
        this.veiculos = response.veiculos;
      }
    });
  }

  selectLink(link: Link): void {
    this.base.openActionSheet(
      '', 'Links - Ações',
      [
        {
          text: 'Copiar link',
          icon: 'fa-copy',
          handler: () => {
            var eventLinkArgs = <EventLink>{ type:'copyLink', url: link.url };
            window.parent.postMessage(eventLinkArgs, '*');
          }
        },
        {
          text: 'Ver veiculo(s)',
          icon: 'fa-car',
          handler: () => this.mostrarVeiculos(link.veiculos)
        },
        {
          text: 'Deletar',
          icon: 'fa-trash-o',
          handler: () => this.delete(link)
        },
      ]
    )
  }

  addLink(): void {
    this.router.navigate(['cliente/compartilhar/create']);
  }

  mostrarVeiculos(veiculosLink: Veiculo[]): void {
    let message = '<br>';
    veiculosLink.forEach( (veiculo) => message += '<strong>('+veiculo.name+')</strong> '+veiculo.marca+' '+veiculo.cor+'<br>');
    message += '';
    this.swalWithBootstrapButtons.fire({
      title: 'Veículos vinculados',
      html: message,
      showCancelButton: false,
      confirmButtonText: 'OK',
    });
  }

  delete(link: Link): void {
    this.service.delete(link.id).subscribe( (response) => {
      if (response.message) {
        this.base.openMessage(response.success, response.message);
        this.refresh();
      } else {
        this.base.openMessage(false, 'Problema no servidor');
      }
    })
  }

}
