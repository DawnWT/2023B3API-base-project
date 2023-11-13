import { Request, Response, NextFunction } from 'express';
import { appendFile } from 'fs/promises';

export const LoggerMiddleware = async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const ip = req.socket.remoteAddress;
  const date = new Intl.DateTimeFormat('fr').format(Date.now());
  const paramsString = Object.entries(req.params).reduce(
    (acc, [key, value]) => {
      return acc + `${key}=${value}`;
    },
    '',
  );

  const line = `${ip}|${req.path}|${paramsString}|${date}\n`;
  await appendFile('log.txt', line).catch(console.error);

  next();
};
