import { PrismaService } from 'src/config/database/prisma.service';

type PrismaModelDelegate = {
  findUnique: (args: { where: { id: string } }) => Promise<unknown>;
  findMany: (args?: { where?: Record<string, unknown> }) => Promise<unknown[]>;
  create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  update: (args: {
    where: { id: string };
    data: Record<string, unknown>;
  }) => Promise<unknown>;
  delete: (args: { where: { id: string } }) => Promise<unknown>;
  count: (args?: { where?: Record<string, unknown> }) => Promise<number>;
};

export abstract class BaseRepository<T> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly model: PrismaModelDelegate,
  ) {}

  findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } }) as Promise<T | null>;
  }

  findAll(where?: Record<string, unknown>): Promise<T[]> {
    return this.model.findMany({ where }) as Promise<T[]>;
  }

  create(data: Record<string, unknown>): Promise<T> {
    return this.model.create({ data }) as Promise<T>;
  }

  update(id: string, data: Record<string, unknown>): Promise<T> {
    return this.model.update({ where: { id }, data }) as Promise<T>;
  }

  delete(id: string): Promise<T> {
    return this.model.delete({ where: { id } }) as Promise<T>;
  }

  count(where?: Record<string, unknown>): Promise<number> {
    return this.model.count({ where });
  }
}
