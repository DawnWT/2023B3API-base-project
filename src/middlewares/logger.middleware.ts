import { Request, Response, NextFunction } from 'express';
import { appendFile } from 'fs/promises';

export const LoggerMiddleware = async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const ip = req.socket.remoteAddress;

  const date = new Intl.DateTimeFormat('fr', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(Date.now());

  const paramsList = Object.entries(req.query).map(
    ([key, value]) => `${key}=${value}`,
  );

  paramsList.push(
    ...Object.entries(req.body).map(([key, value]) => `${key}=${value}`),
  );

  const paramsString = paramsList.join(',');

  const line = `${ip}|${req.path}|${paramsString}|${date}\n`;
  await appendFile('log.txt', line).catch(console.error);

  next();
};
