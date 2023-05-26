import { AfterViewInit, Component } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { PerfilService } from 'src/app/services/cliente/perfil.service';
import { ClienteComponent } from '../cliente.component';

interface FormPerfil {
  nome: String,
  email: String,
  celular: String,
  telefone: String,
  endereco: String,
  bairro: String,
  cidade: String,
  estado: String,
  cep: String
};

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements AfterViewInit {
  titlePage: String = 'Perfil';
  form: FormPerfil = Object();
  formDisabled: boolean = true;
  constructor(
    protected app: AppComponent,
    protected base: ClienteComponent,
    private service: PerfilService,
  ) {}

  ngAfterViewInit(): void {
    this.app.setStatus(true);
    this.service.get()
    .subscribe( perfil => {
      this.app.setStatus(false);
      if (perfil.success === false) {
        alert(perfil.message);
        return;
      }
      this.form.nome = perfil.perfil?.nome as any;
      this.form.email = perfil.perfil?.email as any;
      this.form.celular = perfil.perfil?.celular as any;
      this.form.telefone = perfil.perfil?.telefone as any;
      this.form.endereco = perfil.perfil?.endereco as any;
      this.form.bairro = perfil.perfil?.bairro as any;
      this.form.cidade = perfil.perfil?.cidade as any;
      this.form.estado = perfil.perfil?.estado as any;
      this.form.cep = perfil.perfil?.cep as any
      })
    .add( () => this.app.setStatus(false) );
  }

  save(): void {
    this.app.setStatus(true);
    this.service
      .update({
        nome: this.form.nome,
        email: this.form.email,
        celular: this.form.celular,
        telefone: this.form.telefone,
        endereco: this.form.endereco,
        bairro: this.form.bairro,
        cidade: this.form.cidade,
        estado: this.form.estado,
        cep: this.form.cep
      })
      .subscribe( perfil => {
        if (perfil.success === false) {
          if (perfil.message) {
            this.base.openMessage(perfil.success, perfil.message);
          }
          return;
        }
        this.service.get()
        .subscribe( perfil => {
          if (perfil.success === false) {
            if (perfil.message) {
              this.base.openMessage(perfil.success, perfil.message);
            }
            return;
          }
          this.form.nome = perfil.perfil?.nome as any;
          this.form.email = perfil.perfil?.email as any;
          this.form.celular = perfil.perfil?.celular as any;
          this.form.telefone = perfil.perfil?.telefone as any;
          this.form.endereco = perfil.perfil?.endereco as any;
          this.form.bairro = perfil.perfil?.bairro as any;
          this.form.cidade = perfil.perfil?.cidade as any;
          this.form.estado = perfil.perfil?.estado as any;
          this.form.cep = perfil.perfil?.cep as any;
          })
        .add( () => this.app.setStatus(false) );
      });
  }
}
