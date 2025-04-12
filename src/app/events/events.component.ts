import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { EventService } from 'src/services/event.service';
import { Event } from 'src/models/Event';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { EventFormComponent } from './event-form/event-form.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DetailsDialogComponent } from '../details-dialog/details-dialog.component';
import { Subject, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css'],
})
export class EventsComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = [
    'id',
    'titre',
    'lieu',
    'date_debut',
    'date_fin',
    'action',
  ];
  dataSource!: MatTableDataSource<Event>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') input!: ElementRef; // Get reference to input element

  private destroy$ = new Subject<void>(); // Subject to manage subscription cleanup

  constructor(private eventService: EventService, private dialog: MatDialog) {
    this.dataSource = new MatTableDataSource<Event>([]);
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Custom filter predicate
    this.dataSource.filterPredicate = (data: Event, filter: string) => {
      const searchStr = filter.toLowerCase();
      // Ensure all fields are checked, handling potential undefined/null values if necessary
      return (
        data.id?.toString().toLowerCase().includes(searchStr) ||
        data.titre?.toLowerCase().includes(searchStr) ||
        data.lieu?.toLowerCase().includes(searchStr)
        // Add other searchable fields if needed
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

  loadEvents(): void {
    this.eventService.getAllEvents().subscribe((data: Event[]) => {
      this.dataSource.data = data;
    });
  }

  deleteEvent(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Voulez-vous supprimer cet événement ?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.eventService.deleteEvent(id).subscribe(() => {
          this.loadEvents();
          // Consider adding success feedback (e.g., snackbar)
        });
      }
    });
  }

  viewEvent(id: string) {
    this.eventService.getEvent(id).subscribe((event) => {
      // Format dates for display if needed, or handle in DetailsDialogComponent
      this.dialog.open(DetailsDialogComponent, {
        width: '500px',
        data: { ...event }, // Pass raw event data
      });
    });
  }

  openEventDialog(event?: Event) {
    const dialogRef = this.dialog.open(EventFormComponent, {
      width: '500px',
      data: { event: event }, // Pass event data for editing
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadEvents();
         // Consider adding success feedback (e.g., snackbar)
      }
    });
  }

  addEvent() {
    this.openEventDialog(); // Open dialog without data for adding
  }

  editEvent(event: Event) {
    this.openEventDialog(event); // Open dialog with event data for editing
  }
}
