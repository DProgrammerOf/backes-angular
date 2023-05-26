import { AfterContentInit, AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { NotificacoesService } from 'src/app/services/cliente/notificacoes.service';
import { DataService } from 'src/app/services/data.service';
import { ClienteComponent } from '../cliente.component';

@Component({
  selector: 'app-notificacoes',
  templateUrl: './notificacoes.component.html',
  styleUrls: ['./notificacoes.component.scss']
})
export class NotificacoesComponent implements AfterViewInit {
  titlePage: String = 'Notificações';
  @Input() IgnicaoOn: Boolean = false;
  @Input() IgnicaoOff: Boolean = false;
  @Input() CercaVirtual: Boolean = false;
  @Input() VelocidadeLimite: Boolean = false;
  constructor(
    protected app: AppComponent,
    protected base: ClienteComponent,
    private service: NotificacoesService,
  ) {}

  ngAfterViewInit(): void {
    this.app.setStatus(true);
    this.service.getList()
    .subscribe( notificacoes => {
      this.app.setStatus(false);
      if (notificacoes.success === false) {
        if (notificacoes.message) {
          this.base.openMessage(notificacoes.success, notificacoes.message);
        }
        return;
      }
      this.IgnicaoOn = notificacoes.data?.ignicao_ligada == "S";
      this.IgnicaoOff = notificacoes.data?.ignicao_desligada == "S";
      this.CercaVirtual = notificacoes.data?.cerca_virtual == "S";
      this.VelocidadeLimite = notificacoes.data?.velocidade_limite == "S";
    })
    .add( () => this.app.setStatus(false) );
  }

  save(): void {
    this.app.setStatus(true);
    this.service
      .update({
        bloqueio: "S",
        desbloqueio: "S",
        ignicao_ligada: this.IgnicaoOn ? "S" : "N",
        ignicao_desligada: this.IgnicaoOff ? "S" : "N",
        cerca_virtual: this.CercaVirtual ? "S" : "N",
        velocidade_limite: this.VelocidadeLimite ? "S" : "N",
      })
      .subscribe( notificacoes => {
        if (notificacoes.success === false) {
          if (notificacoes.message) {
            this.base.openMessage(notificacoes.success, notificacoes.message);
          }
          return;
        }
        this.IgnicaoOn = notificacoes.data?.ignicao_ligada == "S";
        this.IgnicaoOff = notificacoes.data?.ignicao_desligada == "S";
        this.CercaVirtual = notificacoes.data?.cerca_virtual == "S";
        this.VelocidadeLimite = notificacoes.data?.velocidade_limite == "S";
      })
      .add( () => this.app.setStatus(false) );
  }
}
