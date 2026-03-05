import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, shareReplay } from 'rxjs';
import { TdbDatabase, TdbRequest, Category, Usage } from '../models/tdb-request.model';

export interface ScriptInfo {
  programName: string;
  repository: string;
  requestCount: number;
  reqids: number[];
  files: string[];
}

@Injectable({ providedIn: 'root' })
export class TdbDataService {
  private data$: Observable<TdbDatabase>;
  private searchTerm$ = new BehaviorSubject<string>('');

  constructor(private http: HttpClient) {
    this.data$ = this.http
      .get<TdbDatabase>('data/tdb-requests.json')
      .pipe(shareReplay(1));
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
        const scriptMap = new Map<string, ScriptInfo>();
        for (const req of db.requests) {
          for (const usage of req.usages) {
            const key = usage.program_name;
            if (!scriptMap.has(key)) {
              scriptMap.set(key, {
                programName: usage.program_name,
                repository: usage.repository,
                requestCount: 0,
                reqids: [],
                files: [],
              });
            }
            const info = scriptMap.get(key)!;
            if (!info.reqids.includes(req.reqid)) {
              info.reqids.push(req.reqid);
              info.requestCount++;
            }
            if (!info.files.includes(usage.file)) {
              info.files.push(usage.file);
            }
          }
        }
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

        const scriptMap = new Map<string, ScriptInfo>();
        for (const req of db.requests) {
          for (const usage of req.usages) {
            if (usage.program_name.toLowerCase().includes(lower)) {
              const key = usage.program_name;
              if (!scriptMap.has(key)) {
                scriptMap.set(key, {
                  programName: usage.program_name,
                  repository: usage.repository,
                  requestCount: 0,
                  reqids: [],
                  files: [],
                });
              }
              const info = scriptMap.get(key)!;
              if (!info.reqids.includes(req.reqid)) {
                info.reqids.push(req.reqid);
                info.requestCount++;
              }
            }
          }
        }

        return { requests, scripts: [...scriptMap.values()] };
      })
    );
  }
}
