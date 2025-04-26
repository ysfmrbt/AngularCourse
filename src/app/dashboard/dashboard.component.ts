import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { TimelineModule } from 'primeng/timeline';
import { RippleModule } from 'primeng/ripple';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChartModule } from 'primeng/chart';

// Services
import { MemberService } from 'src/services/member.service';
import { EventService } from 'src/services/event.service';
import { PubService } from 'src/services/pub.service';
import { ThemeService } from 'src/app/services/theme.service';

// Models
import { Member } from 'src/models/Member';
import { Event } from 'src/models/Event';
import { Pub } from 'src/models/Pub';
import { forkJoin } from 'rxjs';

interface Activity {
  title: string;
  date: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TimelineModule,
    RippleModule,
    RouterModule,
    ProgressSpinnerModule,
    ChartModule,
  ],
})
export class DashboardComponent implements OnInit {
  // Data properties
  members: Member[] = [];
  events: Event[] = [];
  publications: Pub[] = [];

  // UI state
  loading = true;
  isDarkTheme = true;

  // Dashboard metrics
  memberCount = 0;
  upcomingEventsCount = 0;
  publicationsCount = 0;

  // Dynamic activities
  activities: Activity[] = [];

  // Chart data
  memberTypeChart: any;
  eventTimelineChart: any;
  publicationTypeChart: any;
  monthlyActivityChart: any;

  // Chart options
  chartOptions: any;

  constructor(
    private memberService: MemberService,
    private eventService: EventService,
    private pubService: PubService,
    private router: Router,
    private themeService: ThemeService
  ) {
    // Use effect to react to theme changes
    effect(() => {
      // Get current theme from signal
      const currentTheme = this.themeService.currentTheme$();
      this.isDarkTheme = currentTheme === 'dark';
      this.initChartOptions();

      // Refresh charts if they exist
      if (this.members.length > 0) {
        this.createMemberTypeChart();
        this.createEventTimelineChart();
        this.createPublicationTypeChart();
        this.createMonthlyActivityChart();
      }
    });

    this.initChartOptions();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    // Use forkJoin to fetch all data in parallel
    forkJoin({
      members: this.memberService.getAllMembers(),
      events: this.eventService.getAllEvents(),
      publications: this.pubService.getAllPubs(),
    }).subscribe({
      next: (results) => {
        this.members = results.members;
        this.events = results.events;
        this.publications = results.publications;

        // Calculate metrics
        this.memberCount = this.members.length;

        // Count upcoming events (events with date_debut in the future)
        const today = new Date();
        this.upcomingEventsCount = this.events.filter((event) => {
          const eventDate = new Date(event.date_debut);
          return eventDate >= today;
        }).length;

        this.publicationsCount = this.publications.length;

        // Generate dynamic activities
        this.generateActivities();

        // Generate chart data
        this.createMemberTypeChart();
        this.createEventTimelineChart();
        this.createPublicationTypeChart();
        this.createMonthlyActivityChart();

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      },
    });
  }

  generateActivities(): void {
    this.activities = [];

    // Add recent members (up to 2)
    const recentMembers = [...this.members]
      .sort(
        (a, b) =>
          new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
      )
      .slice(0, 2);

    recentMembers.forEach((member) => {
      this.activities.push({
        title: 'New Member Joined',
        date: this.formatDate(member.createDate),
        description: `${
          member.nom
        } has joined the lab as a ${member.type.toLowerCase()}.`,
        icon: 'pi pi-user-plus',
      });
    });

    // Add upcoming events (up to 2)
    const today = new Date();
    const upcomingEvents = [...this.events]
      .filter((event) => new Date(event.date_debut) >= today)
      .sort(
        (a, b) =>
          new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime()
      )
      .slice(0, 2);

    upcomingEvents.forEach((event) => {
      this.activities.push({
        title: 'Upcoming Event',
        date: this.formatDate(event.date_debut),
        description: `"${event.titre}" will take place at ${event.lieu}.`,
        icon: 'pi pi-calendar',
      });
    });

    // Add recent publications (up to 2)
    const recentPublications = [...this.publications]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 2);

    recentPublications.forEach((pub) => {
      this.activities.push({
        title: 'Article Published',
        date: this.formatDate(pub.date),
        description: `New ${pub.type.toLowerCase()} article "${
          pub.titre
        }" has been published.`,
        icon: 'pi pi-book',
      });
    });

