import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { LoginService, Login } from 'src/app/services/login.service';

interface EventLogin {
  type: String,
  login?: String,
  senha?: String,
  remember?: Boolean,
  platform?: String,
  token?: String,
  tokenRefreshed?: String,
  uuid?: String
}

interface EventRemember {
  type: String,
  login: String,
  senha: String,
  remember: Boolean
}

interface EventLink {
  type: String,
  url?: String,
  target?: String
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  login: String = '';
  password: String = '';
  remember: Boolean = false;
  communication: (event: MessageEvent<any>) => void;
  modal: any = {
    opened: false,
    url: '',
    text: ''
  }

  constructor (
    private app: AppComponent,
    private service: LoginService
  ){
    this.communication = event => {
      switch (event?.data?.type) {
        case 'fillForm':
          const rememberArgs = <EventRemember>event.data;
          this.login = rememberArgs.login;
          this.password = rememberArgs.senha;
          this.remember = rememberArgs.remember;
          break;
        case 'runLogin':
          const eventArgs = <EventLogin>event.data;
          this.app.platform = eventArgs.platform;
          // Params login
          const data: Login = {
            login: this.login,
            senha: this.password,
            tipo: eventArgs.platform,
            token: eventArgs.token,
            tokenRefreshed: eventArgs.tokenRefreshed,
            uuid: eventArgs.uuid
          };

          if (this.remember === false) {
            this.password = '';
          }

          this.service.authenticate(data).subscribe({
            next: (response) => {
              this.app.setStatus(false);
              if( response.success ) {
                this.service.login(response.token, response);
              } else {
                if (response.redirectTo) {
                  this.modal.url = response.redirectTo;
                  this.modal.text = response.message;
                  this.modal.opened = true;

                  if (this.app.platform?.toLocaleLowerCase() == 'ios') {
                    //this.sendCallNative(<EventLink>{ type: 'openLink', url: response.redirectTo, target: '_blank' });
                    window.open(this.modal.url, '_self');
                  } else {
                    window.open(this.modal.url, '_blank');
                  }
                } else {
                  alert(response.message);
                }
              }
            },
            error: (response: HttpErrorResponse) => {
              this.app.setStatus(false);
              console.log('HttpErrorResponse: ' + response.error.message);
              alert('Problema no servidor');
            }
          });
          break;
        default:
        break;
      }
    };
  }

  ngOnInit(): void {
    // Core to Functions Natives (Communication)
    window.addEventListener('message', this.communication);
  }

  ngOnDestroy(): void {
    window.removeEventListener("message", this.communication);
  }

  ngAfterViewInit(): void {
    this.sendCallNative({type: 'prepareForm'});
  }

  sendCallNative(event: EventLogin): void {
    if (window.parent.postMessage) {
      window.parent.postMessage(event, '*');
    } else {
      alert('error call native ' + event.type);
    }
  }

  closeModal(): void {
   this.modal.opened = false;
   this.modal.url = '';
   this.modal.text = '';
  }

  authenticate(): void {
    /*FUNCIONAR COM APP*/
    this.app.setStatus(true);
      if (this.remember) {
       this.sendCallNative({type: 'prepareLogin', login:this.login, senha:this.password, remember:this.remember});
     } else {
       this.sendCallNative({type: 'prepareLogin', login:this.login, senha:'', remember:this.remember});
     }

    /*FUNCIONAR SEM APP*/
    // this.app.setStatus(true);
    // this.sendCallNative({type: 'runLogin', platform: 'web', token: '', tokenRefreshed: '', uuid: ''});
  }
}
