import { Component, OnInit, ViewChild } from '@angular/core';
import { MemberService } from '../../services/member.service';
import { Member } from '../../models/Member';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MemberFormComponent } from '../member-form/member-form.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.css'],
})
export class MemberComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'cin',
    'name',
    'type',
    'createDate',
    'action',
  ];
  dataSource!: MatTableDataSource<Member>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private memberService: MemberService,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource<Member>([]);
  }

  ngOnInit() {
    this.loadMembers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Custom filter predicate to search across multiple columns
    this.dataSource.filterPredicate = (data: Member, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        data.id.toString().toLowerCase().includes(searchStr) ||
        data.cin.toLowerCase().includes(searchStr) ||
        data.nom.toLowerCase().includes(searchStr) ||
        data.type.toLowerCase().includes(searchStr)
      );
    };
  }

  applyFilter(event: KeyboardEvent) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadMembers(): void {
    this.memberService.getAllMembers().subscribe((data) => {
      this.dataSource.data = data;
    });
  }

  deleteMember(id: string) {
    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Voulez-vous supprimer ce membre ?' }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.memberService.deleteMember(id).subscribe(() => {
          this.loadMembers();
        });
      }
    });
  }

  openMemberDialog(member?: Member) {
    const dialogRef = this.dialog.open(MemberFormComponent, {
      width: '500px',
      data: { member: member }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMembers();
      }
    });
  }

  addMember() {
    this.openMemberDialog();
  }

  editMember(member: Member) {
    this.openMemberDialog(member);
  }
}
