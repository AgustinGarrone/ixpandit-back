import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Root health probe',
    description: 'Simple text endpoint to verify that the API process is running.',
  })
  @ApiOkResponse({
    type: String,
    description: 'Plain text greeting',
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
