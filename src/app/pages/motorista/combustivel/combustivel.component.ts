import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { AppComponent } from 'src/app/app.component';
import { CombustivelService, Despesa, DespesaAtributo } from 'src/app/services/motorista/combustivel.service';
import { MotoristaComponent } from '../motorista.component';
import { Fornecedor, FornecedoresService } from 'src/app/services/motorista/fornecedores.service';

@Component({
  selector: 'app-combustivel',
  templateUrl: './combustivel.component.html',
  styleUrls: ['./combustivel.component.scss']
})
export class CombustivelComponent implements OnInit {
  // Variaveis relacionadas ao elementos da pagina (Data / Filtro)
  // Tipo de listagem (Abastecimentos ou Fornecedores)
  typeList: String = 'abastecimento';
  searchValue: String = '';
  dateFilter: moment.Moment = moment();

  // Variaveis relacionadas a listagem de fornecedores
  fornecedores: Fornecedor[] | undefined;
  fornecedoresFiltered: Fornecedor[] | undefined;

  // Variaveis relacionadas a listagem de abastecimentos
  abastecimentos: Despesa[] = [];
  abastecimentosFiltered: [String, number, Despesa[]][] = [];
  abastecimentosCalculos = {
    total: 0,
    pago: 0,
    naoPago: 0
  };
  constructor(
    private location: Location,
    private router: Router,
    protected app: AppComponent,
    private service: CombustivelService,
    private motorista: MotoristaComponent,
    private fornecedoresService: FornecedoresService
  ){}

  ngOnInit(): void {  
    console.log('dev-rlv', this.dateFilter.format());
    this.refresh(this.dateFilter);

    // load fornecedores refreshed
    this.fornecedoresService.get().subscribe(
      (fornecedores) => {
        if (fornecedores.success) {
          this.fornecedores = fornecedores.fornecedores;
          this.fornecedoresFiltered = this.fornecedores;
        }
        this.app.setStatus(false);
      }
    )
  }

  // Ordernar conforme o dia / em conjuntos
  orderAbastecimento(abastecimento: Despesa): void {
    let exists = false;
    let index = 0;
    for (var [dia, , despesa] of this.abastecimentosFiltered) {
      if (dia == abastecimento.date) {
        exists = true;
        this.abastecimentosFiltered[index][1] += abastecimento.valor;
        despesa.push(abastecimento);
        break;
      }
      index++;
    }
    if (!exists) {
      this.abastecimentosFiltered?.push([abastecimento.date, abastecimento.valor, [abastecimento]]);
    }
  }

  // Filtrar conforme fornecedor / em conjuntos
  filterAbastecimento(texto: String): [String, number, Despesa[]][] {
    var abastecimentos: Despesa[] = this.abastecimentos.filter( (abastecimento) => abastecimento.atributos.fornecedor?.nome?.toUpperCase().includes(texto.toString().toUpperCase()) );
    var abastecimentosFiltered: [String, number, Despesa[]][] = [];

    abastecimentos.forEach( (abastecimento) => {
      // OrderAbastecimento()
      let exists = false;
      let index = 0;
      for (var [dia, total, despesa] of abastecimentosFiltered) {
        if (dia == abastecimento.date) {
          exists = true;
          abastecimentosFiltered[index][1] += abastecimento.valor;
          despesa.push(abastecimento);
          break;
        }
        index++;
      }
      if (!exists) {
        abastecimentosFiltered?.push([abastecimento.date, abastecimento.valor, [abastecimento]]);
      }
      //
    });

    return abastecimentosFiltered;
  }

  // Filtrar fornecedor conforme o nome da empresa
  filterFornecedor(texto: String): Fornecedor[] | undefined {
    return this.fornecedores?.filter( (fornecedor) => 
      fornecedor.nome.toUpperCase().includes(texto.toString().toUpperCase()) 
      || fornecedor.cidade?.toUpperCase().includes(texto.toString().toUpperCase())
      || fornecedor.estado?.toUpperCase().includes(texto.toString().toUpperCase())
    );
  }

  refresh(date: moment.Moment): void {
    this.app.setStatus(true);
    this.service.get(date.format()).subscribe(
      (response) => {
        this.abastecimentosFiltered = [];
        this.app.setStatus(false);
        this.abastecimentosCalculos = { total:0, pago:0, naoPago:0 };
        
        if (response.success && response.historico) {
          this.abastecimentos = response.historico;
          this.abastecimentos.forEach( (abastecimento) => {
            this.orderAbastecimento(abastecimento);
            this.abastecimentosCalculos.total += abastecimento.valor;
            if (abastecimento.atributos.pago) {
              this.abastecimentosCalculos.pago += abastecimento.valor;
            } else {
              this.abastecimentosCalculos.naoPago += abastecimento.valor;
            }
          });

          if (this.searchValue) {
            this.abastecimentosFiltered = this.filterAbastecimento(this.searchValue);
          }
        }

        if (!response.success) {
          this.motorista.openMessage(false, response.message);
        }
      }
      
    )
  }

  protected back(): void {
    this.location.back();
  }

  protected openCreate(): void {
    this.app.setStatus(true);
    this.router.navigate(['motorista/home/combustivel/create']);
  }

  protected nextMonth(): void {
    this.dateFilter.add(1, 'month');
    this.refresh(this.dateFilter);
  }

  protected backMonth(): void {
    this.dateFilter.subtract(1, 'month');
    this.refresh(this.dateFilter);
  }
  
  protected filterType(): void {
    this.abastecimentosFiltered = this.filterAbastecimento(this.searchValue);
    this.fornecedoresFiltered = this.filterFornecedor(this.searchValue);
  }

  protected filterTypeCancel(): void {
    this.searchValue = '';
    this.abastecimentosFiltered = this.filterAbastecimento(this.searchValue);
    this.fornecedoresFiltered = this.filterFornecedor(this.searchValue);
  }

  protected setTypeList(type: String): void {
    this.typeList = type;
  }

  protected actionAbastecimento(abastecimento: Despesa): void {
    this.motorista.openActionSheet(
      `${abastecimento.atributos.fornecedor?.nome} - ${abastecimento.atributos.litros} litros (${moment(abastecimento.date.toString()).format('DD/MM/YYYY')})`, 'Ações sobre o abastecimento',
      [
        {
          text: 'Marcar como pago',
          icon: 'fa-check',
          handler: () => {
            this.service.update(abastecimento.id, true).subscribe(
              (response) => {
                if (response.success) {
                  this.refresh(this.dateFilter);
                }

                this.motorista.openMessage(response.success, response.message);
              }
            )
          }
        },
        {
          text: 'Marcar como não pago',
          icon: 'fa-exclamation-triangle',
          handler: () => {
            this.service.update(abastecimento.id, false).subscribe(
              (response) => {
                if (response.success) {
                  this.refresh(this.dateFilter);
                }

                this.motorista.openMessage(response.success, response.message);
              }
            )
          }
        },
        {
          text: 'Excluir',
          icon: 'fa-trash',
          handler: () => {
            this.service.delete(abastecimento.id).subscribe(
              (response) => {
                if (response.success) {
                  this.refresh(this.dateFilter);
                }

                this.motorista.openMessage(response.success, response.message);
              }
            )
          }
        }
      ]
    )
  }
}
