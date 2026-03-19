import { Injectable, inject, signal } from '@angular/core';
import {
    Auth,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    user,
} from '@angular/fire/auth';
import {
    Firestore,
    doc,
    getDoc,
    setDoc,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserProfile } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private auth = inject(Auth);
    private firestore = inject(Firestore);
    private router = inject(Router);

    readonly currentUser$ = user(this.auth);
    readonly loading = signal(false);

    register(name: string, email: string, password: string): Observable<void> {
        this.loading.set(true);
        return from(
            createUserWithEmailAndPassword(this.auth, email, password).then(async (cred) => {
                await updateProfile(cred.user, { displayName: name });
                const userRef = doc(this.firestore, `users/${cred.user.uid}`);
                const profile: UserProfile = {
                    uid: cred.user.uid,
                    displayName: name,
                    email: email,
                    createdAt: new Date(),
                    goals: {
                        calories: 2000,
                        protein: 150,
                        carbs: 250,
                        fat: 65,
                        water: 2500,
                    },
                };
                await setDoc(userRef, profile);
                this.loading.set(false);
                void this.router.navigate(['/dashboard']);
            }),
        );
    }

    login(email: string, password: string): Observable<void> {
        this.loading.set(true);
        return from(
            signInWithEmailAndPassword(this.auth, email, password).then(() => {
                this.loading.set(false);
                void this.router.navigate(['/dashboard']);
            }),
        );
    }

    loginWithGoogle(): Observable<void> {
        this.loading.set(true);
        const provider = new GoogleAuthProvider();
        return from(
            signInWithPopup(this.auth, provider).then(async (cred) => {
                const userRef = doc(this.firestore, `users/${cred.user.uid}`);
                const snap = await getDoc(userRef);
                if (!snap.exists()) {
                    const profile: UserProfile = {
                        uid: cred.user.uid,
                        displayName: cred.user.displayName || 'Usuário',
                        email: cred.user.email || '',
                        photoURL: cred.user.photoURL || undefined,
                        createdAt: new Date(),
                        goals: {
                            calories: 2000,
                            protein: 150,
                            carbs: 250,
                            fat: 65,
                            water: 2500,
                        },
                    };
                    await setDoc(userRef, profile);
                }
                this.loading.set(false);
                void this.router.navigate(['/dashboard']);
            }),
        );
    }

    logout(): Observable<void> {
        return from(signOut(this.auth).then(() => { void this.router.navigate(['/']); }));
    }

    getUserProfile(uid: string): Observable<UserProfile | null> {
        const userRef = doc(this.firestore, `users/${uid}`);
        return from(getDoc(userRef)).pipe(
            map((snap) => {
                if (!snap.exists()) return null;
                const data = snap.data() as UserProfile;
                return { ...data, uid: data.uid || snap.id };
            }),
        );
    }
}
