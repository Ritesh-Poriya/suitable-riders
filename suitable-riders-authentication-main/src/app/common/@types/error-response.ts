import { ApiProperty } from '@nestjs/swagger';

class ErrorEntity {
  @ApiProperty()
  message: string;
}

export class ErrorResponse {
  @ApiProperty({ type: [ErrorEntity] })
  errors: {
    message: string;
  }[];
  @ApiProperty()
  statusCode: number;
}
