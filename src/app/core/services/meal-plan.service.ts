import { Injectable, inject } from '@angular/core';
import {
    Firestore,
    collection,
    collectionData,
    doc,
    docData,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MealPlan } from '../models/models';

@Injectable({ providedIn: 'root' })
export class MealPlanService {
    private firestore = inject(Firestore);

    getMealPlans(uid: string): Observable<MealPlan[]> {
        console.log('MealPlanService: getMealPlans for', uid);
        if (!this.firestore) {
            console.error('MealPlanService: Firestore instance is missing!');
            return new Observable(obs => obs.error('Firestore not initialized'));
        }
        const col = collection(this.firestore, 'mealPlans');
        // Removido orderBy do query para evitar necessidade de índice composto no Firestore
        const q = query(col, where('uid', '==', uid));
        return (collectionData(q, { idField: 'id' }) as Observable<MealPlan[]>).pipe(
            map(plans => [...plans].sort((a, b) => {
                const getTime = (val: any) => {
                    if (!val) return 0;
                    if (val.toMillis) return val.toMillis();
                    if (val.seconds) return val.seconds * 1000;
                    if (val instanceof Date) return val.getTime();
                    return new Date(val).getTime() || 0;
                };
                return getTime(b.createdAt) - getTime(a.createdAt);
            }))
        );
    }

    getMealPlan(id: string): Observable<MealPlan | undefined> {
        const ref = doc(this.firestore, `mealPlans/${id}`);
        return docData(ref, { idField: 'id' }) as Observable<MealPlan | undefined>;
    }

    async createMealPlan(plan: Omit<MealPlan, 'id'>): Promise<string> {
        const col = collection(this.firestore, 'mealPlans');
        const docRef = await addDoc(col, { ...plan, createdAt: serverTimestamp() });
        return docRef.id;
    }

    async updateMealPlan(id: string, plan: Partial<MealPlan>): Promise<void> {
        const ref = doc(this.firestore, `mealPlans/${id}`);
        await updateDoc(ref, plan as any);
    }

    async deleteMealPlan(id: string): Promise<void> {
        const ref = doc(this.firestore, `mealPlans/${id}`);
        await deleteDoc(ref);
    }
}
