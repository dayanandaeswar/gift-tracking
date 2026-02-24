import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ApiService } from '../../shared/services/api.service';
import { FunctionEvent } from '../../shared/models/models';
import { toDateString } from '../../shared/utils/date.util';

@Component({
  selector: 'app-function-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatDatepickerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit' : 'New' }} Function</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Function Name *</mat-label>
          <input matInput formControlName="name"
            placeholder="e.g. Ram's Wedding" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Event Date</mat-label>
          <input matInput [matDatepicker]="dp" formControlName="eventDate" />
          <mat-datepicker-toggle matSuffix [for]="dp" />
          <mat-datepicker #dp />
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary"
        (click)="save()" [disabled]="form.invalid">
        {{ data ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form { min-width: 380px; display: flex; flex-direction: column; gap: 4px; }
    .w-full { width: 100%; }
  `],
})
export class FunctionFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private ref = inject(MatDialogRef<FunctionFormDialogComponent>);
  data = inject<FunctionEvent | null>(MAT_DIALOG_DATA);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    eventDate: [null],
    description: [''],
  });

  ngOnInit() {
    if (this.data) {
      this.form.patchValue({
        name: this.data.name,
        // Append T00:00:00 so datepicker shows correct local date
        eventDate: this.data.eventDate
          ? new Date(`${this.data.eventDate}T00:00:00`)
          : null,
        description: this.data.description ?? '',
      });
    }
  }

  save() {
    if (this.form.invalid) return;
    const raw = this.form.value;

    // Convert Date object → plain YYYY-MM-DD string before sending
    const payload = {
      ...raw,
      eventDate: toDateString(raw.eventDate),
    };

    const obs = this.data
      ? this.api.updateFunction(this.data.id, payload)
      : this.api.createFunction(payload);
    obs.subscribe(() => this.ref.close(true));
  }
}
