import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Schema as SchemaTypes, Document } from 'mongoose';
/**
 * Declined job by driver Schema
 */
export type DeclinedJobsDocument = DeclinedJobs &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };
@Schema({ timestamps: true, versionKey: false })
export class DeclinedJobs {
  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: 'User',
    require: true,
  })
  driverID: Types.ObjectId;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: 'Job',
    require: true,
  })
  jobID: Types.ObjectId;
}
export const DeclinedJobsSchema = SchemaFactory.createForClass(DeclinedJobs);
