import {Component, effect, inject, signal} from '@angular/core';
import {CustomTableComponent} from './dynamic-table/components/table/table.component';
import {TableColumnConfigType} from './dynamic-table/types';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {TemplateNameDirective} from './dynamic-table/diretives/template-name.directive';

@Component({
  selector: 'app-root',
  imports: [CustomTableComponent, TemplateNameDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  title = 'dynamic-table';

  http = inject(HttpClient)

  data = []
  totalElements = 0


  columns: TableColumnConfigType[] = [
    {header: 'نام کامل', field: 'fullName', cellValue: (row) => row.firstName + ' ' + row.lastName},
    {header: 'نام', field: 'firstName', sortable: true},
    {header: 'نام خانوادگی', field: 'lastName'},
    {header: 'ایمیل', field: 'email'},
    {
      header: 'جنیست',
      field: 'gender',
      // cellStyle: (row) => ({'color': row.gender === GENDER.FEMALE ? 'red' : 'green'})
    },
    {header: 'نام کاربری', field: 'username', cellStyle: {'font-size': '20px'}},
    {header: 'تاریخ تولد', field: 'birthDate'},
    {
      header: 'سن', field: 'age',
      pipes: [{name: 'decimal'}],
      cellStyle: (row) => ({'color': row.age > 30 ? 'red' : 'green'}),
      cellClass: (row) => (row.age > 10000 ? 'green' : 'red'),
    },
    {header: 'علیات', field: 'actions'},
  ];

  ngOnInit() {
   this.fetchData()
  }

  fetchData(data?){
    return this.http.post(`https://dummyjson.com/users/?limit=${data?.size}&skip=${data?.page}`, {}).subscribe(data => {
      this.data = data['users']
      this.totalElements = data['total']
    })
  }

  onPageChange($event: any) {
    console.log($event)
    this.fetchData($event)
  }

  onEdit(row: any) {
    console.log(row)
  }

  onDelete(row: any) {
    console.log(row)
  }

  protected readonly onselectionchange = onselectionchange;

  onSelectionchange($event: any[]) {
    console.log($event)
  }
}
