import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

/**
 * Tareas programadas.
 *
 * La purga de carritos no es limpieza opcional: la Ley 1581 exige que la
 * conservacion de datos tenga un limite justificado, y 90 dias es el que se
 * declara. Si este cron deja de correr, la promesa deja de cumplirse.
 */
const crons = cronJobs();

crons.daily(
  "purgar carritos abandonados",
  { hourUTC: 7, minuteUTC: 0 }, // 02:00 en Colombia
  internal.carritos.purgarAntiguos,
);

export default crons;
