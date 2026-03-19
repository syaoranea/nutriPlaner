import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DateService {
    /**
     * Returns the current date in 'YYYY-MM-DD' format using 'America/Sao_Paulo' timezone.
     */
    getTodayString(): string {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Sao_Paulo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        return formatter.format(now);
    }

    /**
     * Returns the current time in 'HH:mm' format using 'America/Sao_Paulo' timezone.
     */
    getTimeString(): string {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        return formatter.format(now);
    }

    /**
     * Converts a standard Date object to the local date string in Brazil.
     */
    toLocaleDateString(date: Date): string {
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Sao_Paulo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        return formatter.format(date);
    }
}
