import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { CompartilharService } from 'src/app/services/cliente/compartilhar.service';
import { Veiculo, VeiculosService } from 'src/app/services/cliente/veiculos.service';
import { ClienteComponent } from '../../cliente.component';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CompartilharCreateComponent implements OnInit {
  titlePage: String = 'Novo Link';
  veiculos: Veiculo[] | undefined;
  veiculosFiltered: Veiculo[] | undefined;
  step: Number = 1;

  // vars link
  descricao: String = '';
  expiracao: String = '';
  searchValue: String = '';
  veiculosInclude: Array<Number> = [];

  constructor(
    private app: AppComponent,
    protected base: ClienteComponent,
    private router: Router,
    private route: ActivatedRoute,
    protected location: Location,
    private service: CompartilharService,
    private veiculosService: VeiculosService
  ) {
  }

  ngOnInit(): void {
    this.veiculos = this.veiculosService.getList();
    this.veiculosFiltered = this.veiculos;

    if(this.veiculos === undefined) {
      this.service.load().subscribe(
        (response) => {
          if (response.success) {
            this.veiculosService.set(response.veiculos);
            this.veiculos = response.veiculos;
            this.veiculosFiltered = this.veiculos;
          } else {
            alert(response.message);
          }
        }
      )
    }
  }

  next(): void {
    this.step = 2;
  }

  back(): void {
    if (this.step === 2) {
      this.step = 1;
    } else {
      this.location.back();
    }
  }

  // Step 2
  filterSelectBem() {
    if (this.searchValue) {
      this.veiculosFiltered = this.filteredSelectBem(this.searchValue);
    } else {
      this.veiculosFiltered = this.veiculos;
    }
  }
  filterCancelSelectBem() {
    this.searchValue = '';
    this.filterSelectBem();         
  }
  filteredSelectBem(name: String) {
    return this.veiculos?.filter( (veiculo) => {
      return (
        veiculo.marca.toString() + veiculo.motorista.toString() + veiculo.name.toString()
      ).toLowerCase().indexOf(name.toLowerCase()) > -1;
    });
  }
  checkVeiculo(id: Number){
    return this.veiculosInclude.find(veiculoId => veiculoId === id) === undefined ? false : true;
  }
  includeVeiculo(id: Number){
    let isExist = this.veiculosInclude.find(veiculoId => veiculoId === id);
    if (isExist === undefined)
      this.veiculosInclude.push(id);
    else
      this.veiculosInclude = this.veiculosInclude.filter( veiculoId => veiculoId !== id);
  }

  finalizar(): void {
    this.service.create(this.descricao, this.expiracao, this.veiculosInclude.toString()).subscribe( (response) => {
      if (response.message) {
        this.base.openMessage(response.success, response.message);
        this.router.navigate(['cliente/compartilhar']);
      } else {
        this.base.openMessage(false, 'Problema no servidor');
      }
    });
  }
}
