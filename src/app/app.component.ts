import {Component, inject} from '@angular/core';
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
    {header: 'آدرس', field: 'address'},
    {
      header: 'جنیست',
      field: 'gender',
      // cellStyle: (row) => ({'color': row.gender === GENDER.FEMALE ? 'red' : 'green'})
    },
    {header: 'تاریخ', field: 'createdDate', cellStyle: {'font-size': '20px'}},
    {header: 'تاریخ تولد', field: 'birthDate'},
    {
      header: 'محل لولد', field: 'birthPlaceId',
      pipes: [{name: 'decimal'}],
      cellStyle: (row) => ({'color': row.birthPlaceId > 10000 ? 'red' : 'green'}),
      cellClass: (row) => (row.birthPlaceId > 10000 ? 'green' : 'red'),
    },
    {header: 'علیات', field: 'actions'},
  ];

  ngOnInit() {
    const headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1dGhvcml0eSI6IlJPTEVfYWRtaW4iLCJpc3MiOiJIYW1yYWggTG90dXMiLCJleHAiOjE3NTY5Mjc4NDgsInVzZXJJZCI6MSwiaWF0IjoxNzU2ODg0NjQ4fQ.VeOOaXHX-kUfnQtv2va1hDp9On3mXoERKgvqpgc0SVNja6ugO3zQ03UyGL5elRwc1PFIzS-gX6ao0oyJRI1q-A')
    return this.http.post(`https://sand.vee.ir/api/report/end-users/get-all`, {}, {headers}).subscribe(data => {
      this.data = data['body'].content
      this.totalElements = data['body'].totalElements
    })
  }

  onPageChange($event: any) {
    console.log($event)
  }

  onEdit(row: any) {
    console.log(row)
  }

  onDelete(row: any) {
    console.log(row)
  }
}
