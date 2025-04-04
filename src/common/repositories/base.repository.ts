import { PrismaClient } from '.prisma/client';

export abstract class BaseRepository<T> {
  constructor(protected readonly prisma: PrismaClient) {}

  abstract findById(id: string): Promise<T | null>;
  abstract findAll(): Promise<T[]>;
  abstract create(data: any): Promise<T>;
  abstract update(id: string, data: any): Promise<T>;
  abstract delete(id: string): Promise<T>;

  protected handleError(error: any): never {
    throw error;
  }
}
