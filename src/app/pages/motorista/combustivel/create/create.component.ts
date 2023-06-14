import { Location } from '@angular/common';
import { Component, Input, OnInit, SecurityContext } from '@angular/core';
import * as moment from 'moment';
import { MotoristaComponent } from '../../motorista.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CombustivelResponse, CombustivelService } from 'src/app/services/motorista/combustivel.service';
import { HttpEventType } from '@angular/common/http';
import { AppComponent } from 'src/app/app.component';
import { Veiculo } from 'src/app/services/cliente/veiculos.service';
import { Fornecedor, FornecedoresService } from 'src/app/services/motorista/fornecedores.service';
import Swal from 'sweetalert2';
import { showSelectVeiculos } from 'src/app/app.animation';
import * as EstadosCidades from 'src/assets/json/estados-cidades.json';


interface ImageForm {
  file: File | undefined,
  safeUrl: SafeUrl | undefined,
  url: String | undefined
}

interface Combustivel {
  id: Number,
  tipo: String
}

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  animations: [ showSelectVeiculos ]
})
export class CombustivelCreateComponent implements OnInit {
  // Dados do banco
  Brasil: any = EstadosCidades;
  veiculos: Veiculo[] | undefined;
  fornecedores: Fornecedor[] | undefined;
  combustiveis: Combustivel[] = [
    { id: 1, tipo: 'Gasolina comum' },
    { id: 2, tipo: 'Gasolina aditivada' },
    { id: 3, tipo: 'Gasolina premium' },
    { id: 4, tipo: 'Diesel comum (S-500)' },
    { id: 5, tipo: 'Diesel S-10' },
    { id: 6, tipo: 'Diesel aditivado' },
    { id: 7, tipo: 'Diesel premium' },
    { id: 8, tipo: 'Etanol comum' },
    { id: 9, tipo: 'Etanol aditivado' },
    { id: 10, tipo: 'Gás natural' },
    { id: 11, tipo: 'Outro' }
  ];
  // Dados

  // Infos da UI
  selectVeiculo = {
    overlayClass: 'hidden',
    selectClass: 'closed',
    text: '',
    filterValue: '',
    filtered: [] as Veiculo[] | undefined
  };
  selectFornecedor = {
    overlayClass: 'hidden',
    selectClass: 'closed',
    text: '',
    filterValue: '',
    filtered: [] as Fornecedor[] | undefined
  };
  selectCombustivel = {
    overlayClass: 'hidden',
    selectClass: 'closed',
    text: '',
    filterValue: '',
    filtered: this.combustiveis
  };
  // Infos UI

  // Formulario
  formInputs = {
    veiculo: 0,
    data: moment().format("YYYY-MM-DDTHH:mm"),
    fornecedor: 0,
    valor: '',
    litros: '',
    hodometro: '',
    tipo: 0,
    pago: false,
    interno: false
  };
  // Form

  // Imagens upload
  imagens: ImageForm[] = [
    { file: undefined, safeUrl:undefined, url: undefined },
    { file: undefined, safeUrl:undefined, url: undefined },
    { file: undefined, safeUrl:undefined, url: undefined },
    // { file: undefined, safeUrl:undefined, url: undefined },
    // { file: undefined, safeUrl:undefined, url: undefined }
  ];
  countImagens: number = 0;
  // Imagens upload

