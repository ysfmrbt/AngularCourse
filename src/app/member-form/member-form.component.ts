import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MemberService } from 'src/services/member.service';
import { Member } from 'src/models/Member';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-member-form',
  templateUrl: './member-form.component.html',
  styleUrls: ['./member-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
  ],
})
export class MemberFormComponent implements OnInit {
  memberForm: FormGroup;
  isEditMode = false;

  @Input() member: Member | null = null;
  @Output() formSubmit = new EventEmitter<Member>();
  @Output() formCancel = new EventEmitter<void>();

  memberTypes = [
    { label: 'Enseignant', value: 'Enseignant' },
    { label: 'Etudiant', value: 'Etudiant' },
    { label: 'Autre', value: 'Autre' },
  ];

  constructor(
    private fb: FormBuilder,
    private memberService: MemberService,
    private messageService: MessageService
  ) {
    this.memberForm = this.fb.group({
      cin: ['', [Validators.required, Validators.minLength(8)]],
      nom: ['', Validators.required],
      type: ['', Validators.required],
      createDate: [{ value: null, disabled: true }],
    });
  }

  ngOnInit() {
    console.log('Member input received:', this.member);

    if (this.member) {
      this.isEditMode = true;

      // Directly set form control values
      this.memberForm.get('cin')?.setValue(this.member.cin || '');
      this.memberForm.get('nom')?.setValue(this.member.nom || '');
      this.memberForm.get('type')?.setValue(this.member.type || '');

      if (this.member.createDate) {
        this.memberForm
          .get('createDate')
          ?.setValue(new Date(this.member.createDate).toLocaleDateString());
      }

      // Disable the createDate field
      this.memberForm.get('createDate')?.disable();

      // Mark all fields as touched to trigger validation
      this.memberForm.markAllAsTouched();

      // Force change detection
      setTimeout(() => {
        console.log('Form value after timeout:', this.memberForm.getRawValue());
      }, 0);
    } else {
      this.memberForm.removeControl('createDate');
    }
  }

  onSubmit(): void {
    if (this.memberForm.invalid) {
      this.memberForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez corriger les erreurs dans le formulaire.',
      });
      return;
    }

    const formValue = this.memberForm.getRawValue();
    const { createDate, ...memberData } = formValue;

    const operation =
      this.isEditMode && this.member?.id
        ? this.memberService.editMember(this.member.id, memberData as Member)
        : this.memberService.addMember(memberData as Member);

    operation.subscribe({
      next: (savedMember) => {
        const successMsg = this.isEditMode
          ? 'Membre mis à jour'
          : 'Membre ajouté';
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: successMsg,
        });
        this.formSubmit.emit(savedMember);
      },
      error: (error) => {
        console.error('Error saving member:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Impossible d'enregistrer le membre.",
        });
      },
    });
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
