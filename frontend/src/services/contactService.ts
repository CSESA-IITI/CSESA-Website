import apiClient from '../apiClient';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface ContactResponse {
  message: string;
  success: boolean;
}

class ContactService {
  async submitContactForm(formData: ContactFormData): Promise<ContactResponse> {
    const response = await apiClient.post('/contact/', {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '',
      subject: formData.subject || '',
      message: formData.message,
    });
    return response.data;
  }
}

export default new ContactService();