import { Connection, Schema } from 'mongoose';
import { AutoIncrementConfigOptions } from '../@types/auto-increment-config-options';
import { AutoIncrementFieldType } from '../@types/auto-increment-field';

const getAutoIncrementFieldValue = (args: {
  counter: number;
  prefix: string;
  suffix: string;
  fieldType: AutoIncrementFieldType;
}) => {
  if (args.fieldType === AutoIncrementFieldType.Number) {
    return args.counter;
  }
  if (args.fieldType === AutoIncrementFieldType.String) {
    return args.prefix + args.counter + args.suffix + '';
  }
  return args.counter;
};

const autoIncrementPlugin = async (
  connection: Connection,
  configOptions: AutoIncrementConfigOptions,
) => {
  const isExist = await connection.collection('counters').findOne({
    fieldName: configOptions.fieldName,
    collectionName: configOptions.collectionName,
  });
  if (isExist && isExist.start !== configOptions.start) {
    await connection.collection('counters').updateOne(
      {
        fieldName: configOptions.fieldName,
        collectionName: configOptions.collectionName,
      },
      { $set: { start: configOptions.start, counter: configOptions.start } },
    );
  }
  if (!isExist) {
    connection.collection('counters').insertOne({
      fieldName: configOptions.fieldName,
      collectionName: configOptions.collectionName,
      start: configOptions.start,
      counter: configOptions.start,
      prefix: configOptions.prefix,
      suffix: configOptions.suffix,
      incrementBy: configOptions.incrementBy,
      fieldType: configOptions.fieldType,
    });
  }
  return function (schema: Schema) {
    schema.pre('save', async function (next: any) {
      console.log(this);
      if (this.isNew) {
        const doc = await connection.collection('counters').findOneAndUpdate(
          {
            fieldName: configOptions.fieldName,
            collectionName: configOptions.collectionName,
          },
          {
            $inc: { counter: configOptions.incrementBy },
          },
        );
        this.set(
          configOptions.fieldName,
          getAutoIncrementFieldValue({
            counter: doc.value.counter,
            prefix: configOptions.prefix,
            suffix: configOptions.suffix,
            fieldType: configOptions.fieldType,
          }),
        );
        next();
      }
    });
  };
};

export { autoIncrementPlugin };
