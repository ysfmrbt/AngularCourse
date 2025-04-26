import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PubService } from 'src/services/pub.service';
import { Pub } from 'src/models/Pub';
import { Subject, fromEvent } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  takeUntil,
} from 'rxjs/operators';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { PubFormComponent } from './pub-form/pub-form.component';
import { DetailsDialogComponent } from '../details-dialog/details-dialog.component';

// PrimeNG Imports
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    DialogModule,
    PubFormComponent,
    DatePipe,
  ],
})
export class ArticlesComponent implements OnInit, AfterViewInit, OnDestroy {
  publications: Pub[] = [];
  loading: boolean = true;

  @ViewChild('dt') dt!: Table;
  @ViewChild('input') input!: ElementRef;

  private destroy$ = new Subject<void>();

  // Dialog visibility flags
  pubDialogVisible: boolean = false;
  detailsDialogVisible: boolean = false;
  selectedPub: Pub | null = null;

  constructor(
    private pubService: PubService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadPublications();
  }

  ngAfterViewInit() {
    fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        map(() => this.input.nativeElement.value),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((filterValue) => {
        this.applyFilter(filterValue);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilter(filterValue: string) {
    this.dt.filterGlobal(filterValue.trim().toLowerCase(), 'contains');
  }

  loadPublications(): void {
    this.loading = true;
    this.pubService.getAllPubs().subscribe((data: Pub[]) => {
      this.publications = data;
      this.loading = false;
    });
  }

  deletePublication(id: string) {
    this.confirmationService.confirm({
      message: 'Voulez-vous vraiment supprimer cette publication ?',
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.pubService.deletePub(id).subscribe(
          () => {
            this.loadPublications();
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Publication supprimée',
            });
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible de supprimer la publication',
            });
            console.error('Error deleting publication:', error);
          }
        );
      },
    });
  }

  viewPublication(id: string) {
    window.open(
      this.publications.find((p) => p.id.toString() === id)?.lien,
      '_blank'
    );
  }

  viewPDF(id: string) {
    const pub = this.publications.find((p) => p.id.toString() === id);
    if (pub?.sourcePDF) {
      window.open(pub.sourcePDF, '_blank');
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'Information',
        detail: 'Aucun PDF disponible pour cette publication',
      });
    }
  }

  editPublication(pub: Pub) {
    console.log('Original pub:', pub);

    // Create a new object with explicit properties
    this.selectedPub = {
      id: pub.id,
      titre: pub.titre,
      type: pub.type,
      lien: pub.lien,
      date: pub.date,
      sourcePDF: pub.sourcePDF || '',
    };

    console.log('Selected pub with explicit properties:', this.selectedPub);
    this.pubDialogVisible = true;
  }

  addPublication() {
    this.selectedPub = null;
    this.pubDialogVisible = true;
  }

  getTypeColor(
    type: string
  ): 'success' | 'info' | 'warn' | 'danger' | undefined {
    switch (type) {
      case 'Conference':
        return 'info';
      case 'Journal':
        return 'success';
      case 'Book Chapter':
        return 'warn';
      case 'Workshop':
        return 'danger';
      default:
        return 'info';
    }
  }

  onPubDialogClose(result: boolean) {
    this.pubDialogVisible = false;
    if (result) {
      this.loadPublications();
    }
  }
}
