import { AppError } from '../../../shared/errors/app-error.js';
import { CustomerRepository } from '../repositories/customer.repository.js';
import type { CreateCustomerInput, UpdateCustomerInput } from '../validators/customer.schema.js';

export class CustomerService {
  constructor(private readonly customerRepository = new CustomerRepository()) {}

  list() {
    return this.customerRepository.list();
  }

  async create(input: CreateCustomerInput) {
    return this.customerRepository.create(input);
  }

  async update(id: string, input: UpdateCustomerInput) {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new AppError('Cliente não encontrado', 404, 'CUSTOMER_NOT_FOUND');
    }

    return this.customerRepository.update(id, input);
  }

  async archive(id: string) {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new AppError('Cliente não encontrado', 404, 'CUSTOMER_NOT_FOUND');
    }

    return this.customerRepository.archive(id);
  }
}
