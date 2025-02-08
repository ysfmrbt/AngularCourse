import {Component, OnInit} from '@angular/core';
import {MemberService} from "../../services/member.service";
import {Member} from "../../models/Member";
@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.css'],
})
export class MemberComponent implements OnInit {
  dataSource: Member[] = [];
  displayedColumns: string[] = [
    'id',
    'cin',
    'name',
    'type',
    'createDate',
    'action',
  ];
  // Injection de MemberService dans le composant
  constructor(private memberService: MemberService) {

  }

    ngOnInit() {
    this.memberService.getAllMembers().subscribe((data) => {
      this.dataSource = data;
    });
  }
}
