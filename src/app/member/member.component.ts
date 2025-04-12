import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { MemberService } from '../../services/member.service';
import { Member } from '../../models/Member';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MemberFormComponent } from '../member-form/member-form.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-member',
    templateUrl: './member.component.html',
    styleUrls: ['./member.component.css'],
    standalone: false
})
export class MemberComponent implements OnInit, AfterViewInit, OnDestroy {
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
  @ViewChild('input') input!: ElementRef; // Get reference to input element

  private destroy$ = new Subject<void>(); // Subject to manage subscription cleanup

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

    // Custom filter predicate
    this.dataSource.filterPredicate = (data: Member, filter: string) => {
      const searchStr = filter.toLowerCase();
      // Ensure all fields are checked, handling potential undefined/null values if necessary
      return (
        data.id?.toString().toLowerCase().includes(searchStr) ||
        data.cin?.toLowerCase().includes(searchStr) ||
        data.nom?.toLowerCase().includes(searchStr) ||
        data.type?.toLowerCase().includes(searchStr)
      );
    };

    // Apply debounce to filter input
    fromEvent<KeyboardEvent>(this.input.nativeElement, 'keyup')
      .pipe(
        map(event => (event.target as HTMLInputElement).value),
        debounceTime(300), // Wait for 300ms pause in events
        distinctUntilChanged(), // Only emit if value has changed
        takeUntil(this.destroy$) // Unsubscribe when component is destroyed
      )
      .subscribe(filterValue => {
        this.applyFilter(filterValue);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilter(filterValue: string) {
    // This method now takes the debounced value directly
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
           // Consider adding success feedback (e.g., snackbar)
        });
      }
    });
  }

  // Add viewMember method if needed
  viewMember(id: string) {
    // Placeholder: Implement logic to view member details
    // Could open a dialog similar to viewEvent or navigate to a detail page
    console.log('View member with ID:', id);
    // Example: Open a details dialog (requires DetailsDialogComponent)
    // this.memberService.getMember(id).subscribe(member => {
    //   this.dialog.open(DetailsDialogComponent, {
    //     width: '500px',
    //     data: { ...member }
    //   });
    // });
  }

  openMemberDialog(member?: Member) {
    const dialogRef = this.dialog.open(MemberFormComponent, {
      width: '500px',
      data: { member: member } // Pass member data for editing
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMembers();
         // Consider adding success feedback (e.g., snackbar)
      }
    });
  }

  addMember() {
    this.openMemberDialog(); // Open dialog without data for adding
  }

  editMember(member: Member) {
    this.openMemberDialog(member); // Open dialog with member data for editing
  }
}
