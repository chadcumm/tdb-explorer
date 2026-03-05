import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TdbDataService, ScriptInfo } from '../../services/tdb-data.service';

@Component({
  selector: 'app-script-list',
  standalone: true,
  imports: [DecimalPipe, RouterLink, FormsModule],
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
              <th (click)="sort('reqids')" class="sortable col-num">
                Requests <span class="sort-indicator" [textContent]="getSortIcon('reqids')"></span>
              </th>
              <th>Request IDs</th>
            </tr>
          </thead>
          <tbody>
            @for (script of filteredScripts; track script.programName) {
              <tr>
                <td class="mono cell-program">{{ script.programName }}</td>
                <td class="cell-repo">{{ script.repository }}</td>
                <td class="mono col-num">{{ script.reqids.length }}</td>
                <td class="cell-reqids">
                  @for (rid of script.reqids.slice(0, 10); track rid) {
                    <a [routerLink]="['/request', rid]" class="reqid-link">{{ rid }}</a>
                  }
                  @if (script.reqids.length > 10) {
                    <span class="overflow-count">+{{ script.reqids.length - 10 }}</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (filteredScripts.length === 0) {
        <div class="empty-state">No scripts match your filter.</div>
      }
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
      s.programName.toLowerCase().includes(lower) || s.repository.toLowerCase().includes(lower)
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
      let aVal: any, bVal: any;
      if (this.sortField === 'reqids') {
        aVal = a.reqids.length;
        bVal = b.reqids.length;
      } else {
        aVal = (a as any)[this.sortField];
        bVal = (b as any)[this.sortField];
      }
      if (aVal < bVal) return -1 * dir;
      if (aVal > bVal) return 1 * dir;
      return 0;
    });
  }
}
