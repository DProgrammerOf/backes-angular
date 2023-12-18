import { Component } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AppComponent } from 'src/app/app.component';
import { MotoristaComponent } from '../../motorista.component';
import { NgxImageCompressService } from 'ngx-image-compress';
import * as moment from 'moment';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RotaResponse, RotasService } from 'src/app/services/motorista/rotas.service';
import { HttpEventType } from '@angular/common/http';

interface ImageForm {
  file: File | undefined,
  safeUrl: SafeUrl | undefined,
  url: String | undefined
}

@Component({
  selector: 'app-checkin',
  templateUrl: './checkin.component.html',
  styleUrls: ['./checkin.component.scss']
})
export class RotasCheckinComponent {
   // Imagens upload
   imagens: ImageForm[] = [
    { file: undefined, safeUrl:undefined, url: undefined },
    { file: undefined, safeUrl:undefined, url: undefined },
    { file: undefined, safeUrl:undefined, url: undefined },
  ];
  countImagens: number = 0;
  // Imagens upload

  // Formulario
  formInputs = {
    rota_id: 0,
    local_index: 0,
    dia: moment().format("YYYY-MM-DDTHH:mm"),
    hora: moment().format("HH:mm"),
    status: 0,
    cliente_name: '',
    observacao: ''
  };
  // Form

  constructor(
    private imageCompress: NgxImageCompressService,
    private sanitizer: DomSanitizer,
    private location: Location,
    protected app: AppComponent,
    private route: ActivatedRoute,
    private router: Router,
    private motorista: MotoristaComponent,
    private service: RotasService
  ){
    route.queryParams.subscribe(
      params => {
        this.formInputs.rota_id = params['rota_id'];
        this.formInputs.local_index = params['local_index'];
        this.formInputs.status = params['local_status'];
      }
    )
  }

  protected back(): void {
    this.location.back();
  }
  
  protected save(): void {
    if (this.formInputs.rota_id === 0) {
      alert('Rota inválida');
      return;
    }

    if (this.formInputs.cliente_name === '') {
      alert('Informe o cliente/empresa');
      return;
    }

    // Formatando um objeto FormData
    // Com as imagens e todos os campos da página
    var data: FormData = new FormData();
    this.imagens.forEach( (img, index) => {
      if (img.file) {
        data.append('imagem-'+index.toString(), img.file)
      }
    });
    data.append('rota_id', this.formInputs.rota_id.toString());
    data.append('local_index', this.formInputs.local_index.toString());
    data.append('receptor_nome', this.formInputs.cliente_name.toString());
    data.append('observacao', this.formInputs.observacao.toString());
    data.append('status', this.formInputs.status.toString());
    data.append('date', this.formInputs.dia);
    //

    // Fazendo o envio das imagens e sinalizando ao cliente o progresso e finalização
    this.app.setStatusText("Enviando imagens");
    this.app.setStatus(true);
    this.service.create(data).subscribe(
      (event) => {
        if (event.type == HttpEventType.UploadProgress && event.total) {
          this.app.setStatusText("Enviando imagens: " + Math.round(100 * (event.loaded / event.total)).toString() + "%");
          if (event.loaded == event.total) {
            this.app.setStatusText("Envio finalizado");
          }
        }
        if (event.type == HttpEventType.Response) {
          var response = <RotaResponse>event.body;
          this.app.setStatus(false);
          this.app.setStatusText('');
          if (!response.success) {
            this.motorista.openMessage(false, response.message);
          } else {
            this.motorista.openMessage(true, response.message);
            this.motorista.rota = response.rota;
            this.back();
          }
        }
        if (event.type == HttpEventType.ResponseHeader) {
          if (!event.ok) {
            this.app.setStatus(false);
            this.app.setStatusText('');
            this.motorista.openMessage(false, 'Ocorreu um erro no servidor');
          }
        }
      }
    )
    //
  }

  protected openInputDate(): void {
    document.getElementById('date')?.click();
  }
  
  protected addImagem(): void {
    if (this.countImagens == 3) {
      alert('O limite de imagens já foi atingido');
      return;
    }
    document.getElementById('input-images')?.click();
  }

  protected delImagem(index: number): void {
    if (this.imagens[index].file === undefined) {
      return;
    }

    this.motorista.openActionSheet(
      '', '',
      [
        {
          text: 'Remover imagem',
          icon: 'fa-trash-o',
          handler: () => this.organizeURL(this.imagens[index], index)
        }
      ]
    )
  }

  protected organizeURL(imagem: ImageForm, index: number): void {
    var url = imagem.url?.toString();
    if (url) {
      window.URL.revokeObjectURL(url);
      this.imagens[index] = { file: undefined, safeUrl: undefined, url: undefined };
      let imagensOrderned: ImageForm[] = [
        { file: undefined, safeUrl:undefined, url: undefined },
        { file: undefined, safeUrl:undefined, url: undefined },
        { file: undefined, safeUrl:undefined, url: undefined },
        // { file: undefined, safeUrl:undefined, url: undefined },
        // { file: undefined, safeUrl:undefined, url: undefined }
      ];
      let countImagensOrdened: number = 0;
      this.imagens.forEach((img) => {
        if (img.file) {
          imagensOrderned[countImagensOrdened] = img;
          countImagensOrdened++;
        }
      })
      this.countImagens = countImagensOrdened;
      this.imagens = imagensOrderned;
      console.log(this.countImagens, this.imagens);
    }
  }

  private dataURLtoFile(dataurl:string, filename:string) {
    var arr = dataurl?.split(','),
      mime = arr[0].match(/:(.*?);/)?.[1],
      bstr = atob(arr[arr.length - 1]), 
      n = bstr.length, 
      u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  }

  protected readURL(input:any): void {
    const target = input.target as HTMLInputElement;
    const files = target.files as FileList;
    if (files && files[0]) {

      var reader = new FileReader();
      reader.readAsDataURL(files[0]);
      reader.addEventListener(
        "load",
        () => {
          // convert image file to base64 string
          if (typeof reader?.result != 'string') {
            return;
          }
          // Compress image 50%
          this.imageCompress
          .compressFile(reader.result, orientation, 50, 50)
          .then(compressedImage => {
            // Create object url to image compressed and load preview
            var file_compressed = this.dataURLtoFile(compressedImage, files[0].name);
            let url = window.URL.createObjectURL(file_compressed);
            let sanitizedUrl = this.sanitizer.bypassSecurityTrustUrl(url);
            this.imagens[this.countImagens] = {
              file: file_compressed,
              safeUrl: sanitizedUrl,
              url: url
            }
            this.countImagens++;
            target.value = "";
          });
        },
        false,
      );

      
    }
  }
}
