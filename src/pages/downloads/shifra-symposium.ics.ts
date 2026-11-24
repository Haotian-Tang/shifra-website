import type { APIRoute } from 'astro';
import { agenda } from '../../data/agenda';
import { event } from '../../data/event';
import { siteUrl } from '../../../site.config.mjs';

export const prerender = true;

function escapeText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

function utcDate(value: number): string {
  return new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

// RFC 5545 folds content lines at 75 octets without splitting UTF-8 characters.
function foldLine(value: string): string {
  const encoder = new TextEncoder();
  const lines: string[] = [];
  let line = '';
  let bytes = 0;
  for (const character of value) {
    const length = encoder.encode(character).length;
    if (bytes + length > 75) {
      lines.push(line);
      line = ' ';
      bytes = 1;
    }
    line += character;
    bytes += length;
  }
  lines.push(line);
  return lines.join('\r\n');
}

export const GET: APIRoute = () => {
  const slots = agenda.map(entry => {
    const start = Date.parse(`${event.date}T${entry.start}:00${event.utcOffset}`);
    return { start, end: start + entry.duration * 60_000 };
  });
  const start = Math.min(...slots.map(slot => slot.start));
  const end = Math.max(...slots.map(slot => slot.end));
  const programme = agenda.map(entry => {
    const [hour, minute] = entry.start.split(':').map(Number);
    const endMinutes = hour * 60 + minute + entry.duration;
    const slotEnd = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
    return [
      `${entry.start}–${slotEnd}: ${entry.title}`,
      entry.speaker,
      entry.notes,
    ].filter(Boolean).join(' · ');
  }).join('\n');
  const description = [
    `${event.name}: ${event.theme}`,
    event.introduction,
    `Event times are shown in ${event.timezoneLabel}.`,
    `Programme and registration: ${siteUrl}`,
    `Location map: ${event.mapsUrl}`,
    `Programme (${event.timezoneLabel}):\n${programme}`,
    'Please register on the website; adding this event to your calendar does not register you.',
  ].join('\n\n');
  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SHIFRA//Symposium Calendar//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:shifra-symposium-${event.date.replace(/-/g, '')}@shifra.ae`,
    `DTSTAMP:${utcDate(Date.now())}`,
    `DTSTART:${utcDate(start)}`,
    `DTEND:${utcDate(end)}`,
    `SUMMARY:${escapeText(`${event.name} — ${event.theme}`)}`,
    `LOCATION:${escapeText(`${event.venue}, ${event.institution}, ${event.city}`)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${siteUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].map(foldLine).join('\r\n') + '\r\n';

  return new Response(calendar, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="shifra-symposium.ics"',
    },
  });
};
