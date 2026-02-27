import { NextResponse } from 'next/server';

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400, details?: string) {
  return NextResponse.json({ error: message, ...(details && { details }) }, { status });
}

export function validationError(field: string, message: string) {
  return NextResponse.json({ error: message, field }, { status: 400 });
}

export function unauthorizedError(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenError(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFoundError(resource = 'Resource') {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 });
}

export function serverError(message = 'Internal server error') {
  return NextResponse.json({ error: message }, { status: 500 });
}
