import { Injectable, inject } from '@angular/core';
import {
    Firestore,
    collection,
    collectionData,
    doc,
    docData,
    setDoc,
    query,
    where,
    orderBy,
    limit,
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { DailyLog } from '../models/models';

@Injectable({ providedIn: 'root' })
export class DailyIntakeService {
    private firestore = inject(Firestore);

    getDailyLog(uid: string, date: string): Observable<DailyLog | null> {
        const col = collection(this.firestore, 'dailyLogs');
        const q = query(
            col,
            where('uid', '==', uid),
            where('date', '==', date),
            limit(1)
        );
        return collectionData(q, { idField: 'id' }).pipe(
            map(logs => logs.length > 0 ? (logs[0] as DailyLog) : null)
        );
    }

    getAllLogs(uid: string): Observable<DailyLog[]> {
        const col = collection(this.firestore, 'dailyLogs');
        const q = query(col, where('uid', '==', uid), orderBy('date', 'desc'));
        return collectionData(q, { idField: 'id' }) as Observable<DailyLog[]>;
    }

    async saveDailyLog(log: DailyLog): Promise<void> {
        const docId = log.id || `${log.uid}_${log.date}`;
        const docRef = doc(this.firestore, 'dailyLogs', docId);
        return setDoc(docRef, { ...log, id: docId }, { merge: true });
    }
}
