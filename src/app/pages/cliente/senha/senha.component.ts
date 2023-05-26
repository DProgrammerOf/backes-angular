import { Component } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { PerfilService } from 'src/app/services/cliente/perfil.service';
import { ClienteComponent } from '../cliente.component';

interface FormPerfilSenha {
  senha: String,
  novasenha: String,
  novasenha_conf: String,
};

@Component({
  selector: 'app-senha',
  templateUrl: './senha.component.html',
  styleUrls: ['./senha.component.scss']
})
export class SenhaComponent {
  titlePage: String = 'Senha';
  form: FormPerfilSenha = Object();
  formDisabled: boolean = true;
  constructor(
    private app: AppComponent,
    protected base: ClienteComponent,
    private service: PerfilService,
  ) {}

  save(): void {
    if (this.form.novasenha_conf !== this.form.novasenha) {
      alert('As senhas não coincidem, tente novamente');
      return;
    }
    this.app.setStatus(true);
    this.service
      .update_senha({
        senha_atual: this.form.senha,
        nova_senha: this.form.novasenha_conf
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
          this.form.senha = '';
          this.form.novasenha = '';
          this.form.novasenha_conf = '';
          this.base.openMessage(perfil.success, "Senha alterada com sucesso");
        })
      })
      .add( () => this.app.setStatus(false) );
  }
}