    // Sort activities by date (most recent first)
    this.activities.sort((a, b) => {
      return (
        this.getDateFromFormattedString(b.date).getTime() -
        this.getDateFromFormattedString(a.date).getTime()
      );
    });
  }

  formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return (
        'Today, ' +
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    } else if (diffDays === 1) {
      return (
        'Yesterday, ' +
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    } else if (diffDays < 7) {
      return diffDays + ' days ago';
    } else if (diffDays < 30) {
      return Math.floor(diffDays / 7) + ' weeks ago';
    } else {
      return date.toLocaleDateString();
    }
  }

  getDateFromFormattedString(formattedDate: string): Date {
    // Handle different format patterns
    if (formattedDate.startsWith('Today')) {
      return new Date();
    } else if (formattedDate.startsWith('Yesterday')) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    } else if (formattedDate.includes('days ago')) {
      const daysAgo = parseInt(formattedDate.split(' ')[0]);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      return date;
    } else if (formattedDate.includes('weeks ago')) {
      const weeksAgo = parseInt(formattedDate.split(' ')[0]);
      const date = new Date();
      date.setDate(date.getDate() - weeksAgo * 7);
      return date;
    } else {
      // Try to parse as a regular date
      return new Date(formattedDate);
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  // Initialize chart options
  initChartOptions(): void {
    // Set colors based on current theme
    const textColor = this.isDarkTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)';
    const gridColor = this.isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const tooltipBgColor = this.isDarkTheme ? 'rgba(42, 42, 64, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    const tooltipTextColor = this.isDarkTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)';
    const tooltipTitleColor = this.isDarkTheme ? '#ffffff' : '#000000';
    const tooltipBorderColor = this.isDarkTheme ? 'rgba(94, 136, 245, 0.8)' : 'rgba(94, 136, 245, 0.5)';

    // Common options for all charts
    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor,
            font: {
              weight: 'bold',
              size: 12
            },
            padding: 15
          },
          position: 'top',
          align: 'center'
        },
        tooltip: {
          backgroundColor: tooltipBgColor,
          titleColor: tooltipTitleColor,
          bodyColor: tooltipTextColor,
          borderColor: tooltipBorderColor,
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          titleFont: {
            size: 13,
            weight: 'bold'
          },
          bodyFont: {
            size: 12
          },
          callbacks: {
            // Format the tooltip label with more readable text
            label: function(context: any) {
              let label = '';
              let value = '';

              // For pie/doughnut charts, use the label from the data
              if (context.chart.config.type === 'pie' || context.chart.config.type === 'doughnut') {
                // Get the label from the raw data if available
                if (context.raw && context.raw.label) {
                  label = context.raw.label;
                } else {
                  // Fallback to the dataset label
                  label = context.label || '';
                }

                // Get the value
                if (context.raw && context.raw.value !== undefined) {
                  value = context.raw.value;
                } else if (typeof context.parsed === 'number') {
                  value = context.parsed;
                } else {
                  value = context.formattedValue || '';
                }

                return label + ': ' + value;
              }
              // For other chart types (bar, line)
              else {
                label = context.dataset.label || '';

                // Handle different chart types
                if (context.parsed.y !== undefined) {
                  // For bar, line charts
                  value = context.parsed.y;
                } else if (context.parsed.r !== undefined) {
                  // For bubble charts
                  value = context.parsed.r;
                } else {
                  // Fallback
                  value = context.formattedValue || context.raw || '';
                }

                return label + ': ' + value;
              }
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColor,
            font: {
              size: 11
            }
          },
          grid: {
            color: gridColor,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColor,
            font: {
              size: 11
            }
          },
          grid: {
            color: gridColor,
            drawBorder: false
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuad'
      },
      responsive: true,
      maintainAspectRatio: false
    };
  }

  // Create member type distribution chart
  createMemberTypeChart(): void {
    // Count members by type
    const memberTypes = new Map<string, number>();

    this.members.forEach(member => {
      const type = member.type || 'Unknown';
      memberTypes.set(type, (memberTypes.get(type) || 0) + 1);
    });

    // Prepare chart data
    const labels = Array.from(memberTypes.keys());
    const data = Array.from(memberTypes.values());

    // Create data objects with label and value for better tooltip handling
    const formattedData = data.map((value, index) => ({
      value: value,
      label: labels[index]
    }));

    this.memberTypeChart = {
      labels: labels,
      datasets: [
        {
          data: formattedData,
          backgroundColor: [
            'rgba(94, 136, 245, 0.9)',   // Blue
            'rgba(79, 193, 157, 0.9)',   // Green
            'rgba(250, 160, 95, 0.9)',   // Orange
            'rgba(153, 102, 255, 0.9)',  // Purple
            'rgba(255, 99, 132, 0.9)'    // Pink
          ],
          hoverBackgroundColor: [
            'rgba(94, 136, 245, 1)',
            'rgba(79, 193, 157, 1)',
            'rgba(250, 160, 95, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderColor: 'rgba(42, 42, 64, 0.2)',
          borderWidth: 1,
          parsing: {
            key: 'value'
          }
        }
      ]
    };
  }

  // Create event timeline chart
  createEventTimelineChart(): void {
    // Get upcoming events and sort by date
    const today = new Date();
    const upcomingEvents = [...this.events]
      .filter(event => new Date(event.date_debut) >= today)
      .sort((a, b) => new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime())
      .slice(0, 5); // Limit to 5 events

    // Prepare chart data
    const labels = upcomingEvents.map(event => event.titre);
    const data = upcomingEvents.map(event => {
      // Calculate days until event
      const eventDate = new Date(event.date_debut);
      const diffTime = Math.abs(eventDate.getTime() - today.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
    });

    this.eventTimelineChart = {
      labels: labels,
      datasets: [
        {
          label: 'Days Until Event',
          data: data,
          backgroundColor: 'rgba(79, 193, 157, 0.8)',  // Green
          borderColor: 'rgba(79, 193, 157, 1)',
          borderWidth: 1,
          borderRadius: 6,
          barThickness: 20
        }
      ]
    };
  }

  // Create publication type chart
  createPublicationTypeChart(): void {
    // Count publications by type
    const pubTypes = new Map<string, number>();

    this.publications.forEach(pub => {
      const type = pub.type || 'Unknown';
      pubTypes.set(type, (pubTypes.get(type) || 0) + 1);
    });

    // Prepare chart data
    const labels = Array.from(pubTypes.keys());
    const data = Array.from(pubTypes.values());

    // Create data objects with label and value for better tooltip handling
    const formattedData = data.map((value, index) => ({
      value: value,
      label: labels[index]
    }));

    this.publicationTypeChart = {
      labels: labels,
      datasets: [
        {
          data: formattedData,
          backgroundColor: [
            'rgba(255, 99, 132, 0.9)',   // Pink
            'rgba(94, 136, 245, 0.9)',   // Blue
            'rgba(250, 160, 95, 0.9)',   // Orange
            'rgba(79, 193, 157, 0.9)',   // Green
            'rgba(153, 102, 255, 0.9)'   // Purple
          ],
          hoverBackgroundColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(94, 136, 245, 1)',
            'rgba(250, 160, 95, 1)',
            'rgba(79, 193, 157, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderColor: 'rgba(42, 42, 64, 0.2)',
          borderWidth: 1,
          parsing: {
            key: 'value'
          }
        }
      ]
    };
  }

  // Create monthly activity chart
  createMonthlyActivityChart(): void {
    // Get the last 6 months
    const months: string[] = [];

    // Use sample data directly for demonstration
    const memberCounts = [1, 0, 1, 2, 1, 0];
    const eventCounts = [0, 0, 0, 3, 6, 2];
    const pubCounts = [0, 0, 1, 0, 3, 1];

    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      months.push(monthName);
    }

    // In a real application, we would count actual data here
    // For now, we're using the sample data defined above

    this.monthlyActivityChart = {
      labels: months,
      datasets: [
        {
          label: 'New Members',
          data: memberCounts,
          fill: false,
          borderColor: 'rgba(94, 136, 245, 1)',  // Blue
          backgroundColor: 'rgba(94, 136, 245, 0.1)',
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: 'rgba(94, 136, 245, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(94, 136, 245, 1)',
          pointRadius: 4
        },
        {
          label: 'Events',
          data: eventCounts,
          fill: false,
          borderColor: 'rgba(79, 193, 157, 1)',  // Green
          backgroundColor: 'rgba(79, 193, 157, 0.1)',
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: 'rgba(79, 193, 157, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(79, 193, 157, 1)',
          pointRadius: 4
        },
        {
          label: 'Publications',
          data: pubCounts,
          fill: false,
          borderColor: 'rgba(255, 99, 132, 1)',  // Pink
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: 'rgba(255, 99, 132, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
          pointRadius: 4
        }
      ]
    };
  }
}
