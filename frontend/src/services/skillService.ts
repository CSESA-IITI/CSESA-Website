import apiClient from '../apiClient';

export interface Skill {
  name: string;
}

class SkillService {
  async getAllSkills(): Promise<Skill[]> {
    const response = await apiClient.get('/skills/');
    return response.data;
  }

  async updateUserSkills(skillNames: string[]): Promise<any> {
    const response = await apiClient.patch('/profile/', {
      skill_names: skillNames
    });
    return response.data;
  }
}

export default new SkillService();