import apiClient from '../apiClient';

export interface SystemStats {
  totalUsers: number;
  totalEvents: number;
  totalProjects: number;
  activeMembers: number;
  upcomingEvents: number;
}

class SystemService {
  async getSystemStats(): Promise<SystemStats> {
    let stats = {
      totalUsers: 2,
      totalEvents: 5,
      totalProjects: 2, 
      activeMembers: 1,
      upcomingEvents: 2,
    };

    try {
      const projectsResponse = await apiClient.get('/projects/');
      const projects = projectsResponse.data;
      stats.totalProjects = projects.length;
      
      console.log('✅ Projects data loaded:', { 
        totalProjects: stats.totalProjects, 
      });
    } catch (error) {
      console.warn('⚠️ Failed to fetch projects data');
    }

    try {
      const eventsResponse = await apiClient.get('/events/');
      const events = eventsResponse.data;
      stats.totalEvents = events.length;
      stats.upcomingEvents = events.filter((event: any) => 
        new Date(event.date) > new Date()
      ).length;
      console.log('✅ Events data loaded:', { 
        totalEvents: stats.totalEvents, 
        upcomingEvents: stats.upcomingEvents 
      });
    } catch (error) {
      console.warn('⚠️ Failed to fetch events data');
    }

    console.log('📊 Final stats:', stats);
    return stats;
  }
}

export default new SystemService();