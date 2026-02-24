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
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ApiService } from '../../shared/services/api.service';
import { FunctionEvent } from '../../shared/models/models';
import { FunctionFormDialogComponent } from '../function-form-dialog/function-form-dialog.component';
import { LocalDatePipe } from '../../shared/pipes/local-date.pipe';

@Component({
  selector: 'app-function-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterModule, MatTableModule, MatButtonModule,
    MatIconModule, MatCardModule, MatChipsModule, MatDialogModule, LocalDatePipe
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Functions</h2>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon> New Function
        </button>
      </div>
      <mat-card>
        <table mat-table [dataSource]="functions" class="full-w">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Function Name</th>
            <td mat-cell *matCellDef="let f"><strong>{{ f.name }}</strong></td>
          </ng-container>
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Event Date</th>
            <td mat-cell *matCellDef="let f">{{ f.eventDate | localDate }}</td>
          </ng-container>
          <ng-container matColumnDef="gifts">
            <th mat-header-cell *matHeaderCellDef>Gifts Received</th>
            <td mat-cell *matCellDef="let f">
              <mat-chip>{{ f.giftsReceived?.length || 0 }}</mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let f">
              <button mat-icon-button color="primary"
                [routerLink]="['/functions', f.id]" title="View">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button color="accent"
                (click)="openDialog(f)" title="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn"
                (click)="delete(f)" title="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;" class="hover-row"></tr>
        </table>
        @if (!functions.length) {
          <div class="empty">No functions yet. Add one to get started!</div>
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
export class FunctionListComponent implements OnInit {
  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  functions: FunctionEvent[] = [];
  cols = ['name', 'date', 'gifts', 'actions'];

  ngOnInit() { this.load(); }

  load() {
    this.api.getFunctions().subscribe((data) => {
      this.functions = data;
      this.cdr.markForCheck();
    });
  }

  openDialog(fn?: FunctionEvent) {
    const ref = this.dialog.open(FunctionFormDialogComponent, {
      width: '480px', data: fn ?? null,
    });
    ref.afterClosed().subscribe((r) => { if (r) this.load(); });
  }

  delete(fn: FunctionEvent) {
    if (confirm(`Delete function "${fn.name}"?`)) {
      this.api.deleteFunction(fn.id).subscribe(() => this.load());
    }
  }
}
