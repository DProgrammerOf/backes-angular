import { Component } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AppComponent } from 'src/app/app.component';
import { MotoristaComponent } from '../../motorista.component';
import { NgxImageCompressService } from 'ngx-image-compress';
import * as moment from 'moment';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Local_Details } from 'src/app/services/motorista/rotas.service';

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
    local_index: 0,
    dia: moment().format("YYYY-MM-DDTmm:hh"),
    hora: moment().format("mm:hh"),
    status: 0,
    cliente_name: '',
    observacao: ''
  };
  // Form

  constructor(
    private sanitizer: DomSanitizer,
    private location: Location,
    private app: AppComponent,
    private route: ActivatedRoute,
    private motorista: MotoristaComponent,
    private imageCompress: NgxImageCompressService
  ){
    route.queryParams.subscribe(
      params => {
        this.formInputs.local_index = params['local_index'];
        this.formInputs.status = params['local_status'];
      }
    )
  }

  protected back(): void {
    this.location.back();
  }
  
  protected save(): void {

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
