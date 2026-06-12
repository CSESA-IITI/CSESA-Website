import emailjs from '@emailjs/browser';
import apiClient from '../apiClient';

//emailjs config
const EMAILJS_SERVICE_ID='champion';                   
const EMAILJS_TEMPLATE_ID='template_76685bz';                  
const EMAILJS_CONFIRMATION_TEMPLATE_ID='template_25udj3d';     
const EMAILJS_PUBLIC_KEY='YW4ANa9ILQPP4J7Fo';                   

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

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:  formData.name,
          from_email: formData.email,
          phone:      formData.phone || 'Not provided',
          subject:    formData.subject || 'No subject',
          message:    formData.message,
        },
        EMAILJS_PUBLIC_KEY
      );
    } catch (emailError) {
      console.error('EmailJS notification failed:', emailError);
    }

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_CONFIRMATION_TEMPLATE_ID,
        {
          from_name:  formData.name,
          from_email: formData.email,
          message:    formData.message,
        },
        EMAILJS_PUBLIC_KEY
      );
    } catch (emailError) {
      console.error('EmailJS confirmation failed:', emailError);
    }

    return response.data;
  }
}

export default new ContactService();