import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TdbDataService } from '../../services/tdb-data.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <header class="header">
      <div class="header-left">
        <a routerLink="/" class="logo">
          <span class="logo-mark">TDB</span>
          <span class="logo-word">Explorer</span>
        </a>
        <nav class="nav">
          <a routerLink="/"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: true }"
             class="nav-link">Requests</a>
          <a routerLink="/scripts"
             routerLinkActive="active"
             class="nav-link">Scripts</a>
          <a routerLink="/categories"
             routerLinkActive="active"
             class="nav-link">Categories</a>
        </nav>
      </div>
      <div class="header-right">
        <div class="search-wrapper">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            class="search-input"
            placeholder="Search requests, scripts, tags..."
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearch($event)"
            (keydown.enter)="goToSearch()"
          />
          <kbd class="search-hint" *ngIf="!searchTerm">Enter</kbd>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--sp-6);
      height: 48px;
      background: var(--canvas);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: var(--sp-8);
    }
    .logo {
      display: flex;
      align-items: baseline;
      gap: var(--sp-2);
      text-decoration: none;
    }
    .logo-mark {
      font-family: var(--font-mono);
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--accent);
      letter-spacing: 0.05em;
    }
    .logo-word {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--ink-tertiary);
    }
    .nav {
      display: flex;
      gap: var(--sp-1);
    }
    .nav-link {
      color: var(--ink-tertiary);
      text-decoration: none;
      padding: var(--sp-1) var(--sp-3);
      border-radius: var(--radius-md);
      font-size: 0.8125rem;
      font-weight: 500;
      transition: color 0.12s, background 0.12s;
    }
    .nav-link:hover {
      color: var(--ink-secondary);
      background: var(--surface-1);
    }
    .nav-link.active {
      color: var(--ink-primary);
      background: var(--surface-2);
    }
    .header-right {
      flex: 0 1 360px;
    }
    .search-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: var(--sp-3);
      color: var(--ink-muted);
      pointer-events: none;
    }
    .search-input {
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
    .search-input:focus {
      border-color: var(--border-focus);
      box-shadow: 0 0 0 2px var(--control-focus-ring);
    }
    .search-input::placeholder {
      color: var(--ink-muted);
    }
    .search-hint {
      position: absolute;
      right: var(--sp-3);
      padding: 1px 5px;
      background: var(--surface-1);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      font-size: 0.625rem;
      color: var(--ink-muted);
      pointer-events: none;
    }
  `]
})
export class HeaderComponent {
  searchTerm = '';

  constructor(private dataService: TdbDataService, private router: Router) {}

  onSearch(term: string): void {
    this.dataService.setSearchTerm(term);
  }

  goToSearch(): void {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/'], { queryParams: { q: this.searchTerm.trim() } });
    }
  }
}
