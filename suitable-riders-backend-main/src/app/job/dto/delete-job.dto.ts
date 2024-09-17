import { ApiResponseProperty } from '@nestjs/swagger';

/**
 * Create class to represent the delete a job schema
 */
export class DeleteJobResDTO {
  @ApiResponseProperty()
  deleted: boolean;
}
