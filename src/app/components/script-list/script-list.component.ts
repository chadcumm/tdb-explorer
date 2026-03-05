import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TdbDataService, ScriptInfo } from '../../services/tdb-data.service';

@Component({
  selector: 'app-script-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <div class="page-title">
          <h1>Scripts</h1>
          <span class="count">{{ filteredScripts.length | number }}</span>
        </div>
      </div>

      <div class="toolbar">
        <div class="filter-wrapper">
          <svg class="filter-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          <input
            type="text"
            class="filter-input"
            placeholder="Filter by program name or repository..."
            [(ngModel)]="filterText"
            (ngModelChange)="applyFilter()"
          />
        </div>
      </div>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th (click)="sort('programName')" class="sortable">
                Program Name <span class="sort-indicator" [textContent]="getSortIcon('programName')"></span>
              </th>
              <th (click)="sort('repository')" class="sortable">
                Repository <span class="sort-indicator" [textContent]="getSortIcon('repository')"></span>
              </th>
              <th (click)="sort('requestCount')" class="sortable col-num">
                Requests <span class="sort-indicator" [textContent]="getSortIcon('requestCount')"></span>
              </th>
              <th>Request IDs</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let script of filteredScripts">
              <td class="mono cell-program">{{ script.programName }}</td>
              <td class="cell-repo">{{ script.repository }}</td>
              <td class="mono col-num">{{ script.requestCount }}</td>
              <td class="cell-reqids">
                <a *ngFor="let rid of script.reqids.slice(0, 10)" [routerLink]="['/request', rid]" class="reqid-link">{{ rid }}</a>
                <span *ngIf="script.reqids.length > 10" class="overflow-count">+{{ script.reqids.length - 10 }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="filteredScripts.length === 0" class="empty-state">No scripts match your filter.</div>
    </div>
  `,
  styles: [`
    .container { padding: var(--sp-6); }

    .page-header { margin-bottom: var(--sp-5); }
    .page-title { display: flex; align-items: baseline; gap: var(--sp-3); }
    .page-title h1 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--ink-primary);
      letter-spacing: -0.01em;
    }
    .count {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--ink-tertiary);
    }

    .toolbar { margin-bottom: var(--sp-5); }
    .filter-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      max-width: 380px;
    }
    .filter-icon {
      position: absolute;
      left: var(--sp-3);
      color: var(--ink-muted);
      pointer-events: none;
    }
    .filter-input {
      width: 100%;
      padding: var(--sp-2) var(--sp-3) var(--sp-2) var(--sp-8);
      background: var(--control-bg);
      border: 1px solid var(--control-border);
      border-radius: var(--radius-md);
      color: var(--ink-primary);
      font-family: var(--font-body);
      font-size: 0.8125rem;
      outline: none;
      transition: border-color 0.12s, box-shadow 0.12s;
    }
    .filter-input:focus {
      border-color: var(--border-focus);
      box-shadow: 0 0 0 2px var(--control-focus-ring);
    }
    .filter-input::placeholder { color: var(--ink-muted); }

    /* ── Table ── */
    .table-wrapper { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      text-align: left;
      padding: var(--sp-2) var(--sp-3);
      border-bottom: 1px solid var(--border-emphasis);
      color: var(--ink-tertiary);
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      white-space: nowrap;
    }
    .sortable { cursor: pointer; user-select: none; }
    .sortable:hover { color: var(--accent); }
    .sort-indicator {
      font-size: 0.5625rem;
      margin-left: var(--sp-1);
      color: var(--accent);
    }
    .data-table td {
      padding: var(--sp-2) var(--sp-3);
      border-bottom: 1px solid var(--border-soft);
      color: var(--ink-secondary);
      font-size: 0.8125rem;
    }
    .mono { font-family: var(--font-mono); font-size: 0.75rem; }
    .cell-program { color: var(--ink-primary); }
    .cell-repo { color: var(--ink-tertiary); font-size: 0.75rem; }
    .col-num { width: 80px; text-align: right; }

    .cell-reqids { display: flex; flex-wrap: wrap; gap: var(--sp-1); }
    .reqid-link {
      display: inline-block;
      padding: 0 var(--sp-2);
      background: var(--surface-1);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-sm);
      color: var(--accent);
      text-decoration: none;
      font-family: var(--font-mono);
      font-size: 0.6875rem;
      transition: all 0.12s;
    }
    .reqid-link:hover {
      background: var(--accent-subtle);
      border-color: var(--accent-dim);
    }
    .overflow-count {
      font-family: var(--font-mono);
      font-size: 0.625rem;
      color: var(--ink-muted);
      padding: 0 var(--sp-1);
    }

    .empty-state {
      text-align: center;
      padding: var(--sp-12);
      color: var(--ink-muted);
      font-size: 0.8125rem;
    }
  `]
})
export class ScriptListComponent implements OnInit {
  allScripts: ScriptInfo[] = [];
  filteredScripts: ScriptInfo[] = [];
  filterText = '';
  sortField = 'programName';
  sortDir: 'asc' | 'desc' = 'asc';

  constructor(private dataService: TdbDataService) {}

  ngOnInit(): void {
    this.dataService.getScripts().subscribe(scripts => {
      this.allScripts = scripts;
      this.filteredScripts = scripts;
    });
  }

  applyFilter(): void {
    const lower = this.filterText.toLowerCase();
    let filtered = this.allScripts.filter(s =>
      s.programName.includes(lower) || s.repository.includes(lower)
    );
    this.sortScripts(filtered);
  }

  sort(field: string): void {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }
    this.sortScripts(this.filteredScripts);
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return '';
    return this.sortDir === 'asc' ? '\u25B2' : '\u25BC';
  }

  private sortScripts(scripts: ScriptInfo[]): void {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    this.filteredScripts = [...scripts].sort((a, b) => {
      const aVal = (a as any)[this.sortField];
      const bVal = (b as any)[this.sortField];
      if (aVal < bVal) return -1 * dir;
      if (aVal > bVal) return 1 * dir;
      return 0;
    });
  }
}
