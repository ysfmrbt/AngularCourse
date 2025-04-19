import { Component, OnInit, OnDestroy } from '@angular/core';
// Removed CommonModule and Router imports as they are likely handled by AppModule if component is not standalone
// import { CommonModule } from '@angular/common'; 
// import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SidebarModule, Sidebar } from 'primeng/sidebar';
import { ButtonModule, Button } from 'primeng/button';
import { ToolbarModule, Toolbar } from 'primeng/toolbar';
import { MenuModule, Menu } from 'primeng/menu';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast'; // For link ripple effect
import { AuthService } from 'src/services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-template', // Kept as false based on v19 migration
    standalone: true,
    // imports: [ // Only needed if component becomes standalone
    //   CommonModule,
    //   RouterOutlet,
    //   RouterLink,
    //   RouterLinkActive,
    //   SidebarModule,
    //   ButtonModule,
    //   ToolbarModule,
    //   MenuModule,
    //   RippleModule
    // ],
    templateUrl: './template.component.html',
    styleUrls: ['./template.component.css'],
    imports: [
        Sidebar,
        PrimeTemplate,
        RouterLink,
        RouterLinkActive,
        Toolbar,
        Button,
        NgClass,
        NgIf,
        Menu,
        RouterOutlet,
        ConfirmDialog,
        Toast,
    ],
})
export class TemplateComponent implements OnInit, OnDestroy {
  sidebarVisible: boolean = false;
  userMenuItems: MenuItem[] = [];
  loggedInUser: string | null = null;
  showUsername: boolean = true; // Basic flag for responsiveness demo
  private userSubscription: Subscription | null = null;

  constructor(
    public authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.loggedInUser$.subscribe(user => {
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

  checkWindowSize() {
    this.showUsername = window.innerWidth > 600;
  }

  updateUserMenu(): void {
    if (this.loggedInUser) {
        this.userMenuItems = [
            {
                label: `Signed in as ${this.loggedInUser}`,
                disabled: true,
                styleClass: 'font-semibold'
            },
            { separator: true },
            { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.logout() }
        ];
    } else {
         this.userMenuItems = [];
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      // Optional: Add completion logic here if needed after navigation
      // next: () => console.log('Logout observable completed'),
      error: (err) => console.error('Logout subscription error (though navigation likely happened):', err)
    });
  }

   // Method previously used by mat-sidenav toggle
   // drawer.toggle() is now replaced by sidebarVisible = !sidebarVisible in the template
}