  // Swal (cadastro fornecedor)
  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger',
      actions: 'btn-dialog-actions'
    },
    buttonsStyling: false
  })
  // Swal



  constructor(
    private sanitizer: DomSanitizer,
    private location: Location,
    private app: AppComponent,
    private motorista: MotoristaComponent,
    private service: CombustivelService,
    private fornecedoresService: FornecedoresService
  ){}

  ngOnInit(): void {
    // stylized to scrollbar
    var headerHeight = document.getElementById("header-create")?.offsetHeight;
    if (headerHeight) {
      var content = document.getElementById("content-create");
      if (content) {
        content.style.height = `calc( 100vh - ${headerHeight+10}px )`;
      }
    }

    // veiculos loaded in perfil
    this.veiculos = this.motorista.veiculos;
    this.selectVeiculo.filtered = this.veiculos;

    // load fornecedores refreshed
    this.fornecedoresService.get().subscribe(
      (fornecedores) => {
        if (fornecedores.success) {
          this.fornecedores = fornecedores.fornecedores;
          this.selectFornecedor.filtered = this.fornecedores;
        }
        this.app.setStatus(false);
      }
    )
  }

  public maskValue (event: any, type: String): void {
    var v = event.target.value.replace(/[^0-9]+/g,'');
    let length = (new String(v.toString())).length;

    if (type == 'valor') {
      if (length == 3){
        v = v.replace(/(\d{1})(\d)/,"$1.$2")
      } else if(length == 4){
        v = v.replace(/(\d{2})(\d)/,"$1.$2")
      } else if(length == 5){
        v = v.replace(/(\d{3})(\d)/,"$1.$2")
      } else if(length == 6){
        v = v.replace(/(\d{4})(\d)/,"$1.$2")
      } else if(length > 6){
        event.target.value = this.formInputs.valor;
        return;
      }
      this.formInputs.valor = v;
    } else if (type == 'litros') {
      if (length == 3){
        v = v.replace(/(\d{1})(\d)/,"$1.$2")
      } else if(length == 4){
        v = v.replace(/(\d{2})(\d)/,"$1.$2")
      } else if(length == 5){
        v = v.replace(/(\d{3})(\d)/,"$1.$2")
      } else if(length == 6){
        v = v.replace(/(\d{4})(\d)/,"$1.$2")
      } else if(length > 6){
        event.target.value = this.formInputs.litros;
        return;
      }
      this.formInputs.litros = v;
    } else if (type == 'hodometro') {
      if (length >= 4 && length <= 6) {
        v = v.replace(/(\d{1,3})(\d{3})/,"$1.$2");
      } else if (length >= 7 && length <= 9) {
        v = v.replace(/(\d{1,3})(\d{3})(\d{3})/,"$1.$2.$3");
      } else if (length >= 10 && length <= 12) {
        v = v.replace(/(\d{1,3})(\d{3})(\d{3})(\d{3})/,"$1.$2.$3.$4");
      } else if (length > 12) {
        event.target.value = this.formInputs.hodometro;
        return;
      }
      this.formInputs.hodometro = v;
    }

    event.target.value = v;
  }

  protected openInputDate(): void {
    document.getElementById('date')?.click();
  }

  protected back(): void {
    this.location.back();
  }

  protected sanitize(url:string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  protected setFornecedor(value:string): void {
    this.formInputs.fornecedor = parseInt(value);
  }

  protected setVeiculo(value:string): void {
    this.formInputs.veiculo = parseInt(value);
  }

  protected readURL(input:any): void {
    const target = input.target as HTMLInputElement;
    const files = target.files as FileList;
    if (files && files[0]) {
      let url = window.URL.createObjectURL(files[0]);
      let sanitizedUrl = this.sanitizer.bypassSecurityTrustUrl(url);
      this.imagens[this.countImagens] = {
        file: files[0],
        safeUrl: sanitizedUrl,
        url: url
      }
      this.countImagens++;
      console.log(this.countImagens, this.imagens);
      target.value = "";
    }
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

  protected addImagem(): void {
    if (this.countImagens == 3) {
      alert('O limite de imagens já foi atingido');
      return;
    }
    document.getElementById('input-images')?.click();
  }

  protected save(): void {
    if (this.formInputs.fornecedor == 0 && this.formInputs.interno == false) {
      alert('Escolha um fornecedor');
      return;
    }

    if (this.formInputs.veiculo == 0) {
      alert('Escolha um veículo');
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
    data.append('date', this.formInputs.data);
    data.append('litros', this.formInputs.litros.toString());
    data.append('valor', this.formInputs.valor.toString());
    data.append('fornecedor', this.formInputs.fornecedor.toString());
    data.append('pago', this.formInputs.pago.toString());
    data.append('veiculo', this.formInputs.veiculo.toString());
    data.append('hodometro', this.formInputs.hodometro.replaceAll('.', '').toString());
    data.append('tipo', this.formInputs.tipo.toString());
    data.append('bomba_interna', this.formInputs.interno.toString())
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
          var response = <CombustivelResponse>event.body;
          this.app.setStatus(false);
          this.app.setStatusText('');
          if (!response.success) {
            this.motorista.openMessage(false, response.message);
          } else {
            this.motorista.openMessage(true, response.message);
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

  protected addFornecedor(): void {
    this.swalWithBootstrapButtons.fire({
      title: 'Novo Fornecedor',
      text: 'Informe o nome da empresa',
      // imageUrl: 'assets/modals/velocidadelimite.png',
      imageWidth: 100,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Salvar',
      didOpen: () => {
        // Carregar estado e cidades no dropdown
        //@ts-ignore
        $.each(this.Brasil.estados, function (i, estado) {
          //@ts-ignore
          $.each(estado.cidades, function (i, cidade) {
            //@ts-ignore
            $('#swal-fornecedor-estado-cidade').append($('<option>', { 
                value: estado.sigla+';'+cidade,
                text : `${cidade}/${estado.sigla}`
            }));
          });
        });
        //@ts-ignore
        $('#swal-fornecedor-estado-cidade').select2();

        // Mascara CNPJ
        //@ts-ignore
        $('#swal-fornecedor-cnpj').mask('00.000.000/0000-00', {reverse: true});
      },
      html:
      '<input required id="swal-fornecedor-nome" class="swal2-input" placeholder="Nome da empresa" style="margin:.5rem 0" maxlength="30" />' +
      '<input required type="text" id="swal-fornecedor-cnpj" class="swal2-input" placeholder="CNPJ da empresa" style="margin:.5rem 0" maxlength="18" />' +
      '<input required id="swal-fornecedor-rua" class="swal2-input" placeholder="Rua e número" style="margin:.5rem 0" maxlength="50" />' +
      '<input required id="swal-fornecedor-bairro" class="swal2-input" placeholder="Bairro" style="margin:.5rem 0 1rem 0" maxlength="30" />' +
      `<select id="swal-fornecedor-estado-cidade" name="state" style="max-width: 100%;">
        <option selected value=0>Selecionar estado</option>
      </select>`
      // '<input required id="swal-fornecedor-cidade" class="swal2-input" placeholder="Cidade" style="margin:.5rem 0" maxlength="30" />' +
      // '<input required id="swal-fornecedor-estado" class="swal2-input" placeholder="Estado" style="margin:.5rem 0" maxlength="2" />',
    }).then((result) => {
      if (result.isConfirmed) {
        var nome = (<HTMLInputElement>document.getElementById('swal-fornecedor-nome'));
        var cnpj = (<HTMLInputElement>document.getElementById('swal-fornecedor-cnpj'));
        var rua = (<HTMLInputElement>document.getElementById('swal-fornecedor-rua'));
        var bairro = (<HTMLInputElement>document.getElementById('swal-fornecedor-bairro'));
        var localidade = (<HTMLInputElement>document.getElementById('swal-fornecedor-estado-cidade'));
        
        // Validando os campos do modal
        // Fechando e abrindo novamente caso não estejam válidos
        if (!nome.value || !cnpj.value || !rua.value || !bairro.value || (!localidade.value || localidade.value == '0')) {
          this.swalWithBootstrapButtons.fire('Preencha todos os campos', '', 'error').then(
            () => this.addFornecedor()
          );
          return;
        }

        // Separando cidade/estado do input único
        var local =  new String(localidade.value);
        var [estado, cidade] = local.split(';');
        
        // Criando novo objeto fornecedor para cadastro
        var novoFornecedor: Fornecedor = {
          nome: new String(nome.value),
          cnpj: new String(cnpj.value),
          rua: new String(rua.value),
          bairro: new String(bairro.value),
          cidade: new String(cidade),
          estado: new String(estado),
        };
        //

        this.app.setStatus(true);
        this.fornecedoresService.salvar(novoFornecedor).subscribe( (response) => {
          response.success
          ? this.swalWithBootstrapButtons.fire(response.message.toString(), '', 'success').then(
            () => {
              this.fornecedores = response.fornecedores;
              this.filterSelect('fornecedor');
            }
          )
          : this.swalWithBootstrapButtons.fire(response.message.toString(), '', 'error');
          //
          this.app.setStatus(false);
        });
      }
    })
  }


  // ActionsSheet filters
  openSelect (type: String) {
    switch (type) {
      case 'veiculo':
        this.selectVeiculo.overlayClass = 'visible';
        this.selectVeiculo.selectClass = 'opened';
      break;
      case 'fornecedor':
        this.selectFornecedor.overlayClass = 'visible';
        this.selectFornecedor.selectClass = 'opened';
      break;
      case 'combustivel':
        this.selectCombustivel.overlayClass = 'visible';
        this.selectCombustivel.selectClass = 'opened';
      break;
      default:break;
    }

    console.log('dev-rlv', this.selectFornecedor);
  }
  closeSelect (type: String) {
    switch (type) {
      case 'veiculo':
        this.selectVeiculo.overlayClass = 'hidden';
        this.selectVeiculo.selectClass = 'closed';
      break;
      case 'fornecedor':
        this.selectFornecedor.overlayClass = 'hidden';
        this.selectFornecedor.selectClass = 'closed';
      break;
      case 'combustivel':
        this.selectCombustivel.overlayClass = 'hidden';
        this.selectCombustivel.selectClass = 'closed';
      break;
      default:break;
    }
  }
  selectedOnSelect (item: Veiculo | Fornecedor | Combustivel, type: String) {
    switch (type) {
      case 'veiculo':
        let veiculo: Veiculo = item as Veiculo;
        this.formInputs.veiculo = Number(veiculo.id);
        this.selectVeiculo.text = veiculo.name.toString();
        this.closeSelect(type);
      break;
      case 'fornecedor':
        let fornecedor: Fornecedor = item as Fornecedor;
        this.formInputs.fornecedor = Number(fornecedor.id);
        this.selectFornecedor.text = fornecedor.nome.toString();
        this.closeSelect(type);
      break;
      case 'combustivel':
        let combustivel: Combustivel = item as Combustivel;
        this.formInputs.tipo = Number(combustivel.id);
        this.selectCombustivel.text = combustivel.tipo.toString();
        this.closeSelect(type);
      break;
      default:break;
    }
  }
  filterSelect (type: String) {
    switch (type) {
      case 'veiculo':
        this.selectVeiculo.filtered = this.selectVeiculo.filterValue
        ? this.filteredSelect(this.selectVeiculo.filterValue, type) as Veiculo[]
        : this.selectVeiculo.filtered = this.veiculos;
      break;
      case 'fornecedor':
        this.selectFornecedor.filtered = this.selectFornecedor.filterValue
        ? this.filteredSelect(this.selectFornecedor.filterValue, type) as Fornecedor[]
        : this.selectFornecedor.filtered = this.fornecedores;
      break;
      case 'combustivel':
        this.selectCombustivel.filtered = this.selectCombustivel.filterValue
        ? this.filteredSelect(this.selectCombustivel.filterValue, type) as Combustivel[]
        : this.selectCombustivel.filtered = this.combustiveis;
      break;
      default:break;
    }
  }
  filterCancelSelectBem (type: String) {
    switch (type) {
      case 'veiculo':
        this.selectVeiculo.filterValue = '';
        this.filterSelect(type);
      break;
      case 'fornecedor':
        this.selectFornecedor.filterValue = '';
        this.filterSelect(type);
      break;
      case 'combustivel':
        this.selectCombustivel.filterValue = '';
        this.filterSelect(type);
      break;
      default:break;
    }
  }
  filteredSelect(text: String, type: String): Veiculo[] | Fornecedor[] | Combustivel[] | undefined {
    if (type == 'veiculo') {
      return this.veiculos?.filter( (veiculo) => {
        return (
          veiculo.marca.toString() + veiculo.motorista.toString() + veiculo.name.toString()
        ).toLowerCase().indexOf(text.toLowerCase()) > -1;
      });
    } else if (type == 'fornecedor') {
      return this.fornecedores?.filter( (fornecedor) => {
        if (fornecedor.nome && fornecedor.cnpj && fornecedor.cidade && fornecedor.estado)
          return (
            fornecedor.nome.toString() + fornecedor.cnpj + fornecedor.cidade + fornecedor.estado
          ).toLowerCase().indexOf(text.toLowerCase()) > -1;
        else if (fornecedor.nome)
          return fornecedor.nome?.toLowerCase().indexOf(text.toLowerCase()) > -1;
        else
          return false;
      });
    } else if (type == 'combustivel') {
      return this.combustiveis?.filter( (combustivel) => {
        if (combustivel.tipo)
          return combustivel.tipo?.toLowerCase().indexOf(text.toLowerCase()) > -1;
        else
          return false;
      });
    }

    return undefined;
  }
  // ActionSheet filters
}
