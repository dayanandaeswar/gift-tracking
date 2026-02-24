import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ApiService } from '../../shared/services/api.service';
import { Person } from '../../shared/models/models';

@Component({
  selector: 'app-gift-received-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule],
  template: `
    <h2 mat-dialog-title>Add Gift Received</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Person *</mat-label>
          <mat-select formControlName="personId">
            <mat-option *ngFor="let p of persons" [value]="p.id">{{ p.name }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Gift Type *</mat-label>
          <mat-select formControlName="giftType">
            <mat-option value="cash">💰 Cash</mat-option>
            <mat-option value="voucher">🎟 Voucher</mat-option>
            <mat-option value="item">🎁 Item</mat-option>
          </mat-select>
        </mat-form-field>
        @if (form.get('giftType')?.value === 'cash') {
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Amount (₹) *</mat-label>
            <input matInput type="number" formControlName="amount" />
          </mat-form-field>
        }
        @if (form.get('giftType')?.value === 'voucher') {
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Voucher Details *</mat-label>
            <input matInput formControlName="voucherDetails" placeholder="Brand, value, code..." />
          </mat-form-field>
        }
        @if (form.get('giftType')?.value === 'item') {
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Item Description *</mat-label>
            <input matInput formControlName="itemDescription" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Quantity</mat-label>
            <input matInput type="number" formControlName="quantity" />
          </mat-form-field>
        }
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Date</mat-label>
          <input matInput [matDatepicker]="dp" formControlName="receivedDate" />
          <mat-datepicker-toggle matSuffix [for]="dp" />
          <mat-datepicker #dp />
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Notes</mat-label>
          <textarea matInput formControlName="notes" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`.form { min-width: 420px; display: flex; flex-direction: column; gap: 4px; } .w-full { width: 100%; }`],
})
export class GiftReceivedFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private ref = inject(MatDialogRef<GiftReceivedFormDialogComponent>);
  public data = inject<{ functionId: number }>(MAT_DIALOG_DATA);

  persons: Person[] = [];

  form: FormGroup = this.fb.group({
    personId: [null, Validators.required],
    giftType: ['cash', Validators.required],
    amount: [null],
    voucherDetails: [''],
    itemDescription: [''],
    quantity: [1],
    receivedDate: [new Date()],
    notes: [''],
  });

  ngOnInit() { this.api.getPersons().subscribe((p) => (this.persons = p)); }

  save() {
    if (this.form.invalid) return;
    this.api.createGiftReceived({ ...this.form.value, functionId: this.data.functionId })
      .subscribe(() => this.ref.close(true));
  }
}
