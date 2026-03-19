import { Component, Input, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  // Recebe o ID do Shell App via Input dinâmico
  @Input() set idUsuario(val: string) {
    this._idUsuario.set(val);
    this.carregarContextoUsuario(val);
  }
  
  private _idUsuario = signal<string | null>(null);
  public idUsuarioContext = this._idUsuario.asReadonly();

  protected readonly title = signal('nutriplanner');

  ngOnInit() {
    if (!this._idUsuario()) {
      console.warn('[MFE]: Inicializado sem contexto de usuário!');
    }
  }

  private carregarContextoUsuario(id: string) {
    console.log(`[MFE]: Carregando microfrontend para usuário ID: ${id}`);
    // Adicionar lógica de carregamento de dados aqui no futuro
  }
}
