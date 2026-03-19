import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface NutritionalData {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

@Injectable({ providedIn: 'root' })
export class NutritionService {
    private http = inject(HttpClient);
    private apiUrl = 'https://api.perplexity.ai/chat/completions';

    async calculateMacros(foodName: string, quantity: number, unit: string): Promise<NutritionalData> {
        const apiKey = environment.firebase.perplexityKey;
        if (!apiKey || apiKey === 'YOUR_PERPLEXITY_API_KEY_HERE') {
            throw new Error('API Key da Perplexity não configurada.');
        }

        const prompt = `Forneça as informações nutricionais para "${quantity}${unit} de ${foodName}". 
    Responda EXCLUSIVAMENTE em formato JSON puro, sem markdown, sem explicações, seguindo este esquema: 
    { "calories": number, "protein": number, "carbs": number, "fat": number }. 
    Use valores numéricos aproximados baseados em tabelas nutricionais padrão (como TACO).`;

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        });

        const body = {
            model: 'sonar',
            messages: [
                { role: 'system', content: 'Você é um assistente nutricional preciso que retorna apenas dados em JSON.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.2
        };

        try {
            const response: any = await firstValueFrom(this.http.post(this.apiUrl, body, { headers }));
            const content = response.choices[0].message.content;

            // Limpar possível markdown do conteúdo se a IA falhar em mandar JSON puro
            const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr) as NutritionalData;
        } catch (error) {
            console.error('Erro na API Perplexity:', error);
            throw new Error('Falha ao obter dados nutricionais da IA.');
        }
    }
}
