import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, shareReplay } from 'rxjs';
import { TdbDatabase, TdbRequest, Category, Usage } from '../models/tdb-request.model';

export interface ScriptInfo {
  programName: string;
  repository: string;
  reqids: number[];
  files: string[];
}

@Injectable({ providedIn: 'root' })
export class TdbDataService {
  private data$: Observable<TdbDatabase>;
  private searchTerm$ = new BehaviorSubject<string>('');
  private categoryNameMap = new Map<string, string>();

  constructor(private http: HttpClient) {
    this.data$ = this.http
      .get<TdbDatabase>('data/tdb-requests.json')
      .pipe(
        map(db => {
          for (const cat of db.categories) {
            this.categoryNameMap.set(cat.id, cat.name);
          }
          return db;
        }),
        shareReplay(1),
      );
  }

  getDatabase(): Observable<TdbDatabase> {
    return this.data$;
  }

  getRequests(): Observable<TdbRequest[]> {
    return this.data$.pipe(map(db => db.requests));
  }

  getCategories(): Observable<Category[]> {
    return this.data$.pipe(map(db => db.categories));
  }

  getCategoryName(id: string): string {
    return this.categoryNameMap.get(id) ?? id;
  }

  getRequestById(reqid: number): Observable<TdbRequest | undefined> {
    return this.data$.pipe(
      map(db => db.requests.find(r => r.reqid === reqid))
    );
  }

  getRequestsByCategory(categoryId: string): Observable<TdbRequest[]> {
    return this.data$.pipe(
      map(db => db.requests.filter(r => r.category_id === categoryId))
    );
  }

  getScripts(): Observable<ScriptInfo[]> {
    return this.data$.pipe(
      map(db => {
        const scriptMap = this.buildScriptMap(db.requests);
        return [...scriptMap.values()].sort((a, b) =>
          a.programName.localeCompare(b.programName)
        );
      })
    );
  }

  setSearchTerm(term: string): void {
    this.searchTerm$.next(term);
  }

  getSearchTerm(): Observable<string> {
    return this.searchTerm$.asObservable();
  }

  search(term: string): Observable<{ requests: TdbRequest[]; scripts: ScriptInfo[] }> {
    const lower = term.toLowerCase();
    return this.data$.pipe(
      map(db => {
        const requests = db.requests.filter(r =>
          String(r.reqid).includes(lower) ||
          r.name.toLowerCase().includes(lower) ||
          r.description.toLowerCase().includes(lower) ||
          r.tags.some(t => t.toLowerCase().includes(lower)) ||
          r.usages.some(u => u.program_name.toLowerCase().includes(lower))
        );

        const filtered = db.requests.filter(r =>
          r.usages.some(u => u.program_name.toLowerCase().includes(lower))
        );
        const scriptMap = this.buildScriptMap(filtered, u =>
          u.program_name.toLowerCase().includes(lower)
        );

        return { requests, scripts: [...scriptMap.values()] };
      })
    );
  }

  private buildScriptMap(
    requests: TdbRequest[],
    usageFilter?: (u: Usage) => boolean,
  ): Map<string, ScriptInfo> {
    const scriptMap = new Map<string, ScriptInfo>();
    const reqidSets = new Map<string, Set<number>>();
    const fileSets = new Map<string, Set<string>>();

    for (const req of requests) {
      for (const usage of req.usages) {
        if (usageFilter && !usageFilter(usage)) continue;
        const key = usage.program_name;
        if (!scriptMap.has(key)) {
          scriptMap.set(key, {
            programName: usage.program_name,
            repository: usage.repository,
            reqids: [],
            files: [],
          });
          reqidSets.set(key, new Set());
          fileSets.set(key, new Set());
        }
        const rSet = reqidSets.get(key)!;
        if (!rSet.has(req.reqid)) {
          rSet.add(req.reqid);
          scriptMap.get(key)!.reqids.push(req.reqid);
        }
        const fSet = fileSets.get(key)!;
        if (!fSet.has(usage.file)) {
          fSet.add(usage.file);
          scriptMap.get(key)!.files.push(usage.file);
        }
      }
    }
    return scriptMap;
  }
}
