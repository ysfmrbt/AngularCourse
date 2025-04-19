import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Import CommonModule & DatePipe
import { MemberService } from '../../services/member.service';
import { Member } from '../../models/Member';
// import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MemberFormComponent } from '../member-form/member-form.component';
import { DetailsDialogComponent } from '../details-dialog/details-dialog.component'; // Import DetailsDialogComponent
// import { MatPaginator } from '@angular/material/paginator';
// import { MatSort } from '@angular/material/sort';
// import { MatTableDataSource } from '@angular/material/table';
import { Subject, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api'; // Import services
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'; // Import DialogService
import { Table, TableModule } from 'primeng/table'; // Use 'Table' type here
import { ButtonModule, Button } from 'primeng/button';
import { InputTextModule, InputText } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog'; // Import ConfirmDialogModule
import { ToastModule } from 'primeng/toast'; // Import ToastModule
// Dialog/Confirmation imports later

// Temporary replacements for Material types
type MatDialog = any; 
type MatPaginator = any; 
type MatSort = any; 
type MatTableDataSource<T> = any; 

@Component({
    selector: 'app-member',
    templateUrl: './member.component.html',
    styleUrls: ['./member.component.css'],
    standalone: true,
    imports: [ 
      CommonModule,
      TableModule,
      ButtonModule,
      InputTextModule,
      ConfirmDialogModule,
      ToastModule,
      IconFieldModule, // Add IconFieldModule
      InputIconModule  // Add InputIconModule
    ]
})
export class MemberComponent implements OnInit, AfterViewInit, OnDestroy {
  members: Member[] = []; // Use direct array
  loading: boolean = true; // Add loading flag

  @ViewChild('dtMembers') dtMembers!: Table; // Updated ViewChild ref and type
  @ViewChild('input') input!: ElementRef; // Filter input reference

  private destroy$ = new Subject<void>();
  ref: DynamicDialogRef | undefined; // To store dialog reference

  constructor(
    private memberService: MemberService,
    private confirmationService: ConfirmationService, // Inject
    private messageService: MessageService, // Inject
    private dialogService: DialogService // Inject DialogService
    // private dialog: MatDialog // Commented out
  ) {
    // Replace MatTableDataSource instantiation
    // this.dataSource = new MatTableDataSource<Member>([]);
    this.members = []; // Basic mock object 
  }

  ngOnInit() {
    this.loadMembers();
  }

  ngAfterViewInit() {
    // Apply debounce to the custom filter input element
    fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        map(() => this.input.nativeElement.value),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(filterValue => {
        this.applyFilter(filterValue);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.ref) {
        this.ref.close();
    }
  }

  applyFilter(filterValue: string) {
     // Use the p-table's built-in global filter method
     this.dtMembers.filterGlobal(filterValue.trim().toLowerCase(), 'contains');
  }

  loadMembers(): void {
    this.loading = true;
    this.memberService.getAllMembers().subscribe((data) => {
      this.members = data; // Assign to members array
      this.loading = false;
    });
  }

  deleteMember(id: string) {
    this.confirmationService.confirm({
        message: 'Voulez-vous vraiment supprimer ce membre ?',
        header: 'Confirmation de suppression',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Oui, supprimer',
        rejectLabel: 'Annuler',
        acceptButtonStyleClass: 'p-button-danger',
        rejectButtonStyleClass: 'p-button-text',
        accept: () => {
            this.memberService.deleteMember(id).subscribe(() => {
                this.loadMembers();
                this.messageService.add({severity:'success', summary: 'Succès', detail: 'Membre supprimé'});
            }, (error) => {
                 this.messageService.add({severity:'error', summary: 'Erreur', detail: 'Impossible de supprimer le membre'});
                 console.error("Error deleting member:", error);
            });
        },
        reject: () => {
             // this.confirmationService.close(); // Close is usually handled automatically
        }
    });
  }

  viewMember(id: string) {
     this.ref = this.dialogService.open(DetailsDialogComponent, {
            header: `Détails du membre`,
            width: '600px',
            contentStyle: {"overflow": "auto"},
            baseZIndex: 10000,
            data: { memberId: id } // Pass member ID
        });
     // No onClose needed
  }

  openMemberDialog(member?: Member) {
    console.log("Open member dialog (Dialog logic commented out)", member);
    // const dialogRef = this.dialog.open(MemberFormComponent, {
    //   width: '500px',
    //   data: { member: member }
    // });

    // dialogRef.afterClosed().subscribe((result: any) => { // Added :any type
    //   if (result) {
    //     this.loadMembers();
    //   }
    // });
  }

  addMember() {
    console.log("Add member triggered");
     this.ref = this.dialogService.open(MemberFormComponent, {
            header: 'Ajouter un membre',
            width: '450px',
            contentStyle: { "overflow": "auto" },
            baseZIndex: 10000
        });

     this.ref.onClose.subscribe((result) => {
          if (result) {
              this.loadMembers();
          }
     });
  }

  editMember(member: Member) {
    console.log("Edit member:", member);
     this.ref = this.dialogService.open(MemberFormComponent, {
            header: 'Modifier le membre',
            width: '450px',
            contentStyle: { "overflow": "auto" },
            baseZIndex: 10000,
            data: { member: member }
        });

     this.ref.onClose.subscribe((result) => {
          if (result) {
              this.loadMembers();
          }
     });
  }
}
