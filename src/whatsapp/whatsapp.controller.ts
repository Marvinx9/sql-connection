import { Controller, Post, Body } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('send')
  async sendMessage(
    @Body('to') to: string,
    @Body('message') message: string,
  ): Promise<any> {
    return this.whatsappService.sendMessage(to, message);
  }
}
