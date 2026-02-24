import {
  Component, OnInit,
  ChangeDetectionStrategy, ChangeDetectorRef, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ApiService } from '../../shared/services/api.service';
import { Person } from '../../shared/models/models';
import { PersonFormDialogComponent } from '../person-form-dialog/person-form-dialog.component';

@Component({
  selector: 'app-person-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterModule, MatTableModule, MatButtonModule,
    MatIconModule, MatCardModule, MatDialogModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Persons</h2>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>person_add</mat-icon> New Person
        </button>
      </div>
      <mat-card>
        <table mat-table [dataSource]="persons" class="full-w">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let p"><strong>{{ p.name }}</strong></td>
          </ng-container>
          <ng-container matColumnDef="address">
            <th mat-header-cell *matHeaderCellDef>Address</th>
            <td mat-cell *matCellDef="let p">{{ p.address }}</td>
          </ng-container>
          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef>Phone</th>
            <td mat-cell *matCellDef="let p">{{ p.phone }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let p">
              <button mat-icon-button color="primary"
                [routerLink]="['/persons', p.id]" title="View Gifts">
                <mat-icon>card_giftcard</mat-icon>
              </button>
              <button mat-icon-button color="accent"
                (click)="openDialog(p)" title="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn"
                (click)="delete(p)" title="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;" class="hover-row"></tr>
        </table>
        @if (!persons.length) {
          <div class="empty">No persons yet. Add one!</div>
        }
      </mat-card>
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 20px;
    }
    .full-w { width: 100%; }
    .empty { padding: 32px; text-align: center; color: #999; }
    .hover-row:hover { background: #f5f5f5; cursor: pointer; }
  `],
})
export class PersonListComponent implements OnInit {
  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  persons: Person[] = [];
  cols = ['name', 'address', 'phone', 'actions'];

  ngOnInit() { this.load(); }

  load() {
    this.api.getPersons().subscribe((data) => {
      this.persons = data;
      this.cdr.markForCheck();
    });
  }

  openDialog(p?: Person) {
    const ref = this.dialog.open(PersonFormDialogComponent, {
      width: '480px', data: p ?? null,
    });
    ref.afterClosed().subscribe((r) => { if (r) this.load(); });
  }

  delete(p: Person) {
    if (confirm(`Delete "${p.name}"?`)) {
      this.api.deletePerson(p.id).subscribe(() => this.load());
    }
  }
}
