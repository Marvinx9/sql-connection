import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class WhatsappService {
  private twilioClient: Twilio;
  private fromNumber: string;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get<string>('TWILIO_WHATSAPP_NUMBER');

    this.twilioClient = new Twilio(accountSid, authToken);
  }

  async sendMessage(to: string, message: string): Promise<any> {
    try {
      const response = await this.twilioClient.messages.create({
        from: this.fromNumber,
        to: `whatsapp:${to}`,
        body: message,
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to send WhatsApp message: ${error.message}`);
    }
  }
}
