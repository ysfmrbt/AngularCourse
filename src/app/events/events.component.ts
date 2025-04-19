import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { EventService } from 'src/services/event.service';
import { Event } from 'src/models/Event';
import { Subject, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EventFormComponent } from './event-form/event-form.component';
import { DetailsDialogComponent } from '../details-dialog/details-dialog.component';

// PrimeNG Imports
import { Table, TableModule } from 'primeng/table';
import { ButtonModule, Button } from 'primeng/button';
import { InputTextModule, InputText } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-events',
    templateUrl: './events.component.html',
    styleUrls: ['./events.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        ConfirmDialogModule,
        ToastModule,
        IconFieldModule,
        InputIconModule
    ]
})
export class EventsComponent implements OnInit, AfterViewInit, OnDestroy {
  events: Event[] = [];
  loading: boolean = true;

  @ViewChild('dt') dt!: Table;
  @ViewChild('input') input!: ElementRef;

  private destroy$ = new Subject<void>();
  ref: DynamicDialogRef | undefined;

  constructor(
    private eventService: EventService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  ngAfterViewInit() {
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
    this.dt.filterGlobal(filterValue.trim().toLowerCase(), 'contains');
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getAllEvents().subscribe((data: Event[]) => {
      this.events = data;
      this.loading = false;
    });
  }

  deleteEvent(id: string) {
    this.confirmationService.confirm({
        message: 'Voulez-vous vraiment supprimer cet événement ?',
        header: 'Confirmation de suppression',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Oui, supprimer',
        rejectLabel: 'Annuler',
        acceptButtonStyleClass: 'p-button-danger',
        rejectButtonStyleClass: 'p-button-text',
        accept: () => {
            this.eventService.deleteEvent(id).subscribe(() => {
                this.loadEvents();
                this.messageService.add({severity:'success', summary: 'Succès', detail: 'Événement supprimé'});
            }, (error) => {
                 this.messageService.add({severity:'error', summary: 'Erreur', detail: 'Impossible de supprimer l\'événement'});
                 console.error("Error deleting event:", error);
            });
        },
        reject: () => {
             // this.confirmationService.close(); // Close is usually handled automatically
        }
    });
  }

  viewEvent(id: string) {
    this.ref = this.dialogService.open(DetailsDialogComponent, {
        header: `Détails de l\'événement`,
        width: '600px',
        contentStyle: {"overflow": "auto"},
        baseZIndex: 10000,
        data: { eventId: id }
    });
  }

  editEvent(event: Event) {
    this.ref = this.dialogService.open(EventFormComponent, {
        header: 'Modifier l\'événement',
        width: '50%',
        contentStyle: {"max-height": "500px", "overflow": "auto"},
        baseZIndex: 10000,
        data: { event: event }
    });

    this.ref.onClose.subscribe((result) => {
        if (result) {
            this.loadEvents();
        }
    });
  }

  addEvent() {
    this.ref = this.dialogService.open(EventFormComponent, {
        header: 'Ajouter un événement',
        width: '50%',
        contentStyle: {"max-height": "500px", "overflow": "auto"},
        baseZIndex: 10000
    });

    this.ref.onClose.subscribe((result) => {
        if (result) {
            this.loadEvents();
        }
    });
  }
}
