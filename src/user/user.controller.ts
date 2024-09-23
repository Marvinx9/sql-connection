import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return await this.userService.findUserById(id);
  }

  @Post()
  async createUser(
    @Body() body: { name: string; email: string; password: string },
  ) {
    return await this.userService.createUser(
      body.name,
      body.email,
      body.password,
    );
  }
}
