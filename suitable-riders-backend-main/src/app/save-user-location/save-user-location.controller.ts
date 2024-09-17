import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Post,
  Version,
} from '@nestjs/common';
import { ApiBody, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommonApiResponses } from '../common/decorators/common-sagger.decorator';
import { Public } from '../common/decorators/public-route.decorator';
import { GetUser } from '../common/decorators/user-param.decorator';
import { UserPayload } from '../jwt/@types/user-payload.interface';
import {
  SaveUserLocationDemoReqDTO,
  SaveUserLocationDemoResDTO,
} from './dto/save-user-location-demo.dto';
import {
  SaveUserLocationReqDTO,
  SaveUserLocationResDTO,
} from './dto/save-user-location.dto';
import { SaveUserLocationServices } from './save-user-location.service';

/**
 * Controller of save user location
 */
@Controller({ path: 'api/driverLocation', version: ['0', '1'] })
export class SaveUserLocationController {
  constructor(private saveUserLocationService: SaveUserLocationServices) {}

  /**
   *  Save user location
   */
  @Version('0')
  @Post('/')
  @ApiTags('Save Driver Location')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiBody({ type: SaveUserLocationReqDTO })
  @ApiResponse({ status: HttpStatus.OK, type: SaveUserLocationResDTO })
  @CommonApiResponses()
  public async saveLocation(
    @Body() dto: SaveUserLocationReqDTO,
    @GetUser() user: UserPayload,
  ) {
    return this.saveUserLocationService.saveLocation(dto, user);
  }

  /**
   * Save driver location (Test api)
   */
  @Version('0')
  @Public()
  @Post('/:id')
  @ApiTags('Save Driver Location')
  @ApiBody({ type: SaveUserLocationDemoReqDTO })
  @ApiResponse({ status: HttpStatus.OK, type: SaveUserLocationDemoResDTO })
  @CommonApiResponses()
  public async saveDriverLocationTest(
    @Param('id') id: string,
    @Body() dto: SaveUserLocationDemoReqDTO,
  ) {
    return this.saveUserLocationService.saveDriverLocationTest(id, dto);
  }

  /**
   * Save driver location logs API
   */
  @Version('0')
  @Public()
  @Post('/location-logs/:id')
  @ApiTags('Save Driver Location')
  public async getLocationLogs(@Param('id') id: string) {
    return this.saveUserLocationService.getLocationLogs(id);
  }
}
