import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import 'winston-daily-rotate-file';
import moment from 'moment';

export const winstonConfig = {
  format: format.combine(
    format.colorize(),
    format.timestamp({}),
    format.json(),
    format.printf((info: any) => {
      const { timestamp, level, message, ...args } = info;
      const time = moment(new Date(timestamp)).format('YYYY-MM-DD HH:mm:ss');
      const msg =
        typeof message === 'string'
          ? message
          : JSON.stringify(message, null, 2);
      const argText = Object.keys(args).length
        ? 'Log Args: ' + JSON.stringify(args, null, 2)
        : '';
      return `${time} [${level}]: ${msg} ${argText}`;
    }),
  ),
  transports: [
    new transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD-HH',
    }),
    new transports.DailyRotateFile({
      filename: 'logs/debug-%DATE%.log',
      level: 'debug',
      datePattern: 'YYYY-MM-DD-HH',
    }),
    new transports.DailyRotateFile({
      filename: 'logs/requests-%DATE%.log',
      level: 'verbose',
      datePattern: 'YYYY-MM-DD-HH',
    }),
    new transports.Console({}),
  ],
  levels: {
    verbose: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 5,
  },
};

export default WinstonModule.createLogger(winstonConfig);
