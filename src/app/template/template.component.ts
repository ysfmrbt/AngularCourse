import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

// PrimeNG Modules
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

// Services
import { AuthService } from 'src/services/auth.service';
import { Subscription } from 'rxjs';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-template',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    SidebarModule,
    ButtonModule,
    ToolbarModule,
    MenuModule,
    RippleModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
  ],
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css'],
})
export class TemplateComponent implements OnInit, OnDestroy {
  sidebarVisible: boolean = false;
  userMenuItems: MenuItem[] = [];
  loggedInUser: string | null = null;
  showUsername: boolean = true; // Basic flag for responsiveness demo
  private userSubscription: Subscription | null = null;

  // Inject theme service
  private themeService = inject(ThemeService);
  // Expose the theme to the template
  currentTheme = this.themeService.currentTheme$;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.loggedInUser$.subscribe((user) => {
      this.loggedInUser = user;
      this.updateUserMenu();
    });
    // Simple responsiveness check (could use BreakpointObserver for better handling)
    this.checkWindowSize();
    window.onresize = () => this.checkWindowSize();
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  toggleTheme(): void {
    console.log('Template: toggle theme called');
    this.themeService.toggleTheme();
  }

  checkWindowSize() {
    this.showUsername = window.innerWidth > 600;
  }

  updateUserMenu(): void {
    if (this.loggedInUser) {
      this.userMenuItems = [
        {
          label: `Signed in as ${this.loggedInUser}`,
          disabled: true,
          styleClass: 'font-semibold',
        },
        { separator: true },
        {
          label: 'Logout',
          icon: 'pi pi-sign-out',
          command: () => this.logout(),
        },
      ];
    } else {
      this.userMenuItems = [];
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      // Optional: Add completion logic here if needed after navigation
      // next: () => console.log('Logout observable completed'),
      error: (err) => console.error('Logout subscription error:', err),
    });
  }

  // Method previously used by mat-sidenav toggle
  // drawer.toggle() is now replaced by sidebarVisible = !sidebarVisible in the template
}
