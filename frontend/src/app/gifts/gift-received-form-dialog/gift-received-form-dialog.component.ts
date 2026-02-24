import {
  Component, OnInit,
  ChangeDetectionStrategy, ChangeDetectorRef, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder,
  FormGroup, Validators,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../shared/services/api.service';
import { GiftReceived, Person } from '../../shared/models/models';
import { toDateString } from '../../shared/utils/date.util';

// Dialog input data shape
interface DialogData {
  functionId: number;
  eventDate?: string;
  gift?: GiftReceived;         // present in edit mode, absent in add mode
}

@Component({
  selector: 'app-gift-received-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <!-- Title changes based on mode -->
    <h2 mat-dialog-title>
      {{ isEditMode ? 'Edit Gift Received' : 'Add Gift Received' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="giftForm" class="form">

        <!-- ── Person Selector (read-only in edit mode) ──────── -->
        <div class="person-row">
          <mat-form-field appearance="outline" class="person-field">
            <mat-label>Person *</mat-label>
            <mat-select formControlName="personId">
              <mat-option *ngFor="let p of persons" [value]="p.id">
                {{ p.name }}
                <span *ngIf="p.phone" class="muted"> — {{ p.phone }}</span>
              </mat-option>
              <mat-option *ngIf="!persons.length" disabled>
                No persons yet — add one below
              </mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Hide "New Person" button in edit mode -->
          <button *ngIf="!isEditMode"
            mat-stroked-button type="button"
            [color]="showNewPerson ? 'warn' : 'primary'"
            class="add-person-btn"
            (click)="toggleNewPerson()">
            <mat-icon>{{ showNewPerson ? 'close' : 'person_add' }}</mat-icon>
            {{ showNewPerson ? 'Cancel' : 'New Person' }}
          </button>
        </div>

        <!-- ── Inline New Person Panel ───────────────────────── -->
        <div *ngIf="showNewPerson && !isEditMode" class="new-person-panel">
          <mat-divider></mat-divider>
          <p class="panel-title">
            <mat-icon>person_add</mat-icon>
            Add New Person
          </p>
          <form [formGroup]="personForm" class="person-inner-form">

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Full Name *</mat-label>
              <input matInput formControlName="name"
                placeholder="e.g. Mohan Kumar" />
              <mat-error>Name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Address</mat-label>
              <textarea matInput formControlName="address"
                rows="2" placeholder="Street, City, PIN"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Phone</mat-label>
              <input matInput formControlName="phone"
                placeholder="9876543210" />
            </mat-form-field>

            <button mat-flat-button color="primary" type="button"
              class="w-full create-btn"
              [disabled]="personForm.invalid || creatingPerson"
              (click)="createPersonAndSelect()">
              <mat-spinner *ngIf="creatingPerson" diameter="20"></mat-spinner>
              <ng-container *ngIf="!creatingPerson">
                <mat-icon>check</mat-icon>
                Create &amp; Select Person
              </ng-container>
            </button>

            <p *ngIf="personCreated" class="success-msg">
              <mat-icon>check_circle</mat-icon>
              "{{ personCreated.name }}" created and selected!
            </p>

          </form>
          <mat-divider></mat-divider>
        </div>

        <!-- ── Gift Type ──────────────────────────────────────── -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Gift Type *</mat-label>
          <mat-select formControlName="giftType">
            <mat-option value="cash">💰 Cash</mat-option>
            <mat-option value="voucher">🎟 Voucher</mat-option>
            <mat-option value="item">🎁 Item</mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Cash -->
        <mat-form-field *ngIf="giftForm.get('giftType')?.value === 'cash'"
          appearance="outline" class="w-full">
          <mat-label>Amount (₹) *</mat-label>
          <input matInput type="number" formControlName="amount"
            placeholder="0.00" />
        </mat-form-field>

        <!-- Voucher -->
        <mat-form-field *ngIf="giftForm.get('giftType')?.value === 'voucher'"
          appearance="outline" class="w-full">
          <mat-label>Voucher Details *</mat-label>
          <input matInput formControlName="voucherDetails"
            placeholder="Brand, value, code..." />
        </mat-form-field>

        <!-- Item -->
        <ng-container *ngIf="giftForm.get('giftType')?.value === 'item'">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Item Description *</mat-label>
            <input matInput formControlName="itemDescription" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Quantity</mat-label>
            <input matInput type="number" formControlName="quantity" />
          </mat-form-field>
        </ng-container>

        <!-- ── Date ───────────────────────────────────────────── -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Date</mat-label>
          <input matInput [matDatepicker]="dp" formControlName="receivedDate" />
          <mat-datepicker-toggle matSuffix [for]="dp"></mat-datepicker-toggle>
          <mat-datepicker #dp></mat-datepicker>
        </mat-form-field>

        <!-- ── Notes ─────────────────────────────────────────── -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Notes</mat-label>
          <textarea matInput formControlName="notes" rows="2"></textarea>
        </mat-form-field>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary"
        [disabled]="giftForm.invalid || saving"
        (click)="save()">
        <mat-spinner *ngIf="saving" diameter="20"></mat-spinner>
        <span *ngIf="!saving">{{ isEditMode ? 'Update Gift' : 'Save Gift' }}</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form {
      min-width: 460px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .person-row {
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }
    .person-field { flex: 1; }
    .add-person-btn {
      margin-top: 4px;
      height: 56px;
      white-space: nowrap;
      min-width: 140px;
    }
    .new-person-panel {
      background: #f9f9ff;
      border: 1px solid #c5cae9;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 4px;
    }
    .panel-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      color: #3f51b5;
      margin: 8px 0;
    }
    .person-inner-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .create-btn {
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-bottom: 4px;
    }
    .success-msg {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #2e7d32;
      font-size: 13px;
      margin: 4px 0 0;
    }
    .success-msg mat-icon {
      font-size: 18px;
      height: 18px;
      width: 18px;
    }
    .w-full { width: 100%; }
    .muted { color: #999; font-size: 12px; }
  `],
})
export class GiftReceivedFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private ref = inject(MatDialogRef<GiftReceivedFormDialogComponent>);
  private cdr = inject(ChangeDetectorRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  // Derived flag — true when editing an existing gift
  get isEditMode(): boolean { return !!this.data?.gift; }

  // State
  persons: Person[] = [];
  showNewPerson = false;
  creatingPerson = false;
  saving = false;
  personCreated?: Person;

  // Resolve default date:
  // edit mode → gift's own receivedDate
  // add mode  → function's eventDate if available, else today
  private get defaultDate(): Date {
    if (this.data?.gift?.receivedDate) {
      return new Date(`${this.data.gift.receivedDate}T00:00:00`);
    }
    if (this.data?.eventDate) {
      return new Date(`${this.data.eventDate}T00:00:00`);
    }
    return new Date();
  }

  // Gift form — pre-populated in edit mode
  giftForm: FormGroup = this.fb.group({
    personId: [this.data?.gift?.person?.id ?? null, Validators.required],
    giftType: [this.data?.gift?.giftType ?? 'cash', Validators.required],
    amount: [this.data?.gift?.amount ?? null],
    voucherDetails: [this.data?.gift?.voucherDetails ?? ''],
    itemDescription: [this.data?.gift?.itemDescription ?? ''],
    quantity: [this.data?.gift?.quantity ?? 1],
    receivedDate: [this.defaultDate],
    notes: [this.data?.gift?.notes ?? ''],
  });

  // Inline new person form
  personForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    address: [''],
    phone: [''],
  });

  ngOnInit() {
    this.loadPersons();
  }

  loadPersons() {
    this.api.getPersons().subscribe((p) => {
      this.persons = p;
      this.cdr.markForCheck();
    });
  }

  toggleNewPerson() {
    this.showNewPerson = !this.showNewPerson;
    this.personCreated = undefined;
    if (!this.showNewPerson) this.personForm.reset();
    this.cdr.markForCheck();
  }

  createPersonAndSelect() {
    if (this.personForm.invalid) return;
    this.creatingPerson = true;
    this.cdr.markForCheck();

    this.api.createPerson(this.personForm.value).subscribe({
      next: (newPerson: Person) => {
        this.persons = [...this.persons, newPerson];
        this.personCreated = newPerson;
        this.creatingPerson = false;
        this.giftForm.patchValue({ personId: newPerson.id });

        setTimeout(() => {
          this.showNewPerson = false;
          this.personForm.reset();
          this.cdr.markForCheck();
        }, 1200);

        this.cdr.markForCheck();
      },
      error: () => {
        this.creatingPerson = false;
        this.cdr.markForCheck();
      },
    });
  }

  save() {
    if (this.giftForm.invalid) return;
    this.saving = true;
    this.cdr.markForCheck();

    const raw = this.giftForm.value;
    const payload = {
      ...raw,
      functionId: this.data.functionId,
      receivedDate: toDateString(raw.receivedDate),
    };

    // Choose create or update based on mode
    const request$ = this.isEditMode
      ? this.api.updateGiftReceived(this.data.gift!.id, payload)
      : this.api.createGiftReceived(payload);

    request$.subscribe({
      next: () => this.ref.close(true),
      error: () => {
        this.saving = false;
        this.cdr.markForCheck();
      },
    });
  }
}
