import { AppError } from '../../../shared/errors/app-error.js';
import { CategoryRepository } from '../repositories/category.repository.js';
import type { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.schema.js';

export class CategoryService {
  constructor(private readonly categoryRepository = new CategoryRepository()) {}

  list() {
    return this.categoryRepository.list();
  }

  async create(input: CreateCategoryInput) {
    return this.categoryRepository.create(input);
  }

  async update(id: string, input: UpdateCategoryInput) {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new AppError('Categoria não encontrada', 404, 'CATEGORY_NOT_FOUND');
    }

    return this.categoryRepository.update(id, input);
  }

  async archive(id: string) {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new AppError('Categoria não encontrada', 404, 'CATEGORY_NOT_FOUND');
    }

    return this.categoryRepository.archive(id);
  }
}
