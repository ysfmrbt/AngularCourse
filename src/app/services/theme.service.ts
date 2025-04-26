import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme-preference';
  private _currentTheme = signal<ThemeMode>('dark');

  public currentTheme$ = this._currentTheme.asReadonly();

  constructor() {
    this.loadSavedTheme();
  }

  private loadSavedTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as ThemeMode | null;
    if (savedTheme) {
      this._currentTheme.set(savedTheme);
    } else {
      // Default to system preference if available, otherwise use dark
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      this._currentTheme.set(prefersDark ? 'dark' : 'light');
    }
    this.applyTheme(this._currentTheme());
  }

  toggleTheme(): void {
    console.log('Toggle theme called');
    const newTheme: ThemeMode =
      this._currentTheme() === 'dark' ? 'light' : 'dark';
    console.log('New theme:', newTheme);
    this._currentTheme.set(newTheme);
    localStorage.setItem(this.THEME_KEY, newTheme);
    this.applyTheme(newTheme);
  }

  setTheme(theme: ThemeMode): void {
    this._currentTheme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: ThemeMode): void {
    console.log('Applying theme:', theme);
    // Set the class on the HTML element as recommended by PrimeNG
    const htmlElement = document.querySelector('html');

    if (theme === 'dark') {
      htmlElement?.classList.add('dark-theme');
      htmlElement?.classList.remove('light-theme');
      document.body.className = 'dark-theme';

      // Switch to dark theme CSS
      const themeLink = document.getElementById('theme-css') as HTMLLinkElement;
      if (themeLink) {
        themeLink.href =
          'https://cdn.jsdelivr.net/npm/@primeng/themes@19.0.10/aura/theme.css';
      }
    } else {
      htmlElement?.classList.add('light-theme');
      htmlElement?.classList.remove('dark-theme');
      document.body.className = 'light-theme';

      // Switch to light theme CSS
      const themeLink = document.getElementById('theme-css') as HTMLLinkElement;
      if (themeLink) {
        themeLink.href =
          'https://cdn.jsdelivr.net/npm/@primeng/themes@19.0.10/lara/theme.css';
      }
    }

    // Store the theme preference in localStorage
    localStorage.setItem(this.THEME_KEY, theme);
  }
}
