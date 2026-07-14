import { AppError } from '../../../shared/errors/app-error.js';
import { ProductRepository } from '../repositories/product.repository.js';
import type { CreateProductInput, UpdateProductInput } from '../validators/product.schema.js';

export class ProductService {
  constructor(private readonly productRepository = new ProductRepository()) {}

  list() {
    return this.productRepository.list();
  }

  async create(input: CreateProductInput) {
    return this.productRepository.create(input);
  }

  async update(id: string, input: UpdateProductInput) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');
    }

    return this.productRepository.update(id, input);
  }

  async archive(id: string) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');
    }

    return this.productRepository.archive(id);
  }
}
