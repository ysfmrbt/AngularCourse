import { Component } from '@angular/core';
@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.css'],
})
export class MemberComponent {

  dataSource :any[]= [
    {
      id:'1245',
      cin:'1254',
      name: 'imene',
      type:'teacher',
      createDate:'12/12'
    },
    {
      id:'5524',
      cin:'5542',
      name: 'aymen',
      type:'student',
      createDate:'13/12'
    }
  ]
  displayedColumns: string[] = ['id', 'cin', 'name', 'type', 'createDate', 'action'];

}
