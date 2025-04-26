import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { EventService } from 'src/services/event.service';
import { Router } from '@angular/router';
import { Event } from 'src/models/Event';
import { FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';

import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    CalendarModule,
    ButtonModule,
  ],
})
export class EventFormComponent implements OnInit {
  eventForm: FormGroup;
  isEditMode = false;

  @Input() event: Event | null = null;
  @Output() formSubmit = new EventEmitter<Event>();
  @Output() formCancel = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private messageService: MessageService
  ) {
    this.eventForm = this.fb.group(
      {
        titre: ['', Validators.required],
        lieu: ['', Validators.required],
        date_debut: [null as Date | null, Validators.required],
        date_fin: [null as Date | null, Validators.required],
      },
      { validators: this.dateRangeValidator() }
    );
  }

  ngOnInit() {
    console.log('Event input received:', this.event);

    if (this.event) {
      this.isEditMode = true;

      // Directly set form control values
      this.eventForm.get('titre')?.setValue(this.event.titre || '');
      this.eventForm.get('lieu')?.setValue(this.event.lieu || '');

      if (this.event.date_debut) {
        this.eventForm
          .get('date_debut')
          ?.setValue(new Date(this.event.date_debut));
      }

      if (this.event.date_fin) {
        this.eventForm.get('date_fin')?.setValue(new Date(this.event.date_fin));
      }

      // Mark all fields as touched to trigger validation
      this.eventForm.markAllAsTouched();

      // Force change detection
      setTimeout(() => {
        console.log('Form value after timeout:', this.eventForm.value);
      }, 0);
    }
  }

  private dateRangeValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const startDate = group.get('date_debut')?.value;
      const endDate = group.get('date_fin')?.value;
      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        group.get('date_fin')?.setErrors({
          ...(group.get('date_fin')?.errors || {}),
          dateRange: true,
        });
        return { dateRange: true };
      }
      if (group.get('date_fin')?.hasError('dateRange')) {
        const errors = group.get('date_fin')?.errors;
        if (errors) {
          delete errors['dateRange'];
          if (Object.keys(errors).length === 0) {
            group.get('date_fin')?.setErrors(null);
          } else {
            group.get('date_fin')?.setErrors(errors);
          }
        }
      }
      return null;
    };
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez corriger les erreurs dans le formulaire.',
      });
      return;
    }

    const formValue = this.eventForm.value;
    const eventData: Partial<Event> = {
      ...formValue,
      date_debut: formValue.date_debut?.toISOString(),
      date_fin: formValue.date_fin?.toISOString(),
    };

    const operation =
      this.isEditMode && this.event?.id
        ? this.eventService.updateEvent(this.event.id, eventData as Event)
        : this.eventService.addEvent(eventData as Event);

    operation.subscribe({
      next: (response) => {
        const successMsg = this.isEditMode
          ? 'Événement mis à jour'
          : 'Événement ajouté';
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: successMsg,
        });
        this.formSubmit.emit(response);
      },
      error: (error) => {
        console.error('Error saving event:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Impossible d'enregistrer l'événement.",
        });
      },
    });
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
