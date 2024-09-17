import { environment as devEnvironment } from './dev/environment';
import { environment as prodEnvironment } from './prod/environment';
import { environment as localEnvironment } from './local/environment';
import { environment as testEnvironment } from './test/environment';
import { IEnvironmentConfigType } from './IEnvironmentConfigType';

let environment: IEnvironmentConfigType;

if (process.env.NODE_ENV === 'prod') {
  environment = prodEnvironment;
} else if (process.env.NODE_ENV === 'test') {
  environment = testEnvironment;
} else if (process.env.NODE_ENV === 'local') {
  environment = localEnvironment;
} else {
  environment = devEnvironment;
}

export { environment };
