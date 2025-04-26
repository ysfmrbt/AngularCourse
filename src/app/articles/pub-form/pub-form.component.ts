import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { PubService } from 'src/services/pub.service';
import { Pub } from 'src/models/Pub';
import { CommonModule } from '@angular/common';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';

import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-pub-form',
  templateUrl: './pub-form.component.html',
  styleUrls: ['./pub-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    CalendarModule,
    ButtonModule,
    DropdownModule,
  ],
})
export class PubFormComponent implements OnInit {
  pubForm!: FormGroup;
  isEditMode = false;

  @Input() pub: Pub | null = null;
  @Output() formSubmit = new EventEmitter<Pub>();
  @Output() formCancel = new EventEmitter<void>();

  pubTypes = [
    { label: 'Conference', value: 'Conference' },
    { label: 'Journal', value: 'Journal' },
    { label: 'Book Chapter', value: 'Book Chapter' },
    { label: 'Workshop', value: 'Workshop' },
  ];

  constructor(
    private pubService: PubService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();

    console.log('Pub input received:', this.pub);

    if (this.pub) {
      this.isEditMode = true;
      this.populateForm(this.pub);
      console.log('Form after population:', this.pubForm.value);
    }
  }

  initForm(): void {
    this.pubForm = new FormGroup({
      titre: new FormControl('', [Validators.required]),
      type: new FormControl('', [Validators.required]),
      lien: new FormControl('', [
        Validators.required,
        Validators.pattern('https?://.+'),
      ]),
      date: new FormControl(null, [Validators.required]),
      sourcePDF: new FormControl('', [Validators.pattern('https?://.+')]),
    });
  }

  populateForm(pub: Pub): void {
    console.log('Populating form with:', pub);

    // Directly set form control values
    this.pubForm.get('titre')?.setValue(pub.titre || '');
    this.pubForm.get('type')?.setValue(pub.type || '');
    this.pubForm.get('lien')?.setValue(pub.lien || '');
    this.pubForm.get('date')?.setValue(pub.date ? new Date(pub.date) : null);
    this.pubForm.get('sourcePDF')?.setValue(pub.sourcePDF || '');

    // Mark all fields as touched to trigger validation
    this.pubForm.markAllAsTouched();

    // Force change detection
    setTimeout(() => {
      console.log('Form value after timeout:', this.pubForm.value);
    }, 0);
  }

  onSubmit(): void {
    if (this.pubForm.invalid) {
      this.pubForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez corriger les erreurs dans le formulaire.',
      });
      return;
    }

    const formValue = this.pubForm.value;
    const pubData: Partial<Pub> = {
      ...formValue,
      date: formValue.date?.toISOString(),
    };

    const operation =
      this.isEditMode && this.pub?.id
        ? this.pubService.updatePub(String(this.pub.id), pubData as Pub)
        : this.pubService.addPub(pubData as Pub);

    operation.subscribe({
      next: (response) => {
        const successMsg = this.isEditMode
          ? 'Publication mise à jour'
          : 'Publication ajoutée';
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: successMsg,
        });
        this.formSubmit.emit(response);
      },
      error: (error) => {
        console.error('Error saving publication:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Impossible d'enregistrer la publication.",
        });
      },
    });
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
